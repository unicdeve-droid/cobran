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

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('perPage') || '10', 10)));

  const [data, total] = await Promise.all([
    prisma.cobranca.findMany({
      orderBy: { criadoEm: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        numero: true,
        uuid: true,
        razaoSocial: true,
        cnpj: true,
        nomeCompleto: true,
        ativo: true,
        criadoEm: true,
        _count: { select: { dividas: true } },
      },
    }),
    prisma.cobranca.count(),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  });
}

export async function POST(request: NextRequest) {
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
      toggles[field] = body[field] === undefined ? true : Boolean(body[field]);
    }

    const dividas = Array.isArray(body.dividas)
      ? body.dividas
          .filter((d: any) => d && d.mes && d.ano && d.valor !== undefined && d.valor !== '')
          .map((d: any) => ({
            mes: parseInt(d.mes, 10),
            ano: parseInt(d.ano, 10),
            valor: parseFloat(d.valor),
            status: d.status === 'pago' ? 'pago' : 'aberto',
          }))
      : [];

    const cobranca = await prisma.cobranca.create({
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
        ...toggles,
        dividas: dividas.length > 0 ? { create: dividas } : undefined,
      },
      include: { dividas: true },
    });

    return NextResponse.json(cobranca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar cobrança.' },
      { status: 500 }
    );
  }
}
