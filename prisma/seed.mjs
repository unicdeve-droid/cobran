import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CONFIG = {
  empresaLogoUrl: '',
  p1_alerta_titulo: 'Aviso importante',
  p1_alerta_texto: 'Consta um débito em aberto associado a este CNPJ.',
  p1_botao_ver_inadimplencia: 'Ver inadimplência',
  p1_link_pagar_divida: 'Clique aqui para pagar a sua dívida',
  p2_aviso_topo: 'A falta de pagamento resultará em multa e juros a longo prazo.',
  p2_titulo_valor_aberto: 'Valor em aberto',
  p2_aviso_rodape: 'A falta de pagamento após o prazo resultará em multa e juros.',
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
  email_fonte: 'Arial, Helvetica, sans-serif',
  email_cor_cabecalho: '#16233E',
  email_cor_banner: '#2F4C74',
};

// Em produção, defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar o seed.
// Sem elas, cai no padrão de teste local.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@empresa.com';
const ADMIN_SENHA = process.env.ADMIN_PASSWORD || 'admin123';

async function main() {
  console.log('Seed: criando usuário admin...');
  const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, senha: senhaHash },
  });

  console.log('Seed: criando configurações padrão...');
  for (const [chave, valor] of Object.entries(DEFAULT_CONFIG)) {
    await prisma.configuracao.upsert({
      where: { chave },
      update: {},
      create: { chave, valor },
    });
  }

  const existente = await prisma.cobranca.findFirst({
    where: { cnpj: '12.345.678/0001-90' },
  });

  if (!existente) {
    console.log('Seed: criando cobrança de demonstração...');
    const hoje = new Date();
    await prisma.cobranca.create({
      data: {
        razaoSocial: 'Empresa Exemplo LTDA',
        cnpj: '12.345.678/0001-90',
        dataAbertura: new Date('2018-03-12'),
        cep: '01310-100',
        nomeCompleto: 'João da Silva',
        cpf: '123.456.789-00',
        dataNascimento: new Date('1985-07-22'),
        email: 'contato@empresaexemplo.com.br',
        telefone: '(11) 98888-7777',
        dividas: {
          create: [
            {
              mes: hoje.getMonth() === 0 ? 12 : hoje.getMonth(),
              ano: hoje.getMonth() === 0 ? hoje.getFullYear() - 1 : hoje.getFullYear(),
              valor: 349.9,
              status: 'aberto',
            },
            {
              mes: hoje.getMonth() === 0 ? 11 : hoje.getMonth() === 1 ? 12 : hoje.getMonth() - 1,
              ano:
                hoje.getMonth() <= 1 ? hoje.getFullYear() - 1 : hoje.getFullYear(),
              valor: 349.9,
              status: 'pago',
            },
          ],
        },
      },
    });
  }

  console.log('Seed concluído.');
  console.log(
    process.env.ADMIN_PASSWORD
      ? `Login do painel: ${ADMIN_EMAIL} (senha definida em ADMIN_PASSWORD)`
      : `Login do painel: ${ADMIN_EMAIL} / ${ADMIN_SENHA}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
