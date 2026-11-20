import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { formatCurrency, formatMesAno } from '@/lib/utils';
import { HeaderLogo } from '@/components/public/HeaderLogo';
import { PagamentoModalTrigger } from '@/components/public/PagamentoModalTrigger';

export const dynamic = 'force-dynamic';

export default async function DetalhesCobrancaPage({
  params,
}: {
  params: { uuid: string };
}) {
  const [cobranca, config] = await Promise.all([
    prisma.cobranca.findUnique({
      where: { uuid: params.uuid },
      include: { dividas: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] } },
    }),
    getConfig(),
  ]);

  if (!cobranca || !cobranca.ativo) notFound();

  return (
    <div className="min-h-screen bg-white">
      <HeaderLogo logoUrl={config.empresaLogoUrl} bgImageUrl={config.headerImagemFundoUrl} />

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">{cobranca.nomeCompleto}</h1>
          <p className="text-sm text-gray-500">{cobranca.cnpj}</p>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {config.p2_aviso_topo}
        </p>

        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {config.p2_titulo_valor_aberto}
          </h2>

          {cobranca.dividas.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              Nenhuma dívida registrada no momento.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {cobranca.dividas.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700">{formatMesAno(d.mes, d.ano)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(d.valor))}
                    </span>
                    <span
                      className={
                        d.status === 'pago'
                          ? 'rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success-dark'
                          : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
                      }
                    >
                      {d.status === 'pago' ? 'Paga' : 'Em aberto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {config.p2_aviso_rodape}
        </p>

        <PagamentoModalTrigger
          uuid={cobranca.uuid}
          logoUrl={config.empresaLogoUrl}
          modalHtml={config.modal_texto_html}
          botaoRegularizarLabel={config.p2_botao_regularizar}
          linkPagamentoLabel={config.p2_link_pagamento}
          botaoEmitirLabel={config.modal_botao_emitir}
          botaoEmitirGuiaLabel={config.modal_botao_emitir_guia}
        />
      </main>
    </div>
  );
}
