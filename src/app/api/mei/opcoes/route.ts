import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const uf = searchParams.get('uf');

  const [ufsRaw, modulosRaw, cnaesRaw] = await Promise.all([
    prisma.meiLead.findMany({ distinct: ['uf'], select: { uf: true }, orderBy: { uf: 'asc' } }),
    prisma.meiLead.findMany({
      distinct: ['modulo'],
      select: { modulo: true },
      orderBy: { modulo: 'asc' },
    }),
    prisma.meiLead.findMany({
      distinct: ['cnae'],
      select: { cnae: true },
      orderBy: { cnae: 'asc' },
    }),
  ]);

  let municipios: { codigo: string; nome: string | null }[] = [];
  if (uf) {
    const codigos = await prisma.meiLead.findMany({
      where: { uf },
      distinct: ['municipioCodigo'],
      select: { municipioCodigo: true },
      orderBy: { municipioCodigo: 'asc' },
    });
    const nomes = await prisma.municipio.findMany({ where: { uf } });
    const nomesPorCodigo = new Map(nomes.map((m) => [m.codigo, m.nome]));
    municipios = codigos
      .map((c) => ({
        codigo: c.municipioCodigo,
        nome: nomesPorCodigo.get(c.municipioCodigo) ?? null,
      }))
      .sort((a, b) => (a.nome ?? a.codigo).localeCompare(b.nome ?? b.codigo));
  }

  return NextResponse.json({
    ufs: ufsRaw.map((u) => u.uf),
    modulos: modulosRaw.map((m) => m.modulo),
    cnaes: cnaesRaw.map((c) => c.cnae).filter(Boolean),
    municipios,
  });
}
