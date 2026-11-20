import type { ConfigMap } from './config';

export interface EmailDadosCobranca {
  cnpj: string;
  nome: string;
  valor: string;
  vencimento: string;
  linkPagamento: string;
  linkGuia: string;
}

function esc(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('"')
    .join('&quot;');
}

function substituir(template: string, dados: Record<string, string>): string {
  let resultado = template;
  for (const [chave, valor] of Object.entries(dados)) {
    resultado = resultado.split(`{{${chave}}}`).join(valor);
  }
  return resultado;
}

// Uploads feitos pelo painel (logo, imagem de apoio, imagem do rodapé) hoje
// já vêm do ImageKit como URL absoluta (https://ik.imagekit.io/...), então
// isso passa direto na prática. Fica como proteção: se algum dia um valor
// relativo (tipo /algo.png) acabar salvo no banco, um cliente de email não
// tem "origem atual" pra completar esse caminho sozinho — aqui a URL vira
// absoluta, usando o domínio de NEXT_PUBLIC_BASE_URL.
function absolutizarUrl(baseUrl: string, url: string | null | undefined): string {
  const valor = url?.trim();
  if (!valor) return '';
  if (/^https?:\/\//i.test(valor)) return valor;
  return `${baseUrl}${valor.startsWith('/') ? '' : '/'}${valor}`;
}

// Gera o HTML final do email para uma cobrança específica, combinando os
// textos/cores padrão (config, editáveis em /xcexm2r4oq4tfzm7rf5222/email-config)
// com os dados dinâmicos daquela cobrança. Estrutura idêntica ao editor
// HTML fornecido, incluindo os comentários condicionais para Outlook (MSO).
export function gerarEmailHtml(config: ConfigMap, dados: EmailDadosCobranca, baseUrl: string): string {
  const bannerTitulo = substituir(config.email_banner_titulo, { CNPJ: dados.cnpj });
  const saudacao = substituir(config.email_saudacao, { NOME: dados.nome });
  const anoAtual = new Date().getFullYear();

  const imagemUrl = absolutizarUrl(baseUrl, config.email_imagem_url);
  const linhaImagem = imagemUrl
    ? `
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <img src="${esc(imagemUrl)}" width="240" alt="Imagem" style="display:block; max-width:240px; width:100%; height:auto; border:0;">
            </td>
          </tr>`
    : '';

  // Imagem opcional no canto direito do rodapé. Sem valor definido, a
  // coluna de texto do rodapé simplesmente ocupa a largura toda (comportamento
  // atual, inalterado).
  const rodapeImagemUrl = absolutizarUrl(baseUrl, config.email_rodape_imagem_url);
  const colunaRodapeImagem = rodapeImagemUrl
    ? `
                <td valign="middle" align="right" style="width:88px; padding-left:16px;">
                  <img src="${esc(rodapeImagemUrl)}" width="72" alt="" style="display:block; max-width:72px; width:100%; height:auto; border:0;">
                </td>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<title>Email</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; background-color: #F4F6F9; }
  .fonte { font-family: ${config.email_fonte}; }
  @media screen and (max-width: 600px) {
    .container-email { width: 100% !important; }
    .padding-mobile { padding-left: 20px !important; padding-right: 20px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#F4F6F9;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
    Confira as informações do seu débito e as opções de pagamento disponíveis.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" class="container-email" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:#FFFFFF; border-radius:6px; overflow:hidden;">

          <tr>
            <td style="background-color:${config.email_cor_cabecalho}; padding: 24px 32px;">
              <img src="${esc(absolutizarUrl(baseUrl, config.empresaLogoUrl))}" width="160" height="40" alt="Logo" style="display:block; border:0;">
            </td>
          </tr>

          <tr>
            <td style="background-color:${config.email_cor_banner}; padding: 36px 32px;">
              <p class="fonte" style="margin:0; color:#FFFFFF; font-size:24px; line-height:30px; font-weight:bold;">${esc(bannerTitulo)}</p>
              <p class="fonte" style="margin:8px 0 0 0; color:#DCE1E8; font-size:15px; line-height:22px;">${esc(config.email_banner_subtitulo)}</p>
            </td>
          </tr>

          <tr>
            <td class="padding-mobile" style="padding: 32px 32px 8px 32px;">
              <p class="fonte" style="margin:0 0 16px 0; color:#2A2E35; font-size:15px; line-height:23px;">${esc(saudacao)}</p>
              <p class="fonte" style="margin:0 0 16px 0; color:#2A2E35; font-size:15px; line-height:23px;">${esc(config.email_paragrafo)}</p>
            </td>
          </tr>

          <tr>
            <td class="padding-mobile" style="padding: 8px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F9; border:1px solid #DCE1E8; border-radius:6px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p class="fonte" style="margin:0 0 4px 0; color:#5B6472; font-size:13px;">${esc(config.email_rotulo_valor)}</p>
                    <p class="fonte" style="margin:0 0 14px 0; color:#16233E; font-size:24px; font-weight:bold;">${esc(dados.valor)}</p>
                    <p class="fonte" style="margin:0 0 4px 0; color:#5B6472; font-size:13px;">${esc(config.email_rotulo_vencimento)}</p>
                    <p class="fonte" style="margin:0; color:#2A2E35; font-size:15px;">${esc(dados.vencimento)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="padding-mobile" align="center" style="padding: 28px 32px 12px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:6px; background-color:${config.email_cor_botao1};">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(dados.linkPagamento)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="12%" fillcolor="${config.email_cor_botao1}" stroke="f">
                    <w:anchorlock/>
                    <center style="color:${config.email_cor_texto_botao1};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${esc(config.email_botao1_texto)}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${esc(dados.linkPagamento)}" target="_blank" class="fonte" style="display:inline-block; padding:14px 40px; color:${config.email_cor_texto_botao1}; font-size:16px; font-weight:bold; text-decoration:none; border-radius:6px;">${esc(config.email_botao1_texto)}</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="padding-mobile" align="center" style="padding: 4px 32px 12px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius:6px; background-color:${config.email_cor_botao2};">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(dados.linkGuia)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="12%" fillcolor="${config.email_cor_botao2}" stroke="f">
                    <w:anchorlock/>
                    <center style="color:${config.email_cor_texto_botao2};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${esc(config.email_botao2_texto)}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${esc(dados.linkGuia)}" target="_blank" class="fonte" style="display:inline-block; padding:14px 40px; color:${config.email_cor_texto_botao2}; font-size:16px; font-weight:bold; text-decoration:none; border-radius:6px;">${esc(config.email_botao2_texto)}</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="padding-mobile" align="center" style="padding: 10px 32px 30px 32px;">
              <p class="fonte" style="margin:0; color:#5B6472; font-size:13px; line-height:20px; text-align:center;">
                ${esc(config.email_apoio_antes)} <a href="${esc(config.email_apoio_link)}" style="color:${config.email_cor_banner}; text-decoration:underline;">${esc(config.email_apoio_link_texto)}</a>
              </p>
            </td>
          </tr>
${linhaImagem}

          <tr>
            <td style="background-color:${config.email_cor_cabecalho}; padding: 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" align="left">
                    <p class="fonte" style="margin:0 0 10px 0; color:#AEB8C9; font-size:12px; line-height:19px;">
                      <strong>${esc(config.email_empresa_nome)}</strong> — CNPJ ${esc(config.email_empresa_cnpj)}<br>${esc(config.email_empresa_endereco)}
                    </p>
                    <p class="fonte" style="margin:0 0 10px 0; color:#AEB8C9; font-size:12px; line-height:19px;">
                      <a href="${esc(config.email_descadastro_link)}" style="color:${config.email_cor_botao2}; text-decoration:underline;">${esc(config.email_descadastro_texto)}</a>
                    </p>
                    <p class="fonte" style="margin:0; color:#7C879A; font-size:12px;">© ${anoAtual} ${esc(config.email_empresa_nome)}. Todos os direitos reservados.</p>
                  </td>${colunaRodapeImagem}
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
