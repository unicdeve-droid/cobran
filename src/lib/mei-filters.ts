import { Prisma } from '@prisma/client';

// Monta o `where` do Prisma a partir dos parâmetros de busca da URL.
// Usado tanto pela listagem paginada quanto pela exportação, pra garantir que
// os dois sempre respeitem exatamente os mesmos filtros.
export function buildMeiWhere(searchParams: URLSearchParams): Prisma.MeiLeadWhereInput {
  const where: Prisma.MeiLeadWhereInput = {};

  const uf = searchParams.get('uf');
  if (uf) where.uf = uf;

  const municipioCodigo = searchParams.get('municipioCodigo');
  if (municipioCodigo) where.municipioCodigo = municipioCodigo;

  const modulo = searchParams.get('modulo');
  if (modulo) where.modulo = modulo;

  const cnae = searchParams.get('cnae');
  if (cnae) where.cnae = cnae;

  const dataDe = searchParams.get('dataDe');
  const dataAte = searchParams.get('dataAte');
  if (dataDe || dataAte) {
    where.dataAbertura = {};
    if (dataDe) where.dataAbertura.gte = new Date(dataDe);
    if (dataAte) where.dataAbertura.lte = new Date(dataAte);
  }

  const busca = searchParams.get('busca');
  if (busca) {
    const digitos = busca.replace(/\D/g, '');
    where.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      { cnpj: { contains: digitos || busca } },
      { cpf: { contains: digitos || busca } },
    ];
  }

  // Intervalo pelo número sequencial do lead (ordem real de importação).
  // Usado por "Exportar" e "Gerar cobranças" pra selecionar "do nº X ao Y"
  // de forma estável, batendo sempre com a ordem mostrada na tela.
  const numeroDe = searchParams.get('numeroDe');
  const numeroAte = searchParams.get('numeroAte');
  if (numeroDe || numeroAte) {
    where.numero = {};
    if (numeroDe) where.numero.gte = parseInt(numeroDe, 10);
    if (numeroAte) where.numero.lte = parseInt(numeroAte, 10);
  }

  return where;
}
