'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FileUploadField } from '@/components/admin/FileUploadField';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { DEFAULT_CONFIG, type ConfigMap } from '@/lib/config';

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfigMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/configuracoes')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setError('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, []);

  function set(key: keyof ConfigMap, value: string) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Erro ao salvar configurações.');
      const data = await res.json();
      setConfig(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return <p className="text-sm text-gray-400">Carregando configurações...</p>;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">
          Todos os textos exibidos nas páginas públicas de cobrança podem ser personalizados aqui.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Marca da empresa
        </h2>
        <FileUploadField
          label="Logo (PNG)"
          value={config.empresaLogoUrl}
          onChange={(url) => set('empresaLogoUrl', url)}
        />
        <FileUploadField
          label="Imagem de fundo do header (opcional) — aparece atrás da logo, nas páginas públicas de cobrança. Qualquer proporção funciona (a altura se ajusta sozinha); pra parecer um banner, use uma imagem bem mais larga que alta"
          value={config.headerImagemFundoUrl}
          onChange={(url) => set('headerImagemFundoUrl', url)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Página 1 — Aviso inicial
        </h2>
        <Input
          label="Título do aviso"
          value={config.p1_alerta_titulo}
          onChange={(e) => set('p1_alerta_titulo', e.target.value)}
        />
        <Textarea
          label="Texto do aviso"
          rows={2}
          value={config.p1_alerta_texto}
          onChange={(e) => set('p1_alerta_texto', e.target.value)}
        />
        <Input
          label="Texto do botão verde"
          value={config.p1_botao_ver_inadimplencia}
          onChange={(e) => set('p1_botao_ver_inadimplencia', e.target.value)}
        />
        <Input
          label="Texto do link abaixo do botão"
          value={config.p1_link_pagar_divida}
          onChange={(e) => set('p1_link_pagar_divida', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Página 2 — Detalhe da dívida
        </h2>
        <Textarea
          label="Aviso no topo (abaixo do nome/CNPJ)"
          rows={2}
          value={config.p2_aviso_topo}
          onChange={(e) => set('p2_aviso_topo', e.target.value)}
        />
        <Input
          label="Título da lista de dívidas"
          value={config.p2_titulo_valor_aberto}
          onChange={(e) => set('p2_titulo_valor_aberto', e.target.value)}
        />
        <Textarea
          label="Aviso abaixo da lista de dívidas"
          rows={2}
          value={config.p2_aviso_rodape}
          onChange={(e) => set('p2_aviso_rodape', e.target.value)}
        />
        <Input
          label="Texto do botão verde"
          value={config.p2_botao_regularizar}
          onChange={(e) => set('p2_botao_regularizar', e.target.value)}
        />
        <Input
          label="Texto do link abaixo do botão"
          value={config.p2_link_pagamento}
          onChange={(e) => set('p2_link_pagamento', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Modal de pagamento
        </h2>
        <RichTextEditor
          label="Texto do modal"
          value={config.modal_texto_html}
          onChange={(html) => set('modal_texto_html', html)}
        />
        <Input
          label="Texto do botão verde"
          value={config.modal_botao_emitir}
          onChange={(e) => set('modal_botao_emitir', e.target.value)}
        />
        <Input
          label='Texto do botão "Emitir guia" (branco, abre o boleto em PDF)'
          value={config.modal_botao_emitir_guia}
          onChange={(e) => set('modal_botao_emitir_guia', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Fatura</h2>
        <Input
          label="Título da fatura"
          value={config.fatura_titulo}
          onChange={(e) => set('fatura_titulo', e.target.value)}
        />
        <Input
          label='Rótulo "Período de apuração"'
          value={config.fatura_periodo_label}
          onChange={(e) => set('fatura_periodo_label', e.target.value)}
        />
        <Textarea
          label="Aviso final (abaixo do QR code)"
          rows={2}
          value={config.fatura_aviso}
          onChange={(e) => set('fatura_aviso', e.target.value)}
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 rounded-lg bg-success-light px-3 py-2 text-sm text-success-dark">
            <CheckCircle2 className="h-4 w-4" />
            Salvo!
          </span>
        )}
        <Button onClick={handleSave} loading={saving}>
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}
