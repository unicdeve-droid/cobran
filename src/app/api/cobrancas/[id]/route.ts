import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

const TOGGLE_FIELDS = [
  'mostrarRazaoSocial',
  'mostrarCnpj',
  'mostrarDataAbertura',
  'mostrarCep',
  'mostrarNomeCompleto',
  'mostrarCpf',
  'mostrarDataNascimento',
] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const cobranca = await prisma.cobranca.findUnique({
    where: { id: params.id },
    include: { dividas: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] } },
  });

  if (!cobranca) {
    return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
  }

  return NextResponse.json(cobranca);
}

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

    if (!body.razaoSocial || !body.cnpj || !body.nomeCompleto) {
      return NextResponse.json(
        { error: 'Razão social, CNPJ e nome completo são obrigatórios.' },
        { status: 400 }
      );
    }

    const toggles: Record<string, boolean> = {};
    for (const field of TOGGLE_FIELDS) {
      if (body[field] !== undefined) toggles[field] = Boolean(body[field]);
    }

    const cobranca = await prisma.cobranca.update({
      where: { id: params.id },
      data: {
        razaoSocial: body.razaoSocial,
        cnpj: body.cnpj,
        dataAbertura: body.dataAbertura ? new Date(body.dataAbertura) : null,
        cep: body.cep || null,
        nomeCompleto: body.nomeCompleto,
        cpf: body.cpf || null,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        email: body.email || null,
        telefone: body.telefone || null,
        qrCodeUrl: body.qrCodeUrl || null,
        pixCopiaECola: body.pixCopiaECola || null,
        boletoUrl: body.boletoUrl || null,
        ativo: body.ativo === undefined ? undefined : Boolean(body.ativo),
        ...toggles,
      },
      include: { dividas: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] } },
    });

    return NextResponse.json(cobranca);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
    }
    console.error('Erro ao atualizar cobrança:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar cobrança.' },
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
    await prisma.cobranca.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Cobrança não encontrada.' }, { status: 404 });
    }
    console.error('Erro ao excluir cobrança:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir cobrança.' },
      { status: 500 }
    );
  }
}
