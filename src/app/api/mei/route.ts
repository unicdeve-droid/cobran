import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildMeiWhere } from '@/lib/mei-filters';
import { formatCnpj, formatCpf } from '@/lib/csv';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const perPage = Math.min(200, Math.max(1, parseInt(searchParams.get('perPage') || '25', 10)));
  const where = buildMeiWhere(searchParams);

  const [data, totalFiltrado, totalGeral] = await Promise.all([
    prisma.meiLead.findMany({
      where,
      orderBy: { numero: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.meiLead.count({ where }),
    prisma.meiLead.count(),
  ]);

  // Resolve nome do município só para os códigos presentes nesta página (evita N+1).
  const pares = Array.from(new Set(data.map((d) => `${d.municipioCodigo}|${d.uf}`))).map((s) => {
    const [codigo, uf] = s.split('|');
    return { codigo, uf };
  });

  const municipios = pares.length
    ? await prisma.municipio.findMany({ where: { OR: pares } })
    : [];
  const nomesPorChave = new Map(municipios.map((m) => [`${m.codigo}|${m.uf}`, m.nome]));

  const dataComNomes = data.map((lead) => ({
    ...lead,
    cnpjFormatado: formatCnpj(lead.cnpj),
    cpfFormatado: formatCpf(lead.cpf),
    municipioNome: nomesPorChave.get(`${lead.municipioCodigo}|${lead.uf}`) ?? null,
  }));

  return NextResponse.json({
    data: dataComNomes,
    totalFiltrado,
    totalGeral,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(totalFiltrado / perPage)),
  });
}
