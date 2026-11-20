'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatMesAno, MESES_PT } from '@/lib/utils';

interface DividaItem {
  id: string;
  mes: number;
  ano: number;
  valor: string | number;
  status: string;
}

export function DividasManager({
  cobrancaId,
  initialDividas,
}: {
  cobrancaId: string;
  initialDividas: DividaItem[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [novo, setNovo] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    valor: '',
    status: 'aberto' as 'aberto' | 'pago',
  });

  async function handleAdd() {
    setError('');
    if (!novo.valor) {
      setError('Informe o valor da dívida.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/cobrancas/${cobrancaId}/dividas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao adicionar dívida.');
      setNovo({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear(), valor: '', status: 'aberto' });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar dívida.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(divida: DividaItem) {
    const novoStatus = divida.status === 'pago' ? 'aberto' : 'pago';
    await fetch(`/api/dividas/${divida.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta dívida?')) return;
    await fetch(`/api/dividas/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Dívidas</h2>
        <Button type="button" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Adicionar dívida
        </Button>
      </div>

      {showForm && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Select
              label="Mês"
              value={novo.mes}
              onChange={(e) => setNovo((p) => ({ ...p, mes: parseInt(e.target.value, 10) }))}
            >
              {MESES_PT.map((nome, i) => (
                <option key={nome} value={i + 1}>
                  {nome}
                </option>
              ))}
            </Select>
            <Input
              label="Ano"
              type="number"
              value={novo.ano}
              onChange={(e) => setNovo((p) => ({ ...p, ano: parseInt(e.target.value, 10) }))}
            />
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              min="0"
              value={novo.valor}
              onChange={(e) => setNovo((p) => ({ ...p, valor: e.target.value }))}
              placeholder="0,00"
            />
            <Select
              label="Status"
              value={novo.status}
              onChange={(e) => setNovo((p) => ({ ...p, status: e.target.value as 'aberto' | 'pago' }))}
            >
              <option value="aberto">Em aberto</option>
              <option value="pago">Paga</option>
            </Select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="button" onClick={handleAdd} loading={saving}>
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {initialDividas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-400">
          Nenhuma dívida cadastrada para esta cobrança ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Período</th>
                <th className="px-4 py-2.5 font-medium">Valor</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialDividas.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2.5 text-gray-700">{formatMesAno(d.mes, d.ano)}</td>
                  <td className="px-4 py-2.5 text-gray-700">{formatCurrency(Number(d.valor))}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggleStatus(d)}
                      className={
                        d.status === 'pago'
                          ? 'rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success-dark'
                          : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
                      }
                      title="Clique para alternar o status"
                    >
                      {d.status === 'pago' ? 'Paga' : 'Em aberto'}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                      title="Excluir dívida"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
