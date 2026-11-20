import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const mes = parseInt(body.mes, 10);
    const ano = parseInt(body.ano, 10);
    const valor = parseFloat(body.valor);

    if (!mes || mes < 1 || mes > 12 || !ano || Number.isNaN(valor)) {
      return NextResponse.json(
        { error: 'Informe mês (1-12), ano e valor válidos.' },
        { status: 400 }
      );
    }

    const divida = await prisma.divida.create({
      data: {
        cobrancaId: params.id,
        mes,
        ano,
        valor,
        status: body.status === 'pago' ? 'pago' : 'aberto',
      },
    });

    return NextResponse.json(divida, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2003' || error?.code === 'P2025') {
      return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
    }
    console.error('Erro ao adicionar dívida:', error);
    return NextResponse.json(
      { error: 'Erro interno ao adicionar dívida.' },
      { status: 500 }
    );
  }
}
