import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { formatDate } from '@/lib/utils';
import { HeaderLogo } from '@/components/public/HeaderLogo';
import { DataRow } from '@/components/public/DataRow';

export const dynamic = 'force-dynamic';

export default async function CobrancaPage({ params }: { params: { uuid: string } }) {
  const [cobranca, config] = await Promise.all([
    prisma.cobranca.findUnique({ where: { uuid: params.uuid } }),
    getConfig(),
  ]);

  if (!cobranca || !cobranca.ativo) notFound();

  return (
    <div className="min-h-screen bg-white">
      <HeaderLogo logoUrl={config.empresaLogoUrl} bgImageUrl={config.headerImagemFundoUrl} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-brand-light/50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-brand">{config.p1_alerta_titulo}</p>
            <p className="mt-0.5 text-sm text-gray-700">{config.p1_alerta_texto}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Dados da empresa
          </h2>
          {cobranca.mostrarRazaoSocial && (
            <DataRow label="Razão social" value={cobranca.razaoSocial} />
          )}
          {cobranca.mostrarCnpj && <DataRow label="CNPJ" value={cobranca.cnpj} />}
          {cobranca.mostrarDataAbertura && (
            <DataRow label="Data de abertura" value={formatDate(cobranca.dataAbertura)} />
          )}
          {cobranca.mostrarCep && <DataRow label="CEP" value={cobranca.cep ?? ''} />}
        </div>

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <Link
            href={`/cobranca/${cobranca.uuid}/detalhes`}
            className="w-full rounded-lg bg-brand px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto sm:px-10"
          >
            {config.p1_botao_ver_inadimplencia}
          </Link>
          <Link
            href={`/cobranca/${cobranca.uuid}/detalhes`}
            className="text-xs text-gray-400 underline-offset-2 hover:text-brand hover:underline"
          >
            {config.p1_link_pagar_divida}
          </Link>
        </div>
      </main>
    </div>
  );
}
