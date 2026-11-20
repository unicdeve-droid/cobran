'use client';

import { useState } from 'react';
import { X, Receipt, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { MESES_PT } from '@/lib/utils';
import type { MeiFiltrosValues } from './MeiFiltros';

interface Resultado {
  totalSelecionado: number;
  gerados: number;
  jaTinhamCobranca: number;
}

const hoje = new Date();

export function MeiGerarCobrancasModal({
  filtros,
  totalFiltrado,
  onClose,
  onGerado,
}: {
  filtros: MeiFiltrosValues;
  totalFiltrado: number;
  onClose: () => void;
  onGerado: () => void;
}) {
  const [de, setDe] = useState('1');
  const [ate, setAte] = useState(String(Math.min(totalFiltrado, 100) || 1));
  const [valor, setValor] = useState('');
  const [mes, setMes] = useState(String(hoje.getMonth() + 1));
  const [ano, setAno] = useState(String(hoje.getFullYear()));
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function handleGerar() {
    setErro('');
    if (valor && (!mes || !ano)) {
      setErro('Informe mês e ano da dívida.');
      return;
    }
    setGerando(true);
    try {
      const filtrosLimpos = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== '')
      );
      const res = await fetch('/api/mei/gerar-cobrancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filtros: filtrosLimpos,
          de,
          ate,
          valor: valor || undefined,
          mes: valor ? mes : undefined,
          ano: valor ? ano : undefined,
          qrCodeUrl: qrCodeUrl || undefined,
          pixCopiaECola: pixCopiaECola || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobranças.');
      setResultado(data);
      onGerado();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao gerar cobranças.');
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Gerar cobranças em lote</h2>
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
              {resultado.gerados} cobrança(s) gerada(s) com sucesso.
            </div>
            {resultado.jaTinhamCobranca > 0 && (
              <p className="text-xs text-gray-500">
                {resultado.jaTinhamCobranca} lead(s) do intervalo já tinham cobrança gerada
                anteriormente e foram pulados (nada foi duplicado).
              </p>
            )}
            <Button onClick={onClose} className="mt-2 w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-gray-500">
              {totalFiltrado.toLocaleString('pt-BR')} lead(s) correspondem aos filtros ativos na
              tela. Cada um vira uma cobrança com razão social, CNPJ, nome, email e telefone já
              preenchidos (CPF e data de nascimento ficam ocultos no link público).
            </p>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <Input
                label="Do registro nº"
                type="number"
                min={1}
                value={de}
                onChange={(e) => setDe(e.target.value)}
              />
              <Input
                label="Até o registro nº"
                type="number"
                min={1}
                value={ate}
                onChange={(e) => setAte(e.target.value)}
              />
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Dívida (opcional, igual para todas)
                </span>
                <p className="mt-0.5 text-xs text-gray-400">
                  Deixe o valor em branco para gerar as cobranças sem dívida ainda.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="80,00"
                  className="col-span-1"
                />
                <Select label="Mês" value={mes} onChange={(e) => setMes(e.target.value)}>
                  {MESES_PT.map((nome, i) => (
                    <option key={nome} value={i + 1}>
                      {nome}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Ano"
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                />
              </div>

              <FileUploadField
                label="QR Code do PIX (PNG) — usado em todas, já que o valor é o mesmo"
                value={qrCodeUrl}
                onChange={setQrCodeUrl}
              />
              <Textarea
                label="Código PIX copia-e-cola"
                rows={2}
                value={pixCopiaECola}
                onChange={(e) => setPixCopiaECola(e.target.value)}
                placeholder="00020126...codigo pix..."
              />
            </div>

            {erro && <p className="mb-3 text-sm text-red-600">{erro}</p>}

            <Button onClick={handleGerar} loading={gerando} className="w-full">
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
              Gerar cobranças
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
