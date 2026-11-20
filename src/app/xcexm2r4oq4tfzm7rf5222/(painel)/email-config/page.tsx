'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ColorInput } from '@/components/ui/ColorInput';
import { Button } from '@/components/ui/Button';
import { FileUploadField } from '@/components/admin/FileUploadField';
import type { ConfigMap } from '@/lib/config';

export default function EmailConfigPage() {
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
        <h1 className="text-xl font-semibold text-gray-900">Modelo de email</h1>
        <p className="text-sm text-gray-500">
          Textos e cores padrão usados em &quot;Gerar emails&quot; na tela de Cobranças. CNPJ,
          nome, valor, vencimento e os links dos botões são preenchidos automaticamente por
          cobrança — o resto é igual em todos os emails gerados.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Cabeçalho e banner
        </h2>
        <p className="text-xs text-gray-400">
          A logo usada aqui é a mesma configurada em Configurações → Marca da empresa.
        </p>
        <Input
          label='Título do banner (use {{CNPJ}} onde o CNPJ da cobrança deve entrar)'
          value={config.email_banner_titulo}
          onChange={(e) => set('email_banner_titulo', e.target.value)}
        />
        <Input
          label="Subtítulo do banner"
          value={config.email_banner_subtitulo}
          onChange={(e) => set('email_banner_subtitulo', e.target.value)}
        />
        <ColorInput
          label="Cor do cabeçalho (logo e rodapé)"
          value={config.email_cor_cabecalho}
          onChange={(e) => set('email_cor_cabecalho', e.target.value)}
        />
        <ColorInput
          label="Cor do banner"
          value={config.email_cor_banner}
          onChange={(e) => set('email_cor_banner', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Corpo do texto
        </h2>
        <Input
          label='Linha de saudação (use {{NOME}} onde o nome completo deve entrar)'
          value={config.email_saudacao}
          onChange={(e) => set('email_saudacao', e.target.value)}
        />
        <Textarea
          label="Parágrafo principal"
          rows={3}
          value={config.email_paragrafo}
          onChange={(e) => set('email_paragrafo', e.target.value)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Rótulos de valor e vencimento
        </h2>
        <p className="text-xs text-gray-400">
          O valor e a data em si vêm da dívida em aberto da cobrança (vencimento = sempre dia 20
          do mês da dívida). Aqui você edita só os rótulos acima desses números.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Rótulo do valor"
            value={config.email_rotulo_valor}
            onChange={(e) => set('email_rotulo_valor', e.target.value)}
          />
          <Input
            label="Rótulo do vencimento"
            value={config.email_rotulo_vencimento}
            onChange={(e) => set('email_rotulo_vencimento', e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Botão 1 — Pagar agora online
        </h2>
        <p className="text-xs text-gray-400">
          Sempre leva para o link público da cobrança (o mesmo que você copia na tela de
          Cobranças).
        </p>
        <Input
          label="Texto do botão"
          value={config.email_botao1_texto}
          onChange={(e) => set('email_botao1_texto', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Cor de fundo"
            value={config.email_cor_botao1}
            onChange={(e) => set('email_cor_botao1', e.target.value)}
          />
          <ColorInput
            label="Cor do texto"
            value={config.email_cor_texto_botao1}
            onChange={(e) => set('email_cor_texto_botao1', e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Botão 2 — Emitir guia
        </h2>
        <p className="text-xs text-gray-400">
          Leva direto para o PDF do boleto (sem a tela de carregamento). Se a cobrança ainda não
          tiver boleto anexado, cai na página de emissão normal.
        </p>
        <Input
          label="Texto do botão"
          value={config.email_botao2_texto}
          onChange={(e) => set('email_botao2_texto', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Cor de fundo"
            value={config.email_cor_botao2}
            onChange={(e) => set('email_cor_botao2', e.target.value)}
          />
          <ColorInput
            label="Cor do texto"
            value={config.email_cor_texto_botao2}
            onChange={(e) => set('email_cor_texto_botao2', e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Texto de apoio e imagem opcional
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Texto antes do link"
            value={config.email_apoio_antes}
            onChange={(e) => set('email_apoio_antes', e.target.value)}
          />
          <Input
            label="Texto do link"
            value={config.email_apoio_link_texto}
            onChange={(e) => set('email_apoio_link_texto', e.target.value)}
          />
        </div>
        <Input
          label="Link de contato (WhatsApp, página de contato etc.)"
          value={config.email_apoio_link}
          onChange={(e) => set('email_apoio_link', e.target.value)}
          placeholder="https://wa.me/55..."
        />
        <FileUploadField
          label="Imagem opcional no rodapé do email (PNG)"
          value={config.email_imagem_url}
          onChange={(url) => set('email_imagem_url', url)}
        />
        <p className="text-xs text-amber-600">
          Enquanto o projeto roda em localhost, imagens enviadas aqui (e a logo) só aparecem
          corretamente nesta prévia — em um email de verdade, a caixa de entrada do destinatário
          não consegue acessar seu localhost. Isso passa a funcionar assim que o projeto estiver
          publicado em um domínio de verdade.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Rodapé (dados da sua empresa)
        </h2>
        <Input
          label="Nome da empresa"
          value={config.email_empresa_nome}
          onChange={(e) => set('email_empresa_nome', e.target.value)}
        />
        <Input
          label="CNPJ da empresa"
          value={config.email_empresa_cnpj}
          onChange={(e) => set('email_empresa_cnpj', e.target.value)}
        />
        <Input
          label="Endereço"
          value={config.email_empresa_endereco}
          onChange={(e) => set('email_empresa_endereco', e.target.value)}
        />
        <Textarea
          label="Texto de descadastro"
          rows={2}
          value={config.email_descadastro_texto}
          onChange={(e) => set('email_descadastro_texto', e.target.value)}
        />
        <Input
          label="Link de descadastro"
          value={config.email_descadastro_link}
          onChange={(e) => set('email_descadastro_link', e.target.value)}
        />
        <FileUploadField
          label="Imagem no canto direito do rodapé (opcional, ex: selo/certificado)"
          value={config.email_rodape_imagem_url}
          onChange={(url) => set('email_rodape_imagem_url', url)}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Aparência geral
        </h2>
        <Input
          label="Fonte (CSS font-family)"
          value={config.email_fonte}
          onChange={(e) => set('email_fonte', e.target.value)}
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
