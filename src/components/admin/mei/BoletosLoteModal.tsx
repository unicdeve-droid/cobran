'use client';

import { useRef, useState } from 'react';
import { X, FileArchive, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Resultado {
  totalArquivos: number;
  anexados: number;
  naoEncontrados: { arquivo: string; numero: number }[];
  naoReconhecidos: string[];
}

export function BoletosLoteModal({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function handleEnviar() {
    if (!arquivo) return;
    setErro('');
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      const res = await fetch('/api/cobrancas/boletos-lote', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar o .zip.');
      setResultado(data);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao processar o .zip.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Subir boletos em lote (.zip)</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {resultado ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-success-light px-3 py-2.5 text-sm text-success-dark">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {resultado.anexados} de {resultado.totalArquivos} PDF(s) anexados às cobranças
              correspondentes.
            </div>

            {resultado.naoEncontrados.length > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <p className="mb-1 font-medium">
                  {resultado.naoEncontrados.length} arquivo(s) com número que não existe em
                  nenhuma cobrança:
                </p>
                <ul className="list-inside list-disc">
                  {resultado.naoEncontrados.slice(0, 10).map((n) => (
                    <li key={n.arquivo}>
                      {n.arquivo} (nº {n.numero})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.naoReconhecidos.length > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <p className="mb-1 font-medium">
                  {resultado.naoReconhecidos.length} arquivo(s) sem número reconhecível no nome:
                </p>
                <ul className="list-inside list-disc">
                  {resultado.naoReconhecidos.slice(0, 10).map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={onClose} className="mt-2 w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-gray-500">
              Envie um .zip com os PDFs dos boletos. Cada arquivo precisa começar com o número da
              cobrança (ex: <code className="rounded bg-gray-100 px-1">01_boleto.pdf</code> vai
              para a cobrança nº 1). O boleto é anexado automaticamente à cobrança correspondente
              — mesmo campo usado no botão &quot;Emitir guia&quot;.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mb-4 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center hover:border-brand hover:bg-brand-light/30"
            >
              <FileArchive className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                {arquivo ? arquivo.name : 'Clique para selecionar o .zip'}
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            />

            {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

            <Button onClick={handleEnviar} loading={enviando} disabled={!arquivo} className="w-full">
              {!enviando && <Upload className="h-4 w-4" />}
              Enviar e anexar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
