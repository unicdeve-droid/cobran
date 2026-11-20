import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import path from 'path';
import { randomUUID } from 'crypto';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/imagekit';

// Extrai o número do início do nome do arquivo: "01_NOMEPDF.pdf" -> 1,
// "19_qualquercoisa.pdf" -> 19. Aceita _ - ou espaço como separador, e
// tolera zeros à esquerda.
function extrairNumero(nomeArquivo: string): number | null {
  const base = path.basename(nomeArquivo);
  const match = /^0*(\d+)[_\-\s]/.exec(base);
  return match ? parseInt(match[1], 10) : null;
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 });
    }
    if (!(file as File).name?.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ error: 'Envie um arquivo .zip.' }, { status: 400 });
    }
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O arquivo .zip precisa ter no máximo 200MB.' },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(bytes);
    const entradas = zip
      .getEntries()
      .filter((e) => !e.isDirectory && e.entryName.toLowerCase().endsWith('.pdf'));

    if (entradas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo .pdf encontrado dentro do .zip.' },
        { status: 400 }
      );
    }

    let anexados = 0;
    const naoEncontrados: { arquivo: string; numero: number }[] = [];
    const naoReconhecidos: string[] = [];

    for (const entrada of entradas) {
      const nomeBase = path.basename(entrada.entryName);
      const numero = extrairNumero(nomeBase);

      if (numero === null) {
        naoReconhecidos.push(nomeBase);
        continue;
      }

      const cobranca = await prisma.cobranca.findFirst({ where: { numero } });
      if (!cobranca) {
        naoEncontrados.push({ arquivo: nomeBase, numero });
        continue;
      }

      const dados = entrada.getData();
      const nomeArquivo = `boleto-${cobranca.numero}-${randomUUID()}.pdf`;
      const url = await uploadFile(dados, nomeArquivo);

      await prisma.cobranca.update({
        where: { id: cobranca.id },
        data: { boletoUrl: url },
      });

      anexados++;
    }

    return NextResponse.json({
      totalArquivos: entradas.length,
      anexados,
      naoEncontrados,
      naoReconhecidos,
    });
  } catch (error) {
    console.error('Erro ao processar lote de boletos:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o .zip. Confira se o arquivo não está corrompido.' },
      { status: 500 }
    );
  }
}
