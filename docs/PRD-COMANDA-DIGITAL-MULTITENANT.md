# PRD — Comanda Digital para Pequenos Comércios (multi-tenant)

> Versão 1.0 · 07/11/2026 · Origem: piloto "Bingo Beneficente" da Casa de Caridade Caboclo Batuara (07/11/2026).
> Este documento descreve o produto-alvo (SaaS multi-tenant). O que já existe no piloto está marcado como **[Piloto]**; o que é novo para o produto está marcado como **[Novo]**.

---

## 1. Visão

Uma comanda digital que o cliente abre **escaneando um QR code na mesa**, sem instalar aplicativo, e que a equipe do estabelecimento (garçons e caixa) acompanha em tempo real no celular. O cliente pede do cardápio, acompanha a entrega, pede a conta e paga no caixa ou com o garçom; o estabelecimento confere o caixa por garçom, controla a saída e guarda o histórico de cada evento ou turno.

**Problema.** Comanda de papel perde pedidos, gera disputa na hora de pagar, não mostra quem entregou o quê, não fecha o caixa por garçom e deixa o dono sem histórico. Soluções de delivery e PDV completos são caras e pesadas para um evento beneficente, uma barraca, um bar pequeno ou uma festa.

**Proposta.** Um produto leve, mobile-first, que funciona em Wi-Fi ruim, não exige cadastro do cliente além de nome e celular, e entra em operação em minutos.

**Origem do produto.** O piloto foi construído e usado num bingo beneficente (16h–0h) com mesas numeradas, cardápio de comidas e bebidas, vários garçons voluntários e pagamento no caixa. Todas as regras abaixo foram validadas, ou corrigidas, nesse uso real.

## 2. Objetivos e métricas de sucesso

| Objetivo | Métrica | Meta |
|---|---|---|
| Reduzir erro e disputa | Itens contestados / itens entregues | < 2% |
| Fechar o caixa sem divergência | Divergência entre "recebido" no sistema e dinheiro/maquininha conferidos | 0 por turno |
| Agilidade do cliente | Tempo do QR até o primeiro pedido enviado | < 60 s |
| Agilidade do garçom | Tempo do pedido até "retirado" visível ao garçom | < 5 s (4 s de polling no piloto) |
| Onboarding | Tempo para um novo comércio abrir o primeiro evento | < 30 min, sem suporte |
| Resiliência | Evento sem queda total em Wi-Fi instável | 100% das comandas recuperáveis ao reconectar |
| Privacidade | Dados pessoais apagados ou anonimizados no prazo | 100% |

**Não-objetivos da v1:** pagamento online (Pix/cartão dentro do app), emissão fiscal, estoque/insumos, integração com maquininha, cardápio com fotos e variações complexas, delivery.

## 3. Personas

- **Dono/Administrador do comércio (tenant admin):** configura evento, cardápio, mesas, garçons e formas de pagamento; acompanha o painel; fecha o evento e imprime o fechamento.
- **Garçom (funcionário ou voluntário):** recebe pedidos, retira e entrega itens, cobra contas, mostra o QR da mesa, confere a saída.
- **Caixa:** cobra contas (pode ser o próprio garçom ou o admin), concilia o caixa.
- **Cliente (comensal):** abre a comanda pelo QR, pede, acompanha, contesta, pede a conta.
- **Operador da plataforma (super admin):** cria e suspende tenants, define planos, acompanha uso e custos de mensageria.

## 4. Glossário

Tenant (estabelecimento/organização) · Evento (turno de venda com data, cardápio e mesas próprios; pode ser de teste) · Comanda (conta de um cliente num evento) · Item (linha de pedido) · Mesa · Retirada (garçom pegou o item para levar) · Entrega · Contestação · Fechamento (pedido de conta) · Baixa de saída.

## 5. Escopo funcional

### 5.1 Plataforma e multi-tenancy [Novo]

- **RF-T1** Cadastro de tenant (nome, documento opcional, responsável, e-mail, fuso horário, moeda, logotipo, cores) com slug único (ex.: `barzinho`).
- **RF-T2** Cada tenant é totalmente isolado: cardápio, eventos, comandas, garçons, formas de pagamento, configurações e dados pessoais.
- **RF-T3** Usuários pertencem a um ou mais tenants com papéis: `Owner`, `Admin`, `Garçom`, `Caixa`. Um mesmo usuário pode ser garçom em tenants diferentes.
- **RF-T4** Identificação do tenant em toda requisição: subdomínio (`slug.dominio.com`) ou caminho (`/t/slug`), nunca por dado enviado pelo cliente sem validação. O token de acesso carrega o `tenant_id`, e o servidor valida o vínculo a cada chamada.
- **RF-T5** Planos e limites por tenant: eventos ativos simultâneos, nº de garçons, nº de comandas/mês, cota de mensagens WhatsApp, retenção do histórico.
- **RF-T6** Convite de garçons por link/e-mail/WhatsApp e escala por evento (substitui "filho da Casa" do piloto).
- **RF-T7** Painel do operador da plataforma: lista de tenants, plano, uso, suspensão, impersonação auditada para suporte.
- **RF-T8** Exportação e exclusão dos dados do tenant sob solicitação (LGPD).
- **RF-T9** Trilha de auditoria: quem fez o quê (cancelamento, pagamento, mudança de mesa, liberação de saída, resolução de contestação), com data/hora e usuário.

### 5.2 Eventos [Piloto → generalizado]

- **RF-E1** Um tenant tem vários eventos (`Rascunho → Aberto → Encerrado`). Por padrão, **um evento aberto por vez por tenant** (configurável por plano).
- **RF-E2** Evento tem nome, data, cardápio, mesas, garçons escalados e formas de pagamento aceitas. **Copiar de evento anterior** (cardápio, mesas, garçons, preços) em um clique.
- **RF-E3** Evento marcado como **teste** pode ter seus dados zerados (com confirmação por palavra digitada). Evento real **nunca** pode ser zerado (regra no servidor e na tela).
- **RF-E4** Quantidade de mesas editável apenas em `Rascunho`; depois de iniciado, fica travada para não afetar comandas abertas.
- **RF-E5** "Pedir fechamento geral": avisa todos os clientes com conta aberta para encerrarem.
- **RF-E6** "Encerrar pedidos do evento": bloqueia novos pedidos; contas abertas continuam cobráveis.
- **RF-E7** Histórico de eventos com resumo e comandas, preservado conforme a retenção do plano.

### 5.3 Cardápio [Piloto]

- **RF-C1** Itens com nome, preço, disponibilidade (esgotado em cinza, sem poder pedir) e ordem. Edição em grade, com "Adicionar item" no topo.
- **RF-C2** Campo de valor com máscara R$.
- **RF-C3** [Novo] Categorias, imagem opcional, observação do pedido (ex.: "sem cebola"), itens com preço zero (cortesia), importação por planilha/CSV.

### 5.4 Mesas e QR [Piloto]

- **RF-M1** Mesas numeradas por evento. QR geral do evento (cliente escolhe a mesa) e **QR por mesa** (mesa já preenchida).
- **RF-M2** Admin imprime a folha do QR (A4) ou projeta em tela cheia. A prévia na tela é compacta (controles e QR na mesma linha, centralizados, sem rolagem).
- **RF-M3** O garçom vê o QR da mesa assim que escolhe a mesa na lista (sem botão extra) e toca para ampliar.
- **RF-M4** [Novo] Mesas com nome/zona (salão, varanda) e mapa simples.

### 5.5 Cliente (web mobile, sem instalar) [Piloto + Novo]

- **RF-CL1** Abertura da comanda: nome, celular com DDD e mesa. Aviso de privacidade visível. Se o aparelho já tem comanda aberta, vai direto a ela.
- **RF-CL2** **[Novo no piloto final] Reabrir comanda:** cliente que já usou o serviço neste aparelho vê "Olá, {nome}! Escolha sua mesa". Nome e celular ficam guardados no aparelho; "Não sou eu" apaga. Se o celular já foi confirmado no evento, a nova comanda nasce confirmada, sem novo código.
- **RF-CL3** **Confirmação do celular** por código de 6 dígitos via WhatsApp (template de autenticação). É **não bloqueante**: o cliente pode pedir antes de confirmar. Reenvio com limite de frequência; tentativas limitadas; selo "✓ confirmado". Existe sinalizador para tornar a confirmação obrigatória no fechamento.
- **RF-CL4** Cardápio compacto, paginado conforme a altura da tela (linhas de altura fixa), com quantidade em cada item e barra do carrinho sempre visível. Abas **Cardápio** e **Pedido**.
- **RF-CL5** Pedido: itens entram como `Pendente`. O cliente acompanha `Pendente → A caminho → Entregue`, com "Entregue às HH:mm por {primeiro nome}".
- **RF-CL6** **Contestação:** em item entregue, "Não recebi" com observação opcional. O item vai a `Em contestação` até o garçom/admin resolver.
- **RF-CL7** **Pedir a conta:**
  - Se houver itens não entregues, o servidor responde com a lista e o cliente escolhe **aguardar** ou **cancelar esses itens e encerrar**.
  - Itens em contestação não impedem encerrar.
  - O diálogo mostra o valor a pagar (só itens entregues).
- **RF-CL8** **[Novo no piloto final] Desistir do fechamento:** com a conta solicitada, o botão "Continuar pedindo" volta a comanda para `Aberta`.
- **RF-CL9** Totais: "Total consumido" e, quando diferente, "A pagar (itens entregues)".
- **RF-CL10** **QR de saída:** após o pagamento, a comanda mostra "Pagamento confirmado" e um QR para a conferência na saída (ver 5.8).
- **RF-CL11** Banner de "encerre sua conta" (fechamento geral) e de evento fechado. Polling a cada 4 s, pausado com a aba oculta.
- **RF-CL12** [Novo] Idioma, acessibilidade (contraste, tamanhos de toque ≥ 48 px) e modo "pedido assistido" (garçom lança pelo cliente).

### 5.6 Garçom (web mobile) [Piloto]

- **RF-G1** Entra com a conta de usuário normal; só opera se escalado no evento aberto. Sessão estendida (10 h) para o turno; o servidor revalida a escala a cada requisição.
- **RF-G2** Aba **Pedidos:** fila de itens pendentes por mesa e cliente, do mais antigo ao mais novo. Ações: **Retirar** (assume o item e mostra o nome de quem pegou aos demais garçons e ao admin), **Devolver**, **Entregar**. Contador vermelho de pendentes; a aba pisca e o aparelho vibra a cada novo pedido.
- **RF-G3** Aba **Contas:** filtros "Pediram a conta" e "Todas abertas". Expande a conta (itens com autor e horário). Ações:
  - **Cancelar item** (motivo obrigatório).
  - **Resolver contestação** (confirmar entrega ou cancelar).
  - **Mudar mesa da comanda.**
  - **Cobrar** uma ou várias comandas da mesma mesa, escolhendo a forma de pagamento e o nome de quem pagou.
- **RF-G4** **[Novo no piloto final] Aviso de conta pedida:** o contador vermelho da aba Contas mostra quantas comandas pediram a conta; a aba pisca e vibra quando chega uma nova, mesmo com outra aba aberta.
- **RF-G5** Aba **QR:** escolhe a mesa e o QR aparece na hora; toque amplia em tela cheia com botão "Fechar" visível.
- **RF-G6** **[Novo no piloto final] Conferência de saída:** abre o QR do cliente e vê tela grande verde/vermelha (ver 5.8).
- **RF-G7** Pagamento é bloqueado enquanto houver itens não entregues ou em contestação na comanda.

### 5.7 Caixa, pagamento e conferência [Piloto]

- **RF-P1** **Formas de pagamento** por tenant (Dinheiro, Pix, Cartão de crédito, Cartão de débito por padrão), configuráveis (adicionar, renomear, desativar).
- **RF-P2** "Fechar conta" no Painel (Admin) e no garçom: seleciona comandas da mesma mesa, forma de pagamento e quem pagou. Registra: valor, forma, **nome de quem recebeu**, horário.
- **RF-P3** Valor cobrado = soma dos itens **entregues**. Cancelados não contam. Contestados bloqueiam o pagamento até serem resolvidos.
- **RF-P4** **Conferência de caixa por garçom:** quanto cada garçom recebeu, por forma de pagamento.
- **RF-P5** [Novo] Abertura/fechamento de caixa com valor inicial (troco) e sangria; conciliação por forma de pagamento.
- **RF-P6** [Novo, fase 2] Pix com QR dinâmico via PSP e baixa automática.

### 5.8 Controle de saída por QR [Novo no piloto final]

- **RF-S1** Cada comanda paga mostra um QR com o link de conferência (identificador aleatório não adivinhável).
- **RF-S2** Quem confere abre o QR com a câmera nativa, logado como garçom escalado, e o servidor responde: **PAGO** (mesa, cliente, valor, horário, forma), **NÃO PAGA** (valor a receber) ou **comanda inválida**.
- **RF-S3** "Liberar saída" registra **a primeira conferência** (quem e quando). Nas seguintes mostra **JÁ CONFERIDA** com horário e responsável. Não bloqueia, para não atrapalhar quem sai e volta.
- **RF-S4** [Novo] Opção do tenant: baixa única bloqueante, ou conferência apenas informativa.

### 5.9 Painel ao vivo do administrador [Piloto]

- **RF-D1** Indicadores: Em aberto, Pediram a conta, Pagas, Itens pendentes, Itens retirados, Em contestação, Total vendido, Celular confirmado / não confirmado, Falha de entrega do código.
- **RF-D2** Os indicadores de comandas (Em aberto, Pediram a conta, Pagas, Celular confirmado, Não confirmado) são **filtros clicáveis**: filtram as tabelas Mesas e Contas; o chip ativo fica destacado e um segundo clique remove o filtro. Os de itens e de total são informativos.
- **RF-D3** Tabela **Mesas** (cliente, "A entregar" com **nome de quem retirou**, "Entregues", "Em contestação") e tabela **Contas** (conta pedida em destaque, celular confirmado, total e "a cobrar").
- **RF-D4** Atualização a cada 4 s (pausada com a aba oculta). Menu lateral recolhido na tela do Bingo para ganhar espaço.
- **RF-D5** Cardápio, Mesas, Garçons (com "visto por último" e entregas), Formas de pagamento e Resumo em abas.

### 5.10 Resumo e fechamento impresso [Piloto + Novo]

- **RF-R1** Resumo do evento: total recebido, a receber, cancelados, contestados; por forma de pagamento; por garçom; por item.
- **RF-R2** **Imprimir fechamento** (A4, com opção de salvar em PDF): cabeçalho com tenant/evento/data/emissão; totais; recebido por forma de pagamento; conferência de caixa por garçom; vendas por item; **comandas não fechadas** (em destaque, com valor a receber); comandas pagas; itens cancelados e contestados com motivo; linhas de assinatura (conferido por, responsável, data).
- **RF-R3** O fechamento traz nomes reais dos clientes enquanto não anonimizados. Depois da anonimização o relatório sai sem nomes; recomenda-se guardar o PDF antes do prazo.
- **RF-R4** [Novo] Exportação CSV/PDF/XLSX e envio do fechamento por e-mail ao responsável.
- **RF-R5** [Novo] Comparativo entre eventos (ticket médio, itens mais vendidos, horário de pico).

### 5.11 Mensageria WhatsApp [Piloto]

- **RF-W1** Provedor oficial (Meta Cloud API) por **número de WhatsApp do tenant** ou número compartilhado da plataforma (decisão em aberto, ver §14).
- **RF-W2** Templates usados: **código de confirmação** (categoria autenticação) e **aviso pós-evento / lembrete de pagamento** (marketing). Status de entrega (enviado/entregue/lido/falhou) por webhook, visível ao admin.
- **RF-W3** [Novo] **Cobrança amigável:** para comandas não pagas com celular confirmado, lembrete pós-evento com texto configurável, um disparo e dentro da retenção de 90 dias; opt-out respeitado.
- **RF-W4** Controle de custo: cota por plano, pré-visualização de quantos serão enviados antes do disparo, bloqueio ao atingir a cota, lista de destinatários permitidos para testes.
- **RF-W5** Abstração de canal (`IMessageChannel`) para SMS/e-mail como alternativa.

### 5.12 Privacidade e LGPD [Piloto]

- **RF-L1** Base legal e finalidade informadas no ato (nome e celular só para a comanda). Política de privacidade acessível.
- **RF-L2** **Retenção automática:** comanda paga tem nome e celular anonimizados em até **30 dias**; comanda não paga, em até **90 dias** (celular usável apenas para o lembrete). Valores e itens permanecem para histórico financeiro.
- **RF-L3** Atendimento ao titular (acesso, correção, exclusão) por rotina administrativa.
- **RF-L4** Minimização: cliente vê só o primeiro nome do garçom; o celular nunca aparece para outros clientes; logs sem dados pessoais em texto aberto.
- **RF-L5** Cada tenant é o **controlador** dos dados de seus clientes e a plataforma é a **operadora**; contrato e DPA padrão.

## 6. Regras de negócio e estados

**Comanda:** `Aberta → PediuConta → Paga`. `PediuConta → Aberta` quando o cliente desiste. `Paga` é final (reabrir = criar nova comanda).
**Item:** `Pendente → Retirado → Entregue`; `Retirado → Pendente` (devolver); `Entregue → EmContestação → Entregue | Cancelado`; `Pendente|Retirado|Entregue → Cancelado` (garçom/admin, motivo obrigatório; cliente pode cancelar não entregues ao encerrar).
**Valores:** `consumo = itens não cancelados`; `a pagar = itens entregues`. Pagamento exige `sem itens pendentes/retirados/contestados`.
**Unicidade:** um celular tem no máximo **uma comanda não paga por evento**; abrir de novo devolve a existente. Depois de paga, abre-se outra.
**Evento:** só um aberto por vez (por padrão); evento real não zera; mesas travadas após o início.
**Garçom:** só atua se escalado no evento aberto. Retirada registra quem pegou; entrega registra quem entregou; pagamento registra quem recebeu.
**Concorrência:** operações de item são idempotentes e retornam `409` com mensagem clara se o estado já mudou (ex.: dois garçons retirando o mesmo item).

## 7. Requisitos não funcionais

- **Desempenho mobile:** primeira tela do cliente interativa em ≤ 3 s em 4G médio e ≤ 6 s em Wi-Fi ruim; operações de pedido ≤ 500 ms no servidor (p95).
- **Tamanho do download inicial (cliente):** meta ≤ 2 MB comprimido (ver risco R1 sobre Blazor WebAssembly).
- **Resiliência de rede:** fila local de ações (pedir, contestar) com reenvio automático e indicação "sem conexão, tentando novamente"; nada se perde ao recarregar a página (comanda salva no aparelho).
- **Tempo real:** v1 com polling de 4 s (pausado em segundo plano); v2 com **SignalR** (WebSocket com fallback) para pedidos e avisos.
- **Disponibilidade:** 99,5% em horário de evento; deploy sem indisponibilidade (rolling) e **migrations idempotentes** com guarda de divergência.
- **Segurança:** HTTPS, JWT com expiração e papel por tenant, rate limiting por IP/rota (leitura vs. escrita), validação de entrada, proteção contra enumeração (identificadores aleatórios), CSRF/CORS restritos, segredos fora do repositório, auditoria de ações sensíveis.
- **Isolamento de dados:** filtro global por `TenantId` no EF Core **e** Row-Level Security no PostgreSQL (defesa em profundidade); testes automatizados de vazamento entre tenants.
- **Observabilidade:** logs estruturados com `tenant_id`, métricas (pedidos/min, latência, falhas de mensageria), health checks, alertas.
- **Backup e recuperação:** backup diário, restauração testada, retenção por plano.
- **Acessibilidade:** WCAG AA nos fluxos do cliente.
- **Localização:** pt-BR na v1; textos em recursos para traduzir; moeda e fuso por tenant.

## 8. Arquitetura proposta

**Stack:**
- **Banco:** PostgreSQL.
- **Backend:** API em **.NET 10** (ASP.NET Core, EF Core + Npgsql), Clean Architecture (Domain, Application, Infrastructure, API).
- **Frontend:** **Blazor WebAssembly** (PWA) para as três superfícies: cliente, garçom/caixa e administração; componentes de UI compartilhados em uma biblioteca de classes Razor.
- **Complementos:** SignalR (tempo real), jobs em segundo plano (`BackgroundService`/Quartz) para lembretes, retenção e anonimização, geração de QR no cliente.

**Multi-tenancy (recomendação):** banco único e esquema único com coluna `TenantId` em todas as tabelas de negócio, `ITenantContext` resolvido por requisição, *query filter* global e **RLS no Postgres** (`SET app.tenant_id` por conexão). Tenants grandes/exigentes podem migrar para banco dedicado depois, porque a camada de acesso já isola o contexto.
*Alternativas descartadas na v1:* esquema por tenant (custo alto de migrations em escala) e banco por tenant (custo operacional).

**Superfícies do frontend:**
1. `cliente` (rota pública `/{slug}/mesa/...`): carga mínima, sem autenticação.
2. `equipe` (garçom/caixa): autenticada, PWA instalável, notificações sonoras/vibração.
3. `admin` (dono): painel, cardápio, eventos, relatórios.
Cada uma é um conjunto de rotas lazy-loaded para não pesar o download do cliente.

**Integrações:** WhatsApp Cloud API (webhook de status) atrás de `IMessageChannel`; futuro PSP de Pix; armazenamento de imagens (cardápio) em object storage.

**Implantação:** contêineres (API, front estático servido por CDN/nginx, Postgres gerenciado), CI/CD com testes e verificação de migrations, ambientes `staging` e `produção`, feature flags por tenant.

## 9. Modelo de dados (resumo)

Todas as tabelas de negócio têm `TenantId` (índice composto no início das chaves de busca).

`Tenant`, `TenantPlan`, `TenantUser` (usuário ↔ tenant ↔ papel), `User`,
`Event` (nome, data, status, is_test, close_all_requested, opened_at, closed_at),
`MenuCategory`, `MenuItem` (evento, nome, preço, disponível, ordem),
`Table` (evento, número, nome/zona),
`Waiter` (evento, usuário, ativo, last_seen_at),
`PaymentMethod` (tenant, nome, ordem, ativo),
`Tab` (evento, mesa, nome, telefone, status, verificação do telefone, código/tentativas, entrega do código, lembrete, pagamento: forma, valor, quem pagou/recebeu, horário, nota; **saída: conferido em, conferido por**; criada/atualizada),
`OrderItem` (comanda, item do cardápio, nome e preço congelados, quantidade, status, retirado por/em, entregue por/em, contestado em/nota, cancelado por/em/motivo, resolvido por/em),
`MessageLog` (tabela de mensagens com status de entrega e custo estimado),
`AuditLog` (usuário, ação, entidade, antes/depois, data),
`UsageCounter` (por tenant/mês: comandas, mensagens, eventos).

**Índices e restrições importantes:** um evento aberto por tenant (índice único parcial); única comanda não paga por (tenant, evento, telefone); mesa única por (tenant, evento, número); índices por (tenant, evento, status).

## 10. API (grupos de endpoints)

Prefixo `/api/{tenant}/...` (ou subdomínio). Respostas padronizadas `{ success, data, message, code }`.

- **Públicos (cliente):** `GET info` · `POST comandas` · `GET comandas/{id}` · `POST comandas/{id}/itens` · `POST comandas/{id}/itens/{itemId}/contestar` · `POST comandas/{id}/encerrar` (com `cancelUndelivered`) · `POST comandas/{id}/reabrir` · `POST comandas/{id}/celular/enviar-codigo` · `POST comandas/{id}/celular/confirmar`.
- **Equipe (garçom):** `GET me` · `GET pedidos` · `POST itens/{id}/retirar|devolver|entregar|cancelar|resolver-contestacao` · `GET formas-pagamento` · `POST comandas/{id}/mesa` · `GET contas[?todas]` · `POST contas/pagar` · `GET saida/{tabId}` · `POST saida/{tabId}/liberar`.
- **Admin:** CRUD de eventos (+ abrir, encerrar, zerar teste, copiar de evento, fechamento geral), cardápio, mesas (+ QR), garçons (+ encerrar sessões), formas de pagamento, painel, resumo, histórico de comandas, pagamento, cancelamento e resolução de contestação, lembretes (pré-visualizar e enviar).
- **Plataforma:** tenants, planos, uso, suspensão.
- **Webhooks:** status de mensagens do WhatsApp.
- **Tempo real (SignalR):** hubs `team` (pedidos novos, conta pedida, mudanças de status) e `tab` (atualização da comanda do cliente).

## 11. Experiência (telas)

**Cliente:**
- Abrir comanda (ou "Olá, {nome}! Escolha sua mesa").
- Comanda compacta: cabeçalho fixo "COMANDA · Mesa N", nome e número da comanda, selo de celular confirmado.
- Abas **Cardápio / Pedido**, barra do carrinho fixa, "Não recebi", "Continuar pedindo", QR de saída.

**Equipe:**
- Abas **Pedidos** (badge), **Contas** (badge, filtros), **QR** (automático).
- Tela **Conferir saída** (verde/vermelho/âmbar).

**Admin:**
- Eventos, Painel ao vivo (indicadores-filtro, Mesas, Contas), Cardápio em grade editável, Mesas (controles e QR na mesma linha, centralizados), Garçons, Formas de pagamento, Resumo com **Imprimir fechamento**.

Regras de UI: mobile-first, alvos de toque ≥ 48 px, sem rolagem desnecessária, contraste alto, feedback sonoro/vibração apenas na equipe.

## 12. Aprendizados do piloto (entram como requisitos)

1. **Contestação e itens não entregues** precisam de fluxo próprio; sem isso, o fechamento vira discussão.
2. **Pagar só o entregue** e bloquear pagamento com pendência evita cobranças erradas.
3. **Quem retirou, entregou e recebeu** precisa aparecer para a equipe e no fechamento (responsabilização).
4. **Link por WhatsApp (marketing) pode não ser entregue**; para confirmar o celular o **template de autenticação com código** é mais confiável. Guardar e exibir o status de entrega.
5. **Tela do cliente tem que caber no celular** (iPhone) sem rolar; paginar o cardápio pela altura.
6. **Mesas travadas** depois do início e **evento de teste zerável** evitam acidentes.
7. **Migrations idempotentes no deploy** com guarda de divergência: toda migration nova entra no script de deploy.
8. **Wi-Fi do local é fraco:** polling leve, pausa em segundo plano, mensagens claras de reconexão e recuperação da comanda salva.
9. **Plano B em papel** deve existir no primeiro uso de cada tenant (tutorial de contingência).

## 13. Roadmap sugerido

| Fase | Entregas |
|---|---|
| **0 – Fundação (4–6 sem.)** | Solução .NET 10 + Blazor WASM, multi-tenant (filtro global + RLS), autenticação por tenant, CI/CD, observabilidade, testes de isolamento |
| **1 – Núcleo do evento (6–8 sem.)** | Eventos, cardápio, mesas/QR, comanda do cliente, garçom (pedidos/contas/QR), pagamento, painel, resumo e fechamento impresso, LGPD (retenção) |
| **2 – Operação confiável (4–6 sem.)** | Fila offline do cliente, SignalR, confirmação por WhatsApp, cobrança amigável, saída por QR, auditoria, copiar evento |
| **3 – Produto (6–8 sem.)** | Onboarding self-service, planos e cobrança, painel da plataforma, exportações, comparativo entre eventos, categorias/observações no cardápio |
| **4 – Pagamentos** | Pix dinâmico via PSP, caixa com troco/sangria, conciliação |

## 14. Riscos e decisões em aberto

- **R1 – Blazor WebAssembly no cliente.** O runtime .NET precisa ser baixado no primeiro acesso (alguns MB), o que pesa em Wi-Fi ruim justamente na tela que o cliente abre pelo QR. WASM também não costuma acelerar telas de formulário/lista; seu ganho está em processamento pesado. *Mitigações:* trimming e compressão Brotli, *lazy loading* por superfície, cache do PWA, pré-carregar enquanto o cliente lê o QR, medir a primeira carga em rede lenta como critério de aceite. Alternativa a avaliar para o cliente: Blazor com renderização estática/SSR na primeira tela e WASM só para a equipe e o admin.
- **R2 – Custo e política de mensageria** (Meta cobra por conversa/mensagem; marketing tem regras de opt-in). Definir quem paga e o limite por plano.
- **R3 – Vazamento entre tenants.** Exige RLS, testes automatizados e revisão de código focada.
- **R4 – Dependência de internet do local.** Definir o modo degradado (fila local, plano B em papel).
- **R5 – LGPD em escala.** DPA, política por tenant, rotina de atendimento ao titular, auditoria.

**Decisões em aberto:**
1. Número de WhatsApp: por tenant ou compartilhado?
2. Modelo de cobrança do SaaS (por evento, mensal, por comanda)?
3. Domínio e identificação do tenant: subdomínio ou caminho?
4. Baixa de saída: informativa (padrão do piloto) ou bloqueante por tenant?
5. Mais de um evento aberto por tenant (ex.: duas barracas)?
6. Cardápio por evento ou catálogo do tenant reaproveitado entre eventos?
7. Pix dentro do app já na v1 ou só na fase 4?
8. Retenção configurável por tenant ou fixa (30/90 dias)?

## 15. Critérios de aceite do MVP

- Um tenant novo configura evento, cardápio, 10 mesas e 3 garçons e abre o evento em ≤ 30 min, sem ajuda.
- 100 clientes simultâneos pedem sem erro; pedido visível ao garçom em ≤ 5 s.
- Nenhum dado de um tenant é visível a outro (suíte de testes de isolamento passa).
- Fluxo completo: abrir comanda → pedir → retirar → entregar → contestar → resolver → pedir conta → desistir → pedir conta → pagar → QR de saída → conferir → fechamento impresso.
- Caixa por garçom confere com o total recebido, por forma de pagamento.
- Anonimização automática executa nos prazos e o histórico financeiro permanece.
- Primeira carga do cliente dentro da meta em rede lenta simulada.
- Deploy sem indisponibilidade e migrations aplicadas de forma idempotente.

## 16. Referências do piloto

Contrato técnico detalhado do piloto: `docs/BINGO-CONTRATO.md` · Plano e histórico: `docs/PLANO-MELHORIAS.md` (PM-046 a PM-050) · Modelo de comanda em papel: `docs/comanda.jpeg`.
