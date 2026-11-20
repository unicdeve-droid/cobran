'use client';

import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MeiFiltrosValues } from './MeiFiltros';

const COLUNAS: { key: string; label: string }[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'cpf', label: 'CPF' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'email', label: 'Email' },
  { key: 'dataAbertura', label: 'Data de abertura' },
  { key: 'cep', label: 'CEP' },
  { key: 'uf', label: 'UF' },
  { key: 'municipio', label: 'Município' },
  { key: 'cnae', label: 'CNAE' },
  { key: 'modulo', label: 'Módulo' },
];

export function MeiExportModal({
  filtros,
  totalFiltrado,
  onClose,
}: {
  filtros: MeiFiltrosValues;
  totalFiltrado: number;
  onClose: () => void;
}) {
  const [colunas, setColunas] = useState<string[]>(COLUNAS.map((c) => c.key));
  const [de, setDe] = useState('1');
  const [ate, setAte] = useState(String(Math.min(totalFiltrado, 1000) || 1));
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState('');

  function toggleColuna(key: string) {
    setColunas((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  }

  async function handleExportar() {
    setErro('');
    if (colunas.length === 0) {
      setErro('Selecione ao menos uma coluna.');
      return;
    }
    setExportando(true);
    try {
      const filtrosLimpos = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      );
      const res = await fetch('/api/mei/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filtros: filtrosLimpos, colunas, de, ate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao exportar.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mei_leads_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao exportar.');
    } finally {
      setExportando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Exportar leads</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-500">
          {totalFiltrado.toLocaleString('pt-BR')} registro(s) correspondem aos filtros ativos na
          tela.
        </p>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-700">Colunas</span>
          <div className="grid grid-cols-2 gap-2">
            {COLUNAS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={colunas.includes(c.key)}
                  onChange={() => toggleColuna(c.key)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30"
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Input label="Do registro nº" type="number" min={1} value={de} onChange={(e) => setDe(e.target.value)} />
          <Input label="Até o registro nº" type="number" min={1} value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>

        {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

        <Button onClick={handleExportar} loading={exportando} className="w-full">
          {exportando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}
