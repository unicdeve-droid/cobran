import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { gerarEmailHtml } from '@/lib/email-template';
import { formatCurrency, formatDate } from '@/lib/utils';

const LIMITE_MAXIMO = 100000;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const de = Math.max(1, parseInt(body.de, 10) || 1);
    const ate = Math.max(de, parseInt(body.ate, 10) || de);

    if (ate - de + 1 > LIMITE_MAXIMO) {
      return NextResponse.json(
        { error: `Intervalo grande demais. Máximo de ${LIMITE_MAXIMO.toLocaleString('pt-BR')} por vez.` },
        { status: 400 }
      );
    }

    const [cobrancas, config] = await Promise.all([
      prisma.cobranca.findMany({
        where: { numero: { gte: de, lte: ate } },
        orderBy: { numero: 'asc' },
        include: { dividas: true },
      }),
      getConfig(),
    ]);

    if (cobrancas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma cobrança encontrada nesse intervalo de número.' },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    const zip = new AdmZip();
    const semDivida: number[] = [];
    let gerados = 0;

    for (const cobranca of cobrancas) {
      const abertas = cobranca.dividas.filter((d: any) => d.status === 'aberto');
      if (abertas.length === 0) {
        semDivida.push(cobranca.numero);
        continue;
      }

      const valorTotal = abertas.reduce((soma: number, d: any) => soma + Number(d.valor), 0);

      const maisRecente = [...abertas].sort(
        (a: any, b: any) => a.ano - b.ano || a.mes - b.mes
      )[abertas.length - 1];
      const vencimento = new Date(Date.UTC(maisRecente.ano, maisRecente.mes - 1, 20));

      const linkPagamento = `${baseUrl}/cobranca/${cobranca.uuid}`;
      const linkGuia = cobranca.boletoUrl
        ? `${baseUrl}${cobranca.boletoUrl}`
        : `${baseUrl}/cobranca/${cobranca.uuid}/guia`;

      const html = gerarEmailHtml(
        config,
        {
          cnpj: cobranca.cnpj,
          nome: cobranca.nomeCompleto,
          valor: formatCurrency(valorTotal),
          vencimento: formatDate(vencimento),
          linkPagamento,
          linkGuia,
        },
        baseUrl
      );

      zip.addFile(`${cobranca.numero}_email.html`, Buffer.from(html, 'utf-8'));
      gerados++;
    }

    const resumoLinhas = [
      `Intervalo solicitado: nº ${de} até nº ${ate}`,
      `Cobranças encontradas nesse intervalo: ${cobrancas.length}`,
      `Emails gerados: ${gerados}`,
      `Puladas por não ter dívida em aberto: ${semDivida.length}`,
    ];
    if (semDivida.length > 0) {
      resumoLinhas.push('', 'Números pulados (sem dívida em aberto):', semDivida.join(', '));
    }
    zip.addFile('0_RESUMO.txt', Buffer.from(resumoLinhas.join('\n'), 'utf-8'));

    if (gerados === 0) {
      return NextResponse.json(
        { error: 'Nenhuma cobrança do intervalo tem dívida em aberto — nada foi gerado.' },
        { status: 400 }
      );
    }

    const zipBuffer = zip.toBuffer();
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="emails_cobranca_${de}_a_${ate}.zip"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar emails em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar os emails.' },
      { status: 500 }
    );
  }
}
