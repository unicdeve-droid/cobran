import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildMeiWhere } from '@/lib/mei-filters';
import { formatCnpj, formatCpf } from '@/lib/csv';

const LIMITE_MAXIMO = 5000;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const filtros = new URLSearchParams(body.filtros || {});
    const de = Math.max(1, parseInt(body.de, 10) || 1);
    const ate = Math.max(de, parseInt(body.ate, 10) || de);

    // Dívida opcional aplicada igual em todas as cobranças geradas neste lote.
    const valor = body.valor !== undefined && body.valor !== '' ? parseFloat(body.valor) : null;
    const mes = body.mes ? parseInt(body.mes, 10) : null;
    const ano = body.ano ? parseInt(body.ano, 10) : null;
    const qrCodeUrl = body.qrCodeUrl || null;
    const pixCopiaECola = body.pixCopiaECola || null;

    const gerarDivida = valor !== null && !Number.isNaN(valor) && valor > 0;
    if (gerarDivida && (!mes || mes < 1 || mes > 12 || !ano)) {
      return NextResponse.json(
        { error: 'Informe mês (1-12) e ano válidos para a dívida.' },
        { status: 400 }
      );
    }

    const filtrosComIntervalo = new URLSearchParams(filtros);
    filtrosComIntervalo.set('numeroDe', String(de));
    filtrosComIntervalo.set('numeroAte', String(ate));
    const where = buildMeiWhere(filtrosComIntervalo);

    const leads = await prisma.meiLead.findMany({
      where,
      orderBy: { numero: 'asc' },
      take: LIMITE_MAXIMO,
    });

    let gerados = 0;
    let jaTinhamCobranca = 0;

    for (const lead of leads) {
      if (lead.cobrancaId) {
        jaTinhamCobranca++;
        continue;
      }

      const cobranca = await prisma.cobranca.create({
        data: {
          razaoSocial: lead.nome,
          cnpj: formatCnpj(lead.cnpj),
          dataAbertura: lead.dataAbertura,
          cep: lead.cep,
          nomeCompleto: lead.nome,
          cpf: lead.cpf ? formatCpf(lead.cpf) : null,
          dataNascimento: null,
          email: lead.email,
          telefone: lead.telefone,
          mostrarCpf: false,
          mostrarDataNascimento: false,
          qrCodeUrl,
          pixCopiaECola,
          dividas: gerarDivida
            ? { create: [{ mes: mes as number, ano: ano as number, valor: valor as number, status: 'aberto' }] }
            : undefined,
        },
      });

      await prisma.meiLead.update({
        where: { id: lead.id },
        data: { cobrancaId: cobranca.id },
      });

      gerados++;
    }

    return NextResponse.json({
      totalSelecionado: leads.length,
      gerados,
      jaTinhamCobranca,
    });
  } catch (error) {
    console.error('Erro ao gerar cobranças em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar cobranças.' },
      { status: 500 }
    );
  }
}
