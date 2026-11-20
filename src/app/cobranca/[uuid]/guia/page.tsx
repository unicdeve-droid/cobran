import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/config';
import { HeaderLogo } from '@/components/public/HeaderLogo';
import { GuiaRedirect } from '@/components/public/GuiaRedirect';

export const dynamic = 'force-dynamic';

export default async function GuiaPage({ params }: { params: { uuid: string } }) {
  const [cobranca, config] = await Promise.all([
    prisma.cobranca.findUnique({ where: { uuid: params.uuid } }),
    getConfig(),
  ]);

  if (!cobranca || !cobranca.ativo) notFound();

  return (
    <div className="min-h-screen bg-white">
      <HeaderLogo logoUrl={config.empresaLogoUrl} bgImageUrl={config.headerImagemFundoUrl} />

      <main className="mx-auto max-w-md px-6 py-10">
        {cobranca.boletoUrl ? (
          <GuiaRedirect boletoUrl={cobranca.boletoUrl} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="text-sm font-medium text-gray-700">
              A guia ainda não está disponível.
            </p>
            <p className="text-sm text-gray-400">
              Entre em contato para receber o boleto atualizado.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
