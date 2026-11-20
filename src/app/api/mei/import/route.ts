import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseMeiCsv } from '@/lib/csv';

const BATCH_SIZE = 1000;

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

    const fileName = (file as File).name || 'arquivo.csv';
    const text = await file.text();
    const { rows, erros } = parseMeiCsv(text);

    if (rows.length === 0) {
      return NextResponse.json({
        arquivo: fileName,
        totalLinhas: 0,
        inseridos: 0,
        ignorados: 0,
        erros,
      });
    }

    let inseridos = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const result = await prisma.meiLead.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inseridos += result.count;
    }

    return NextResponse.json({
      arquivo: fileName,
      totalLinhas: rows.length,
      inseridos,
      ignorados: rows.length - inseridos,
      erros,
    });
  } catch (error) {
    console.error('Erro ao importar CSV de MEI:', error);
    return NextResponse.json(
      { error: 'Erro interno ao importar o arquivo.' },
      { status: 500 }
    );
  }
}
