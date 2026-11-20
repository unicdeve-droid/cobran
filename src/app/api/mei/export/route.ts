import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildMeiWhere } from '@/lib/mei-filters';
import { formatCnpj, formatCpf } from '@/lib/csv';

const COLUNAS_DISPONIVEIS = [
  'nome',
  'cnpj',
  'cpf',
  'telefone',
  'email',
  'dataAbertura',
  'cep',
  'uf',
  'municipio',
  'cnae',
  'modulo',
] as const;

function formatDateBr(date: Date | null): string {
  if (!date) return '';
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const filtros: URLSearchParams = new URLSearchParams(body.filtros || {});
    const colunas: string[] = Array.isArray(body.colunas) && body.colunas.length
      ? body.colunas.filter((c: string) => COLUNAS_DISPONIVEIS.includes(c as any))
      : [...COLUNAS_DISPONIVEIS];

    const de = Math.max(1, parseInt(body.de, 10) || 1);
    const ate = Math.max(de, parseInt(body.ate, 10) || de + 99);

    const filtrosComIntervalo = new URLSearchParams(filtros);
    filtrosComIntervalo.set('numeroDe', String(de));
    filtrosComIntervalo.set('numeroAte', String(ate));
    const where = buildMeiWhere(filtrosComIntervalo);

    const leads = await prisma.meiLead.findMany({
      where,
      orderBy: { numero: 'asc' },
      take: 200000, // trava de segurança
    });

    let nomesPorChave = new Map<string, string>();
    if (colunas.includes('municipio') && leads.length > 0) {
      const pares = Array.from(
        new Set(leads.map((l) => `${l.municipioCodigo}|${l.uf}`))
      ).map((s) => {
        const [codigo, uf] = s.split('|');
        return { codigo, uf };
      });
      const municipios = await prisma.municipio.findMany({ where: { OR: pares } });
      nomesPorChave = new Map(municipios.map((m) => [`${m.codigo}|${m.uf}`, m.nome]));
    }

    const linhas = leads.map((lead) => {
      const linha: Record<string, string> = {};
      for (const coluna of colunas) {
        switch (coluna) {
          case 'nome':
            linha.nome = lead.nome;
            break;
          case 'cnpj':
            linha.cnpj = formatCnpj(lead.cnpj);
            break;
          case 'cpf':
            linha.cpf = formatCpf(lead.cpf);
            break;
          case 'telefone':
            linha.telefone = lead.telefone ?? '';
            break;
          case 'email':
            linha.email = lead.email ?? '';
            break;
          case 'dataAbertura':
            linha.data_abertura = formatDateBr(lead.dataAbertura);
            break;
          case 'cep':
            linha.cep = lead.cep ?? '';
            break;
          case 'uf':
            linha.uf = lead.uf;
            break;
          case 'municipio':
            linha.municipio =
              nomesPorChave.get(`${lead.municipioCodigo}|${lead.uf}`) ?? lead.municipioCodigo;
            break;
          case 'cnae':
            linha.cnae = lead.cnae ?? '';
            break;
          case 'modulo':
            linha.modulo = lead.modulo;
            break;
        }
      }
      return linha;
    });

    const csv = Papa.unparse(linhas, { header: true });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mei_leads_export.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar MEI:', error);
    return NextResponse.json({ error: 'Erro interno ao exportar.' }, { status: 500 });
  }
}
