import { notFound, redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { toDateInputValue } from '@/lib/utils';
import { LinkBanner } from '@/components/admin/LinkBanner';
import { EditCobrancaForm } from '@/components/admin/EditCobrancaForm';
import { DividasManager } from '@/components/admin/DividasManager';
import type { CobrancaFormValues } from '@/components/admin/CobrancaForm';

export default async function EditarCobrancaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { criada?: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect('/xcexm2r4oq4tfzm7rf5222/login');

  const cobranca = await prisma.cobranca.findUnique({
    where: { id: params.id },
    include: { dividas: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] } },
  });

  if (!cobranca) notFound();

  const initialValues: CobrancaFormValues = {
    razaoSocial: cobranca.razaoSocial,
    cnpj: cobranca.cnpj,
    dataAbertura: toDateInputValue(cobranca.dataAbertura),
    cep: cobranca.cep ?? '',
    nomeCompleto: cobranca.nomeCompleto,
    cpf: cobranca.cpf ?? '',
    dataNascimento: toDateInputValue(cobranca.dataNascimento),
    email: cobranca.email ?? '',
    telefone: cobranca.telefone ?? '',
    mostrarRazaoSocial: cobranca.mostrarRazaoSocial,
    mostrarCnpj: cobranca.mostrarCnpj,
    mostrarDataAbertura: cobranca.mostrarDataAbertura,
    mostrarCep: cobranca.mostrarCep,
    mostrarNomeCompleto: cobranca.mostrarNomeCompleto,
    mostrarCpf: cobranca.mostrarCpf,
    mostrarDataNascimento: cobranca.mostrarDataNascimento,
    qrCodeUrl: cobranca.qrCodeUrl ?? '',
    pixCopiaECola: cobranca.pixCopiaECola ?? '',
    boletoUrl: cobranca.boletoUrl ?? '',
  };

  const dividas = cobranca.dividas.map((d) => ({
    id: d.id,
    mes: d.mes,
    ano: d.ano,
    valor: Number(d.valor),
    status: d.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      {searchParams.criada && (
        <div className="flex items-center gap-2 rounded-lg bg-success-light px-4 py-3 text-sm text-success-dark">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Cobrança criada com sucesso. Copie o link abaixo para enviar ao devedor.
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Cobrança #{cobranca.numero}
        </p>
        <h1 className="text-xl font-semibold text-gray-900">{cobranca.razaoSocial}</h1>
        <p className="text-sm text-gray-500">{cobranca.cnpj}</p>
      </div>

      <LinkBanner uuid={cobranca.uuid} />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <DividasManager cobrancaId={cobranca.id} initialDividas={dividas} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <EditCobrancaForm id={cobranca.id} initialValues={initialValues} />
      </div>
    </div>
  );
}
