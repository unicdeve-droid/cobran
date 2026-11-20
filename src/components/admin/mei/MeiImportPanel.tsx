'use client';

import { useRef, useState } from 'react';
import { Upload, CheckCircle2, XCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ArquivoStatus {
  nome: string;
  status: 'pendente' | 'processando' | 'ok' | 'erro';
  resumo?: string;
  erros?: string[];
}

export function MeiImportPanel({ onFinished }: { onFinished: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<ArquivoStatus[]>([]);
  const [processando, setProcessando] = useState(false);
  const [selecionados, setSelecionados] = useState<File[]>([]);

  function handleSelect(files: FileList | null) {
    if (!files) return;
    const lista = Array.from(files);
    setSelecionados(lista);
    setArquivos(lista.map((f) => ({ nome: f.name, status: 'pendente' })));
  }

  async function iniciarImportacao() {
    setProcessando(true);
    for (let i = 0; i < selecionados.length; i++) {
      const file = selecionados[i];
      setArquivos((prev) =>
        prev.map((a, idx) => (idx === i ? { ...a, status: 'processando' } : a))
      );

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/mei/import', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Falha na importação');

        setArquivos((prev) =>
          prev.map((a, idx) =>
            idx === i
              ? {
                  ...a,
                  status: 'ok',
                  resumo: `${data.inseridos} importados, ${data.ignorados} já existiam (CNPJ duplicado)`,
                  erros: data.erros?.length ? data.erros.slice(0, 5) : undefined,
                }
              : a
          )
        );
      } catch (err) {
        setArquivos((prev) =>
          prev.map((a, idx) =>
            idx === i
              ? {
                  ...a,
                  status: 'erro',
                  resumo: err instanceof Error ? err.message : 'Erro desconhecido',
                }
              : a
          )
        );
      }
    }
    setProcessando(false);
    onFinished();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Importar CSV
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Selecione um ou vários arquivos (por estado/módulo). CNPJs que já existem no banco são
          ignorados automaticamente — nada é duplicado ou sobrescrito.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processando}
          className="inline-flex items-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          Selecionar CSVs
        </button>
        {selecionados.length > 0 && (
          <Button onClick={iniciarImportacao} loading={processando}>
            Importar {selecionados.length} arquivo(s)
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        multiple
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />

      {arquivos.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          {arquivos.map((a) => (
            <div key={a.nome} className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2">
                {a.status === 'pendente' && (
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-gray-300" />
                )}
                {a.status === 'processando' && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />
                )}
                {a.status === 'ok' && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                )}
                {a.status === 'erro' && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                <span className="text-sm text-gray-700">{a.nome}</span>
              </div>
              {a.resumo && (
                <p className="ml-6 text-xs text-gray-500">{a.resumo}</p>
              )}
              {a.erros && a.erros.length > 0 && (
                <ul className="ml-6 list-inside list-disc text-xs text-amber-600">
                  {a.erros.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
