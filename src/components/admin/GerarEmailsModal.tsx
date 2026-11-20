'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function GerarEmailsModal({ onClose }: { onClose: () => void }) {
  const [de, setDe] = useState('1');
  const [ate, setAte] = useState('100');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleGerar() {
    setErro('');
    setGerando(true);
    try {
      const res = await fetch('/api/cobrancas/gerar-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ de, ate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao gerar os emails.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emails_cobranca_${de}_a_${ate}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar os emails.');
    } finally {
      setGerando(false);
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
          <h2 className="text-base font-semibold text-gray-900">Gerar emails em lote</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-xs text-gray-500">
          Gera um <code className="rounded bg-gray-100 px-1">.zip</code> com um .html por
          cobrança do intervalo, nomeado com o número na frente (ex:{' '}
          <code className="rounded bg-gray-100 px-1">1_email.html</code>), pronto pra usar na sua
          ferramenta de disparo. Cobranças sem dívida em aberto no intervalo são puladas — o
          próprio .zip traz um resumo (<code className="rounded bg-gray-100 px-1">0_RESUMO.txt</code>)
          dizendo quais.
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <Input
            label="Do nº"
            type="number"
            min={1}
            value={de}
            onChange={(e) => setDe(e.target.value)}
          />
          <Input
            label="Até o nº"
            type="number"
            min={1}
            value={ate}
            onChange={(e) => setAte(e.target.value)}
          />
        </div>

        {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

        <Button onClick={handleGerar} loading={gerando} className="w-full">
          {!gerando && <Mail className="h-4 w-4" />}
          Gerar e baixar .zip
        </Button>
      </div>
    </div>
  );
}
