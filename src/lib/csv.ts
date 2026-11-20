import Papa from 'papaparse';

export interface MeiCsvRow {
  nome: string;
  cnpj: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  dataAbertura: Date | null;
  cep: string | null;
  uf: string;
  municipioCodigo: string;
  cnae: string | null;
  modulo: string;
}

export interface ParseResult {
  rows: MeiCsvRow[];
  erros: string[];
}

const REQUIRED_COLUMNS = ['nome', 'cnpj', 'uf', 'municipio', 'modulo'];

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// Converte "26/05/2026" -> Date. Retorna null se vazio ou em formato inesperado.
function parseDataAbertura(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const [, dia, mes, ano] = match;
  const date = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  return Number.isNaN(date.getTime()) ? null : date;
}

// Lê o conteúdo cru do arquivo (string) e retorna as linhas já validadas/tipadas.
// Trata o BOM do utf-8-sig automaticamente (o Papaparse cuida disso via a opção
// abaixo, mas removemos manualmente também por segurança).
export function parseMeiCsv(fileContent: string): ParseResult {
  const semBom = fileContent.replace(/^\uFEFF/, '');

  const parsed = Papa.parse<Record<string, string>>(semBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
  });

  const erros: string[] = [];
  const rows: MeiCsvRow[] = [];

  if (parsed.data.length === 0) {
    erros.push('Arquivo vazio ou sem linhas de dados.');
    return { rows, erros };
  }

  const headers = Object.keys(parsed.data[0] ?? {});
  const faltando = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (faltando.length > 0) {
    erros.push(`Colunas obrigatórias ausentes: ${faltando.join(', ')}`);
    return { rows, erros };
  }

  parsed.data.forEach((raw, index) => {
    const linha = index + 2; // +1 pelo header, +1 porque index começa em 0
    const nome = (raw.nome || '').trim();
    const cnpj = onlyDigits(raw.cnpj || '');
    const uf = (raw.uf || '').trim().toUpperCase();
    const municipioCodigo = (raw.municipio || '').trim();
    const modulo = (raw.modulo || '').trim();

    if (!nome || !cnpj || !uf || !municipioCodigo || !modulo) {
      erros.push(`Linha ${linha}: faltam dados obrigatórios (nome/cnpj/uf/municipio/modulo).`);
      return;
    }
    if (cnpj.length !== 14) {
      erros.push(`Linha ${linha}: CNPJ "${raw.cnpj}" não tem 14 dígitos, ignorada.`);
      return;
    }

    rows.push({
      nome,
      cnpj,
      cpf: raw.cpf ? onlyDigits(raw.cpf) || null : null,
      telefone: raw.telefone?.trim() || null,
      email: raw.email?.trim().toLowerCase() || null,
      dataAbertura: parseDataAbertura(raw.data_abertura || ''),
      cep: raw.cep ? onlyDigits(raw.cep) : null,
      uf,
      municipioCodigo,
      cnae: raw.cnae ? onlyDigits(raw.cnae) : null,
      modulo,
    });
  });

  return { rows, erros };
}

export function formatCnpj(cnpj: string): string {
  if (!/^\d{14}$/.test(cnpj)) return cnpj;
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatCpf(cpf: string | null): string {
  if (!cpf) return '';
  if (!/^\d{11}$/.test(cpf)) return cpf;
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}
