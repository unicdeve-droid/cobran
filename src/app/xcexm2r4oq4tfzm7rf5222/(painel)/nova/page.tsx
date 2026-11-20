'use client';

import { useRouter } from 'next/navigation';
import { CobrancaForm, CobrancaFormValues, DividaDraft } from '@/components/admin/CobrancaForm';

export default function NovaCobrancaPage() {
  const router = useRouter();

  async function handleSubmit(values: CobrancaFormValues, dividas: DividaDraft[]) {
    const res = await fetch('/api/cobrancas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, dividas }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao criar cobrança.');
    }

    router.push(`/xcexm2r4oq4tfzm7rf5222/${data.id}?criada=1`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Nova cobrança</h1>
        <p className="text-sm text-gray-500">
          Preencha os dados da empresa devedora para gerar um link único de cobrança.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <CobrancaForm
          showDividasIniciais
          submitLabel="Criar cobrança"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
