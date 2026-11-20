'use client';

import { useState, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { MESES_PT } from '@/lib/utils';

export interface CobrancaFormValues {
  razaoSocial: string;
  cnpj: string;
  dataAbertura: string;
  cep: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  mostrarRazaoSocial: boolean;
  mostrarCnpj: boolean;
  mostrarDataAbertura: boolean;
  mostrarCep: boolean;
  mostrarNomeCompleto: boolean;
  mostrarCpf: boolean;
  mostrarDataNascimento: boolean;
  qrCodeUrl: string;
  pixCopiaECola: string;
  boletoUrl: string;
}

export interface DividaDraft {
  mes: number;
  ano: number;
  valor: string;
  status: 'aberto' | 'pago';
}

export const EMPTY_COBRANCA_FORM: CobrancaFormValues = {
  razaoSocial: '',
  cnpj: '',
  dataAbertura: '',
  cep: '',
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  email: '',
  telefone: '',
  mostrarRazaoSocial: true,
  mostrarCnpj: true,
  mostrarDataAbertura: true,
  mostrarCep: true,
  mostrarNomeCompleto: true,
  mostrarCpf: true,
  mostrarDataNascimento: true,
  qrCodeUrl: '',
  pixCopiaECola: '',
  boletoUrl: '',
};

interface CobrancaFormProps {
  initialValues?: CobrancaFormValues;
  showDividasIniciais?: boolean;
  submitLabel?: string;
  onSubmit: (values: CobrancaFormValues, dividas: DividaDraft[]) => Promise<void>;
}

function CampoComToggle({
  children,
  checked,
  onToggle,
}: {
  children: React.ReactNode;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
      {children}
      <div className="flex items-center justify-end border-t border-gray-100 pt-2">
        <Toggle checked={checked} onChange={onToggle} label="Exibir no link público" />
      </div>
    </div>
  );
}

const anoAtual = new Date().getFullYear();

export function CobrancaForm({
  initialValues,
  showDividasIniciais = false,
  submitLabel = 'Salvar',
  onSubmit,
}: CobrancaFormProps) {
  const [values, setValues] = useState<CobrancaFormValues>(
    initialValues ?? EMPTY_COBRANCA_FORM
  );
  const [dividas, setDividas] = useState<DividaDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof CobrancaFormValues>(key: K, value: CobrancaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addDivida() {
    setDividas((prev) => [
      ...prev,
      { mes: new Date().getMonth() + 1, ano: anoAtual, valor: '', status: 'aberto' },
    ]);
  }

  function updateDivida(index: number, patch: Partial<DividaDraft>) {
    setDividas((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function removeDivida(index: number) {
    setDividas((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!values.razaoSocial || !values.cnpj || !values.nomeCompleto) {
      setError('Razão social, CNPJ e nome completo são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(values, dividas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Dados da empresa devedora
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoComToggle
            checked={values.mostrarRazaoSocial}
            onToggle={(v) => set('mostrarRazaoSocial', v)}
          >
            <Input
              label="Razão social"
              required
              value={values.razaoSocial}
              onChange={(e) => set('razaoSocial', e.target.value)}
              placeholder="Empresa Exemplo LTDA"
            />
          </CampoComToggle>

          <CampoComToggle
            checked={values.mostrarCnpj}
            onToggle={(v) => set('mostrarCnpj', v)}
          >
            <Input
              label="CNPJ"
              required
              value={values.cnpj}
              onChange={(e) => set('cnpj', e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </CampoComToggle>

          <CampoComToggle
            checked={values.mostrarDataAbertura}
            onToggle={(v) => set('mostrarDataAbertura', v)}
          >
            <Input
              label="Data de abertura"
              type="date"
              value={values.dataAbertura}
              onChange={(e) => set('dataAbertura', e.target.value)}
            />
          </CampoComToggle>

          <CampoComToggle checked={values.mostrarCep} onToggle={(v) => set('mostrarCep', v)}>
            <Input
              label="CEP"
              value={values.cep}
              onChange={(e) => set('cep', e.target.value)}
              placeholder="00000-000"
            />
          </CampoComToggle>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Dados do titular
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CampoComToggle
            checked={values.mostrarNomeCompleto}
            onToggle={(v) => set('mostrarNomeCompleto', v)}
          >
            <Input
              label="Nome completo"
              required
              value={values.nomeCompleto}
              onChange={(e) => set('nomeCompleto', e.target.value)}
              placeholder="Nome do responsável"
            />
          </CampoComToggle>

          <CampoComToggle checked={values.mostrarCpf} onToggle={(v) => set('mostrarCpf', v)}>
            <Input
              label="CPF"
              value={values.cpf}
              onChange={(e) => set('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
          </CampoComToggle>

          <CampoComToggle
            checked={values.mostrarDataNascimento}
            onToggle={(v) => set('mostrarDataNascimento', v)}
          >
            <Input
              label="Data de nascimento"
              type="date"
              value={values.dataNascimento}
              onChange={(e) => set('dataNascimento', e.target.value)}
            />
          </CampoComToggle>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Contato (uso interno)
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Email nunca aparece no link público — fica só no seu banco de dados, para disparo de
            mensagens futuramente. Telefone aparece publicamente na Página 1 (Dados do titular),
            quando preenchido.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="contato@empresa.com"
          />
          <Input
            label="Telefone"
            value={values.telefone}
            onChange={(e) => set('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>
      </section>

      {showDividasIniciais && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Dívidas iniciais
            </h2>
            <Button type="button" variant="secondary" onClick={addDivida}>
              <Plus className="h-4 w-4" />
              Adicionar dívida
            </Button>
          </div>

          {dividas.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-400">
              Nenhuma dívida adicionada ainda. Você também pode adicionar depois, na tela de
              edição.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {dividas.map((divida, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-5 md:items-end"
              >
                <Select
                  label="Mês"
                  value={divida.mes}
                  onChange={(e) => updateDivida(index, { mes: parseInt(e.target.value, 10) })}
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
                  value={divida.ano}
                  onChange={(e) => updateDivida(index, { ano: parseInt(e.target.value, 10) })}
                />
                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={divida.valor}
                  onChange={(e) => updateDivida(index, { valor: e.target.value })}
                  placeholder="0,00"
                />
                <Select
                  label="Status"
                  value={divida.status}
                  onChange={(e) =>
                    updateDivida(index, { status: e.target.value as 'aberto' | 'pago' })
                  }
                >
                  <option value="aberto">Em aberto</option>
                  <option value="pago">Paga</option>
                </Select>
                <button
                  type="button"
                  onClick={() => removeDivida(index)}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remover
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Pagamento (fatura)
        </h2>
        <FileUploadField
          label="QR Code do PIX (PNG)"
          value={values.qrCodeUrl}
          onChange={(url) => set('qrCodeUrl', url)}
        />
        <Textarea
          label="Código PIX copia-e-cola"
          rows={3}
          value={values.pixCopiaECola}
          onChange={(e) => set('pixCopiaECola', e.target.value)}
          placeholder="00020126...codigo pix..."
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Guia (boleto em PDF)
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Usado no botão &quot;Emitir guia&quot; do modal de pagamento. Envie o boleto já
            pronto, específico desta cobrança.
          </p>
        </div>
        <FileUploadField
          label="Boleto (PDF)"
          kind="pdf"
          value={values.boletoUrl}
          onChange={(url) => set('boletoUrl', url)}
        />
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
