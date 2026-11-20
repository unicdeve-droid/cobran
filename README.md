# Sistema de Cobranças — MVP

> **Nota desta cópia:** esta é a variante preparada para deploy na **Vercel**.
> Troca o Postgres local (Docker) pelo **Neon** e o armazenamento em disco
> pelo **ImageKit** — veja `.env.example` pras variáveis necessárias. A versão
> Docker/local original continua existindo separadamente; esta não a substitui.
>
> **Atenção com os fluxos em lote** ("Subir boletos em lote" e "Gerar emails
> em lote"): a Vercel limita o corpo de cada requisição (4,5MB no plano
> gratuito) e o tempo de execução de cada função. Pra 40-50 mil cobranças,
> use lotes bem menores do que no ambiente Docker/VPS — ou prefira rodar
> esses dois fluxos específicos direto no VPS, que não tem esse teto.

Sistema interno para cobrança de assinantes inadimplentes: cada devedor recebe
um link único (`/cobranca/[uuid]`) com uma página de aviso, detalhamento da
dívida e emissão de fatura com QR code PIX. Tudo é gerenciado pelo painel
administrativo em `/xcexm2r4oq4tfzm7rf5222`.

Este é um **MVP**: os dados dos devedores e os QR codes são inseridos
manualmente pelo painel. A fase 2 (integração real com Asaas, leitura direta
do seu banco de dados e chatbot de cobrança via WhatsApp) fica para depois da
validação com o seu sócio.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + PostgreSQL +
Docker — o mesmo padrão dos seus outros projetos.

## Pré-requisitos

- Node.js 18.17+ (recomendado 20+)
- Docker Desktop (mais fácil, só para rodar o Postgres) **ou** um Postgres
  local já instalado

## Como rodar (caminho recomendado para o MVP local)

```powershell
# 1. Instalar dependências
npm install

# 2. Subir só o banco de dados via Docker
docker-compose up -d db

# 3. Criar as tabelas e popular com dados iniciais (admin + textos padrão + 1 cobrança de exemplo)
npx prisma migrate dev --name init

# 4. Rodar o projeto
npm run dev
```

Acesse **http://localhost:3000**.

> O arquivo `.env` já vem preenchido com valores padrão que combinam com o
> `docker-compose.yml`. Se preferir usar um Postgres já instalado na sua
> máquina em vez do Docker, troque `db` por `localhost` na `DATABASE_URL`.

Se em algum momento quiser repopular os dados padrão manualmente:

```powershell
npx prisma db seed
```

## Login do painel

```
URL:   http://localhost:3000/xcexm2r4oq4tfzm7rf5222/login
Email: admin@empresa.com
Senha: admin123
```

Troque essa senha (crie um novo registro em `Admin` ou edite via Prisma
Studio: `npx prisma studio`) antes de qualquer uso além do teste local.

## Cobrança de exemplo

O seed já cria uma cobrança de demonstração para você testar o fluxo
completo sem precisar cadastrar nada:

```
http://localhost:3000/cobranca/11111111-1111-1111-1111-111111111111
```

Ela tem uma dívida em aberto e uma já paga, então dá pra ver os dois estados.

## Problema comum: porta 5432 ocupada

Se `npx prisma migrate dev` der `Error: P1001: Can't reach database server`,
mesmo com o container rodando, o motivo mais provável é ter um PostgreSQL
nativo já instalado na sua máquina (Windows/Mac) ocupando a porta 5432
padrão — os dois brigam pela mesma porta.

Por isso o `docker-compose.yml` já vem configurado para expor o banco na
porta **5433** (não 5432) e o `.env` já aponta para `127.0.0.1:5433`. Se
mesmo assim der conflito, confirme com:

```powershell
netstat -ano | findstr :5433
```

Se aparecer algo, troque `5433` por outra porta livre (ex: `5434`) tanto no
`docker-compose.yml` quanto no `.env`, depois:

```powershell
docker-compose down
docker-compose up -d db
npx prisma migrate dev --name init
```

(`docker-compose restart` não é suficiente depois de mudar a porta — precisa
recriar o container com `down` + `up`.)

## O que é editável pelo painel

- **Cada cobrança** (`/xcexm2r4oq4tfzm7rf5222/nova` e `/xcexm2r4oq4tfzm7rf5222/[id]`):
  dados da empresa devedora (razão social, CNPJ, data de abertura, CEP),
  dados do titular (nome, CPF, data de nascimento) — cada campo com uma
  chave para exibir ou ocultar no link público —, as dívidas (mês/ano/valor/
  status) e o QR code + código PIX copia-e-cola daquela cobrança específica.
- **Configurações** (`/xcexm2r4oq4tfzm7rf5222/configuracoes`): a logo da sua
  empresa e todos os textos das páginas públicas (avisos, textos de botão,
  texto do modal com negrito/itálico, textos da fatura) — nenhum texto está
  hard-coded.

## Base de MEIs (`/xcexm2r4oq4tfzm7rf5222/mei`)

Seção separada das Cobranças, para importar e filtrar uma base de leads de
MEI a partir de CSV (formato da Receita Federal). Sem relação com o modelo
de Cobranca — é só uma tabela a mais no mesmo banco.

Cada lead recebe um número sequencial (`Nº`) na ordem exata em que foi
importado — a primeira linha do CSV é sempre o nº 1, a última é o número
mais alto. Esse número é fixo (não muda com filtro ou paginação) e é o que
"do registro nº ___ até nº ___" usa, tanto na exportação quanto em "Gerar
cobranças" — então o intervalo que você digita bate sempre com o que está
na tela, sem depender de data/hora de importação.

- **Importar**: aceita selecionar vários arquivos CSV de uma vez (`utf-8-sig`
  com BOM, colunas `nome, cnpj, cpf*, telefone, email, data_abertura, cep,
  uf, municipio, cnae, modulo` — `cpf` é opcional, funciona com ou sem essa
  coluna). Cada arquivo é processado e mostra um resumo (quantos importados,
  quantos ignorados). **CNPJ já existente nunca é duplicado nem sobrescrito**
  — se já está no banco, a linha é simplesmente ignorada.
- **Contador** no topo mostra o total de leads no banco.
- **Filtros**: UF, município, módulo, CNAE, intervalo de data de abertura, e
  busca por nome/CNPJ/CPF.
- **Exportar**: escolhe quais colunas quer (ex: só email + telefone) e um
  intervalo de registros (ex: do 1º ao 100º da lista filtrada), gera um
  `.csv` sem BOM que abre direto no Google Sheets.
- **Município**: o CSV traz um código interno da Receita (não é o código
  IBGE oficial), não o nome da cidade. Existe uma tabela de conversão
  (`Municipio`) pronta para popular — enquanto ela estiver vazia, a
  interface mostra o código como `Cód. 1234` no lugar do nome. Assim que
  você tiver o arquivo oficial de conversão da Receita, é só importar nessa
  tabela que os nomes passam a aparecer automaticamente em toda a interface,
  sem precisar mexer em mais nada.
- **Gerar cobranças em lote**: escolhe um intervalo de leads (ex: do 1º ao
  40º, respeitando os filtros ativos na tela) e clica em "Gerar cobranças".
  Cria uma Cobrança pra cada lead automaticamente — razão social, CNPJ,
  nome, email e telefone já preenchidos (CNPJ/CPF formatados). CPF e data de
  nascimento ficam ocultos no link público por padrão. Um lead que já gerou
  cobrança fica marcado (com link direto "Ver cobrança" na tabela) e não
  gera de novo se o intervalo for repetido — nada duplica.
  Opcionalmente, dá pra definir um **valor + mês/ano + QR code + código PIX**
  no próprio modal — como todas as cobranças do lote saem com o mesmo valor,
  o mesmo QR/PIX serve pra todas, sem precisar configurar uma por uma depois.
  Se deixar o valor em branco, gera sem dívida (pra adicionar manualmente
  depois, como antes).
- **Subir boletos em lote (.zip)**: anexa PDFs de boleto a várias cobranças
  de uma vez. Cada PDF dentro do .zip precisa começar com o número da
  cobrança (ex: `01_boleto.pdf` → cobrança nº 1, `02_boleto.pdf` → nº 2;
  aceita `_`, `-` ou espaço depois do número, com ou sem zero à esquerda).
  O sistema localiza a cobrança pelo número, salva o PDF e preenche o campo
  usado no botão "Emitir guia" automaticamente. No final mostra quantos
  foram anexados, quais números não bateram com nenhuma cobrança, e quais
  arquivos não tinham um número reconhecível no nome.

## Emails de cobrança em lote

Na tela de Cobranças (`/xcexm2r4oq4tfzm7rf5222`), o botão **"Gerar emails"** cria
um `.html` de email por cobrança, pronto pra usar na sua ferramenta de
disparo:

- Escolhe o intervalo por número de cobrança (**do nº ___ até nº ___** —
  mesmo número usado em "Gerar cobranças" e "Subir boletos"). Funciona com
  intervalos grandes (ex: 1 até 60.000).
- Baixa um `.zip` com um arquivo por cobrança, nomeado com o número na
  frente (`1_email.html`, `2_email.html`...) e um `0_RESUMO.txt` dizendo
  quantos foram gerados e quais números foram pulados.
- **Só gera email pra cobrança com dívida em aberto** — sem valor/vencimento
  não tem o que mostrar, então esses números aparecem no resumo como
  pulados, sem travar o restante do lote.
- **Vencimento = sempre dia 20 do mês da dívida** (dívida de julho vence
  20/07, de agosto vence 20/08). É calculado na hora, não é um campo salvo
  no banco, e só aparece dentro do email — não muda nada na interface do
  site.
- O botão "Pagar agora online" do email vai para o link público da
  cobrança; o botão "Emitir guia" vai **direto para o PDF do boleto**
  (pulando a tela de 3 segundos, já que faz sentido só na navegação normal)
  — se a cobrança ainda não tiver boleto anexado, cai na página de emissão
  normal como reserva.
- Textos, cores e dados da empresa ficam em **Modelo de email**
  (`/xcexm2r4oq4tfzm7rf5222/email-config`), separado das Configurações da página
  pública. CNPJ e nome são os únicos textos com uma parte fixa e uma parte
  que muda por pessoa (usando `{{CNPJ}}` e `{{NOME}}` no texto — o resto do
  texto ao redor é livre pra editar).
- A logo do email é a mesma configurada em Configurações → Marca da
  empresa (não duplica upload). Enquanto o projeto roda em localhost, a
  logo e a imagem opcional do email não aparecem pra quem recebe de
  verdade (a caixa de entrada não alcança seu localhost) — isso resolve
  sozinho assim que o projeto estiver num domínio público.

## Estrutura do projeto

```
src/
  app/
    xcexm2r4oq4tfzm7rf5222/       painel admin (login, dashboard, criar/editar, configurações)
    cobranca/[uuid]/        páginas públicas (landing, detalhes, fatura)
    api/                    rotas da API (auth, cobrancas, dividas, configuracoes, upload)
  components/
    admin/                  formulários e componentes do painel
    public/                 componentes das páginas públicas
    ui/                     botão, input, select, toggle etc.
  lib/                      prisma client, auth (JWT), config, formatação
prisma/
  schema.prisma             modelos: Admin, Cobranca, Divida, Configuracao
  seed.mjs                  popula admin + textos padrão + cobrança de exemplo
```

## Decisões e simplificações deste MVP

Algumas coisas que não estavam 100% explícitas no escopo e que resolvi de um
jeito específico — vale conferir se está de acordo:

- **Logo da empresa**: aparece num cabeçalho fino em todas as páginas
  públicas (landing, detalhes e fatura), além do modal — não só no modal e na
  fatura como no pedido original. Deu mais consistência de marca ao longo do
  funil; se preferir só no modal/fatura, é uma mudança pequena.
- **QR code / PIX copia-e-cola**: ficou por cobrança (não um upload único
  "padrão para todos"), já que cada dívida tem um valor diferente e o PIX
  precisa refletir isso — foi o que você confirmou depois.
- **Valor na fatura**: adicionei uma linha "Valor" ao lado do período de
  apuração (soma das dívidas em aberto) — não estava no texto original, mas
  parece necessário numa fatura. Fácil de remover se não fizer sentido pra
  você.
- **Textos editáveis vs. rótulos de campo**: os *textos* (avisos, botões,
  texto do modal) são 100% editáveis pela guia Configurações. Os *rótulos*
  dos campos de dados (a palavra "CNPJ", "CPF" etc.) são fixos — o que muda
  por cobrança são os valores e se aparecem ou não.
- **Cor azul `#1351b4` e fonte Rawline**: mantidos como pedido para este MVP
  de apresentação. Rawline é carregada via CDN oficial do gov.br (fonte OFL,
  de uso livre) com Raleway (Google Fonts) como alternativa — Raleway é
  literalmente a base da Rawline, então a aparência praticamente não muda se
  o CDN estiver fora do ar.
- **Uploads (logo/QR)**: ficam salvos em `/uploads` (fora da pasta `public`)
  e são servidos por uma rota própria da aplicação. Isso evita um problema
  real do modo de build "standalone" do Next.js (usado no Dockerfile), que
  não serve de forma confiável arquivos gravados depois do build a partir da
  pasta `public`.

## Docker (para mais pra frente — VPS)

Para o MVP local, `npm run dev` é o caminho mais simples. Quando for a hora
de subir num VPS:

```bash
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

O `Dockerfile` usa o build "standalone" do Next.js (multi-stage, imagem
enxuta) já com a correção para o engine nativo do Prisma não ficar de fora
do bundle final — o mesmo tipo de ajuste que vocês já tiveram que fazer nos
outros projetos com build standalone.

Nginx não está incluso neste MVP (não faz sentido sem domínio ainda) — é só
adicionar um proxy reverso na frente do container `app` quando for pra
produção de verdade.

## Próximos passos (fase 2, após aprovação)

1. Trocar o cadastro manual de cobranças por leitura direta do seu banco de
   dados (assinantes inadimplentes reais).
2. Integrar o gateway de pagamentos do Asaas (geração real de QR/PIX,
   webhook de confirmação de pagamento).
3. Chatbot de cobrança via WhatsApp (Evolution API/Z-API ou WhatsApp
   Business Cloud API) reaproveitando os mesmos links `/cobranca/[uuid]`.
4. Importar a tabela oficial de conversão de município da Receita Federal
   (pendente — assim que você mandar o arquivo, os nomes de cidade passam a
   aparecer em toda a Base de MEIs no lugar dos códigos).
