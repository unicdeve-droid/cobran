import { prisma } from './prisma';

// Todos os textos e a logo da empresa cobradora são editáveis pela guia
// "Configurações" do painel. Os valores abaixo são os padrões usados
// enquanto o admin não personalizar cada campo.
export const DEFAULT_CONFIG = {
  empresaLogoUrl: '',
  // Imagem de fundo do header nas páginas públicas de cobrança (opcional).
  // Sem valor definido, o header continua com fundo branco, como hoje.
  headerImagemFundoUrl: '',

  p1_alerta_titulo: 'Aviso importante',
  p1_alerta_texto: 'Consta um débito em aberto associado a este CNPJ.',
  p1_botao_ver_inadimplencia: 'Ver inadimplência',
  p1_link_pagar_divida: 'Clique aqui para pagar a sua dívida',

  p2_aviso_topo:
    'A falta de pagamento resultará em multa e juros a longo prazo.',
  p2_titulo_valor_aberto: 'Valor em aberto',
  p2_aviso_rodape:
    'A falta de pagamento após o prazo resultará em multa e juros.',
  p2_botao_regularizar: 'Regularizar agora',
  p2_link_pagamento: 'Clique aqui para ser direcionado para o sistema de pagamentos',

  modal_texto_html:
    '<p>Confirme abaixo a emissão do pagamento referente à sua fatura em aberto.</p>',
  modal_botao_emitir: 'Emitir pagamento',
  modal_botao_emitir_guia: 'Emitir guia',

  fatura_titulo: 'Pagamento de fatura',
  fatura_periodo_label: 'Período de apuração',
  fatura_aviso:
    'Escaneie ou copie o código e pague através do seu banco. Para evitar o cancelamento do seu serviço, regularize o quanto antes.',

  // Email de cobrança em lote — {{CNPJ}} e {{NOME}} são substituídos por
  // cobrança na hora de gerar; o resto é igual para todos os emails.
  email_banner_titulo: 'Seu CNPJ {{CNPJ}}',
  email_banner_subtitulo: 'Temos condições especiais disponíveis para você.',
  email_saudacao: 'Olá, {{NOME}},',
  email_paragrafo:
    'Identificamos uma pendência em aberto em seu nome. Preparamos condições facilitadas para que você possa regularizar essa situação de forma simples e rápida.',
  email_rotulo_valor: 'VALOR ATUALIZADO',
  email_rotulo_vencimento: 'VENCIMENTO',
  email_botao1_texto: 'Pagar agora online',
  email_cor_botao1: '#219653',
  email_cor_texto_botao1: '#ffffff',
  email_botao2_texto: 'Emitir guia',
  email_cor_botao2: '#E3963E',
  email_cor_texto_botao2: '#ffffff',
  email_apoio_antes: 'Prefere negociar por outro canal?',
  email_apoio_link_texto: 'Fale com a gente',
  email_apoio_link: '',
  email_imagem_url: '',
  email_empresa_nome: 'Sua Empresa Ltda.',
  email_empresa_cnpj: '00.000.000/0001-00',
  email_empresa_endereco: 'Rua Exemplo, 123 — São Paulo, SP',
  email_descadastro_texto:
    'Se preferir não receber mais este tipo de comunicação por email, clique aqui.',
  email_descadastro_link: '',
  // Imagem no canto direito do rodapé do email (opcional). Sem valor
  // definido, o rodapé continua só com o texto, como hoje.
  email_rodape_imagem_url: '',
  email_fonte: 'Arial, Helvetica, sans-serif',
  email_cor_cabecalho: '#16233E',
  email_cor_banner: '#2F4C74',
} as const;

export type ConfigKey = keyof typeof DEFAULT_CONFIG;
export type ConfigMap = { [K in ConfigKey]: string };

// Busca todas as configurações no banco e preenche o que faltar com os padrões.
export async function getConfig(): Promise<ConfigMap> {
  const rows = await prisma.configuracao.findMany();
  const overrides = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
  return { ...DEFAULT_CONFIG, ...overrides } as ConfigMap;
}

// Salva (upsert) um conjunto de chaves de configuração.
export async function saveConfig(values: Partial<ConfigMap>): Promise<void> {
  const entries = Object.entries(values) as [ConfigKey, string][];
  await prisma.$transaction(
    entries.map(([chave, valor]) =>
      prisma.configuracao.upsert({
        where: { chave },
        update: { valor },
        create: { chave, valor },
      })
    )
  );
}
