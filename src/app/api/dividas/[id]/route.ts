import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status === 'pago' ? 'pago' : 'aberto';
    if (body.mes !== undefined) data.mes = parseInt(body.mes, 10);
    if (body.ano !== undefined) data.ano = parseInt(body.ano, 10);
    if (body.valor !== undefined) data.valor = parseFloat(body.valor);

    const divida = await prisma.divida.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(divida);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Dívida não encontrada.' }, { status: 404 });
    }
    console.error('Erro ao atualizar dívida:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar dívida.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    await prisma.divida.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Dívida não encontrada.' }, { status: 404 });
    }
    console.error('Erro ao excluir dívida:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir dívida.' },
      { status: 500 }
    );
  }
}
