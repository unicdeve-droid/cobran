import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { formatCurrency, formatMesAno } from '@/lib/utils';
import { HeaderLogo } from '@/components/public/HeaderLogo';
import { CopyPixButton } from '@/components/public/CopyPixButton';

export const dynamic = 'force-dynamic';

function getPeriodoEValor(dividas: { mes: number; ano: number; valor: number; status: string }[]) {
  const abertas = dividas.filter((d) => d.status === 'aberto');
  const relevantes = abertas.length > 0 ? abertas : dividas;

  if (relevantes.length === 0) {
    return { periodo: '-', valorTotal: 0 };
  }

  const valorTotal = relevantes.reduce((sum, d) => sum + d.valor, 0);
  const ordenadas = [...relevantes].sort((a, b) => a.ano - b.ano || a.mes - b.mes);
  const primeira = ordenadas[0];
  const ultima = ordenadas[ordenadas.length - 1];

  const periodo =
    primeira.mes === ultima.mes && primeira.ano === ultima.ano
      ? formatMesAno(primeira.mes, primeira.ano)
      : `${formatMesAno(primeira.mes, primeira.ano)} a ${formatMesAno(ultima.mes, ultima.ano)}`;

  return { periodo, valorTotal };
}

export default async function FaturaPage({ params }: { params: { uuid: string } }) {
  const [cobranca, config] = await Promise.all([
    prisma.cobranca.findUnique({
      where: { uuid: params.uuid },
      include: { dividas: true },
    }),
    getConfig(),
  ]);

  if (!cobranca || !cobranca.ativo) notFound();

  const { periodo, valorTotal } = getPeriodoEValor(
    cobranca.dividas.map((d) => ({ ...d, valor: Number(d.valor) }))
  );

  return (
    <div className="min-h-screen bg-white">
      <HeaderLogo logoUrl={config.empresaLogoUrl} bgImageUrl={config.headerImagemFundoUrl} />

      <main className="mx-auto max-w-md px-6 py-10">
        <div className="rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {config.empresaLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.empresaLogoUrl}
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-300">Logo</span>
            )}
            <span className="text-sm font-semibold text-gray-900">{config.fatura_titulo}</span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">{config.fatura_periodo_label}</span>
            <span className="text-sm font-medium text-gray-900">{periodo}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">Valor</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(valorTotal)}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-0.5 border-t border-gray-100 pt-4">
            <span className="text-sm font-medium text-gray-900">{cobranca.razaoSocial}</span>
            <span className="text-sm text-gray-500">{cobranca.cnpj}</span>
          </div>

          {cobranca.qrCodeUrl && (
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cobranca.qrCodeUrl}
                alt="QR Code para pagamento"
                className="h-48 w-48 object-contain"
              />
            </div>
          )}

          {cobranca.pixCopiaECola && (
            <div className="mt-4">
              <CopyPixButton code={cobranca.pixCopiaECola} />
            </div>
          )}

          <p className="mt-5 text-center text-xs text-gray-400">{config.fatura_aviso}</p>
        </div>
      </main>
    </div>
  );
}
