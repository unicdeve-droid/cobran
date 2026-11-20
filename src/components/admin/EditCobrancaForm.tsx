'use client';

import { useRouter } from 'next/navigation';
import { CobrancaForm, CobrancaFormValues } from '@/components/admin/CobrancaForm';

export function EditCobrancaForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: CobrancaFormValues;
}) {
  const router = useRouter();

  async function handleSubmit(values: CobrancaFormValues) {
    const res = await fetch(`/api/cobrancas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao salvar alterações.');
    }
    router.refresh();
  }

  return (
    <CobrancaForm
      initialValues={initialValues}
      submitLabel="Salvar alterações"
      onSubmit={handleSubmit}
    />
  );
}
