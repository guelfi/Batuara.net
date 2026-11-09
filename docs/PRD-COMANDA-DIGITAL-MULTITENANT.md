# PRD — ComandaFácil: Comanda Digital e Fotografada para Pequenos Comércios (multi-tenant)

> Versão 1.2 · 09/11/2026 · Origem: piloto "Bingo Beneficente" da Casa de Caridade Caboclo Batuara (07/11/2026).
> **v1.1:** incorpora o que o piloto ganhou depois do primeiro evento: comanda de papel por foto/digitação manual (§5.13), QR de mesa assinado, edição e suspensão de evento, forma de pagamento na comanda de papel, total pago unificado, aba "Ler Comanda" do garçom, redesenho mobile do Admin e novos aprendizados (§12). **v1.2:** seção 11 reescrita como base de UI/UX (princípios, padrões de componentes, cores, superfícies e decisões da revisão do desktop de 09/11/2026).
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

- **RF-E1** Um tenant tem vários eventos (`Rascunho → Aberto → Suspenso | Encerrado`). Por padrão, **um evento aberto por vez por tenant** (configurável por plano).
- **RF-E2** Evento tem nome, data, cardápio, mesas, garçons escalados e formas de pagamento aceitas. **Copiar de evento anterior** (cardápio, mesas, garçons, preços) em um clique.
- **RF-E3** Evento marcado como **teste** pode ter seus dados zerados (com confirmação por palavra digitada). Evento real **nunca** pode ser zerado (regra no servidor e na tela).
- **RF-E4** Quantidade de mesas editável apenas em `Rascunho`; depois de iniciado, fica travada para não afetar comandas abertas.
- **RF-E5** "Pedir fechamento geral": avisa todos os clientes com conta aberta para encerrarem.
- **RF-E6** "Encerrar pedidos do evento": bloqueia novos pedidos; contas abertas continuam cobráveis.
- **RF-E7** Histórico de eventos com resumo e comandas, preservado conforme a retenção do plano.
- **RF-E8** [Piloto] **Editar evento:** nome e data podem ser alterados a qualquer momento (validação no servidor); o cabeçalho da tela mostra "Evento: {nome}", situação e a data.
- **RF-E9** [Piloto] **Suspender pedidos** do evento (estado `Suspenso`): bloqueia novos pedidos sem encerrar o evento; contas abertas continuam cobráveis. O evento de teste é permanente: só suspende e zera, nunca encerra nem é excluído.
- **RF-E10** [Piloto] **Cancelar evento inteiro** (regra aprovada em 09/11/2026): só quando o evento **não tem lançamento algum** (nem comanda digital, nem comanda de papel), equivalendo a excluir um rascunho. Com lançamentos, o evento só **suspende** ou **encerra**, e o fechamento impresso é preservado. O estado `Cancelado` é final e some das listas. Motivo: cancelar um evento com vendas apagaria ou invalidaria histórico financeiro.

### 5.3 Cardápio [Piloto]

- **RF-C1** Itens com nome, preço, disponibilidade (esgotado em cinza, sem poder pedir) e ordem. Edição em grade, com "Adicionar item" no topo.
- **RF-C2** Campo de valor com máscara R$.
- **RF-C3** [Novo] Categorias, imagem opcional, observação do pedido (ex.: "sem cebola"), itens com preço zero (cortesia), importação por planilha/CSV.

### 5.4 Mesas e QR [Piloto]

- **RF-M1** Mesas numeradas por evento. QR geral do evento (cliente escolhe a mesa) e **QR por mesa** (mesa já preenchida).
- **RF-M2** Admin imprime a folha do QR (A4) ou projeta em tela cheia (no celular a tela cheia tem botão **Fechar** visível e respeita a área segura do aparelho). A prévia na tela é compacta (controles e QR na mesma linha, centralizados, sem rolagem).
- **RF-M3** O garçom vê o QR da mesa assim que escolhe a mesa na lista (sem botão extra) e toca para ampliar.
- **RF-M4** [Novo] Mesas com nome/zona (salão, varanda) e mapa simples.
- **RF-M5** [Piloto] **QR de mesa assinado:** o link do QR traz `?mesa=N&s=<assinatura>` (HMAC do número da mesa com segredo do servidor). O cliente que abre esse link vê a mesa **fixa** ("Mesa N", definida pelo QR da mesa), sem seletor. O servidor confirma a assinatura (`lockedMesa`) e recusa a abertura de comanda cuja assinatura não confere com a mesa enviada. O QR genérico do evento (sem mesa) continua com seletor. QRs antigos, sem assinatura, abrem com seletor; é preciso gerar de novo para travar. O QR assinado é gerado pelo servidor (aba **Mesas** do garçom, antes "QR").
- **RF-M6** [Novo] O Admin lista e imprime o QR assinado de **todas** as mesas de uma vez (hoje só a tela do garçom gera por mesa).

### 5.5 Cliente (web mobile, sem instalar) [Piloto + Novo]

- **RF-CL1** Abertura da comanda: nome, celular com DDD e mesa. Aviso de privacidade visível. Se o aparelho já tem comanda aberta, vai direto a ela.
- **RF-CL2** **[Novo no piloto final] Reabrir comanda:** cliente que já usou o serviço neste aparelho vê "Olá, {nome}! Escolha sua mesa". Nome e celular ficam guardados no aparelho; "Não sou eu" apaga. Se o celular já foi confirmado no evento, a nova comanda nasce confirmada, sem novo código.
- **RF-CL3** **Confirmação do celular** por código de 6 dígitos via WhatsApp (template de autenticação). É **não bloqueante**: o cliente pode pedir antes de confirmar. Reenvio com limite de frequência; tentativas limitadas; selo "✓ confirmado". Existe sinalizador para tornar a confirmação obrigatória no fechamento.
- **RF-CL4** Cardápio compacto, paginado conforme a altura da tela (linhas de altura fixa), com quantidade em cada item e barra do carrinho sempre visível. Abas **Cardápio** e **Pedido**. **[Piloto]** Campo **Buscar item…** acima da lista; a paginação passa a valer sobre o resultado filtrado.
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
- **RF-G5** Aba **Mesas** (antes "QR"): escolhe a mesa e o QR **assinado** aparece na hora; toque amplia em tela cheia com botão "Fechar" visível.
- **RF-G6** **[Novo no piloto final] Conferência de saída:** abre o QR do cliente e vê tela grande verde/vermelha (ver 5.8).
- **RF-G7** Pagamento é bloqueado enquanto houver itens não entregues ou em contestação na comanda.
- **RF-G8** [Piloto] Aba **Ler Comanda** (entre **Mesas** e **Saída**): o mesmo fluxo da comanda de papel (§5.13), dentro do painel do garçom, com o token do evento entregue ao garçom logado. Abas na ordem: Pedidos, Contas, Mesas, Ler Comanda, Saída. Os selos numéricos das abas não podem ser cortados e os títulos ficam numa linha só.

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
- **RF-D1b** [Piloto] "Total vendido" do painel soma as comandas digitais **pagas** e as comandas de papel (§5.13), que só entram ao fechar a conta, portanto já pagas.
- **RF-D4** Atualização a cada 4 s (pausada com a aba oculta). Menu lateral recolhido na tela do Bingo para ganhar espaço.
- **RF-D5** Cardápio, Mesas, Garçons (com "visto por último" e entregas), Formas de pagamento e Resumo em abas.

### 5.10 Resumo e fechamento impresso [Piloto + Novo]

- **RF-R1** Resumo do evento: total recebido, a receber, cancelados, contestados; por forma de pagamento; por garçom; por item. **[Piloto]** O **total pago** soma digitais pagas + comandas de papel; "Em aberto" é só das comandas digitais ainda não pagas (itens digitais entram no total apenas depois de pagos). "Por forma de pagamento" mescla pagamentos digitais e comandas de papel; comandas de papel antigas, sem forma registrada, aparecem como **Não identificado**.
- **RF-R1b** [Piloto] Na lista de eventos, cada evento mostra o total vendido e o botão **Fechamento**, que abre o mesmo relatório do Resumo (com Imprimir). No celular, o botão de imprimir fechamento fica na linha do título do evento.
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

### 5.13 Comanda de papel (foto e digitação manual) [Novo no piloto]

Plano simples para quem ainda usa comanda impressa: o garçom ou o caixa **fotografa** a comanda de papel, o sistema lê os itens e a conta é fechada. Acesso por **token do evento** (link `/comanda-foto?t=…` ou aba **Ler Comanda** do garçom), sem login.

- **RF-F1** **Leitura por IA (OCR):** a foto (reduzida no aparelho, lado maior 1400 px, JPEG) é enviada ao servidor, que extrai número da comanda, nome e itens com quantidade e valor, usando o cardápio do evento como referência. O provedor é atrás de uma interface (hoje Gemini; ver §8.5).
- **RF-F2** **Três tentativas automáticas** (pausa de 2 s entre elas), só em falha temporária (rede, tempo esgotado, 5xx, 429). Durante a leitura aparece um **esqueleto** com o formato da tela de conferência e o texto "Lendo a comanda… tentativa N de 3". Erros que não adiantam repetir (sem permissão, foto inválida) vão direto para a falha.
- **RF-F3** **Falha na leitura:** oferece **Tentar ler novamente** (mesma foto), **Digitar sem foto** (só depois das 3 tentativas) e **Voltar**.
- **RF-F4** **Digitação manual:** número da comanda, nome (opcional), cardápio do evento com valor e botões (−) quantidade (+) = total por item, 10 itens por página com paginação, **busca por nome**, total geral fixo no rodapé e **item fora do cardápio** (nome e preço livres, com "+ Cardápio" para cadastrá-lo). A comanda digitada não tem foto ("Sem foto: comanda digitada manualmente").
- **RF-F5** **Conferência:** cada item em duas linhas (descrição; abaixo valor × quantidade = total e a lixeira). Item fora do cardápio fica em vermelho com **+ Cardápio**. É sempre possível **+ Adicionar item** (mesmo com leitura bem-sucedida, a IA pode perder ou o item pode ser novo).
- **RF-F6** **Duplicidade:** o número da comanda é normalizado; comanda já fechada no evento mostra um **card vermelho flutuante** "Comanda N já registrada (R$ x)" e bloqueia o fechamento, no servidor também. Para refazer, cancela-se a anterior.
- **RF-F7** **Forma de pagamento obrigatória** ao tocar em **Fechar comanda**: uma escolha entre as formas ativas do tenant **ou** a opção **Não identificado** (quando ninguém sabe). O nome da forma fica gravado na comanda (instantâneo); "Não identificado" grava vazio e aparece assim nos relatórios.
- **RF-F7b** **Leitura da forma de pagamento pelo OCR:** a IA procura, no fim da comanda (depois dos totais, fora da tabela de itens), o texto da forma de pagamento. O servidor compara com as formas ativas do tenant (nome exato, depois apelidos: dinheiro/espécie, pix, crédito, débito) e só aceita se houver **uma única** correspondência. A forma reconhecida vem **pré-selecionada e destacada** no diálogo; o garçom sempre confirma com um toque. Sem correspondência, nada é pré-selecionado. *(Implementado; ainda não validado com foto real.)*
- **RF-F8** **Integração aos totais:** a comanda de papel só é registrada ao fechar a conta, então entra como **paga** em: total pago do Resumo, por forma de pagamento, total do evento na lista e Painel ao vivo.
- **RF-F9** **Cancelamento:** no evento de teste, "Descartar" sem justificativa. Em evento regular, "Cancelar" exige **justificativa** e registra quem e quando; a comanda cancelada continua visível, mas não entra nos totais.
- **RF-F10** **Admin, "Comandas fotografadas":** lista com número, nome, data/hora, total e itens (item numa linha; abaixo valor × quantidade = total) e a linha **Forma de pagamento: {nome | Não identificado}**; **Ver foto** abre a imagem (ou informa que não há foto).

## 6. Regras de negócio e estados

**Comanda:** `Aberta → PediuConta → Paga`. `PediuConta → Aberta` quando o cliente desiste. `Paga` é final (reabrir = criar nova comanda).
**Item:** `Pendente → Retirado → Entregue`; `Retirado → Pendente` (devolver); `Entregue → EmContestação → Entregue | Cancelado`; `Pendente|Retirado|Entregue → Cancelado` (garçom/admin, motivo obrigatório; cliente pode cancelar não entregues ao encerrar).
**Valores:** `consumo = itens não cancelados`; `a pagar = itens entregues`. Pagamento exige `sem itens pendentes/retirados/contestados`.
**Unicidade:** um celular tem no máximo **uma comanda não paga por evento**; abrir de novo devolve a existente. Depois de paga, abre-se outra.
**Evento:** só um aberto por vez (por padrão); evento real não zera; mesas travadas após o início; `Suspenso` bloqueia novos pedidos; nome e data editáveis; evento de teste é permanente.
**Comanda de papel:** `Fechada → Cancelada` (justificativa obrigatória em evento regular; descarte livre no teste). Número único por evento entre as não canceladas. Forma de pagamento obrigatória (ou "Não identificado"). Total = soma de valor × quantidade; entra como paga.
**Mesa do cliente:** definida e travada quando o link traz assinatura válida; senão o cliente escolhe.
**Garçom:** só atua se escalado no evento aberto. Retirada registra quem pegou; entrega registra quem entregou; pagamento registra quem recebeu.
**Concorrência:** operações de item são idempotentes e retornam `409` com mensagem clara se o estado já mudou (ex.: dois garçons retirando o mesmo item).

## 7. Requisitos não funcionais

- **Desempenho mobile:** primeira tela do cliente interativa em ≤ 3 s em 4G médio e ≤ 6 s em Wi-Fi ruim; operações de pedido ≤ 500 ms no servidor (p95).
- **Primeira carga (cliente):** com o modo Auto (§8.3) a primeira tela não depende do download do runtime; meta de payload inicial ≤ 500 KB e do WASM em segundo plano ≤ 2 MB comprimido (ver R1).
- **Resiliência de rede:** fila local de ações (pedir, contestar) com reenvio automático e indicação "sem conexão, tentando novamente"; nada se perde ao recarregar a página (comanda salva no aparelho).
- **Tempo real:** v1 com polling de 4 s (pausado em segundo plano); v2 com **SignalR** (WebSocket com fallback) para pedidos e avisos.
- **Disponibilidade:** 99,5% em horário de evento; deploy sem indisponibilidade (rolling) e **migrations idempotentes** com guarda de divergência.
- **Segurança:** HTTPS, JWT com expiração e papel por tenant, rate limiting por IP/rota (leitura vs. escrita), validação de entrada, proteção contra enumeração (identificadores aleatórios), CSRF/CORS restritos, segredos fora do repositório, auditoria de ações sensíveis.
- **Isolamento de dados:** filtro global por `TenantId` no EF Core **e** Row-Level Security no PostgreSQL (defesa em profundidade); testes automatizados de vazamento entre tenants.
- **Observabilidade:** logs estruturados com `tenant_id`, métricas (pedidos/min, latência, falhas de mensageria), health checks, alertas.
- **Backup e recuperação:** backup diário, restauração testada, retenção por plano.
- **Acessibilidade:** WCAG AA nos fluxos do cliente.
- **Localização:** pt-BR na v1; textos em recursos para traduzir; moeda e fuso por tenant.

## 8. Stack e arquitetura

### 8.1 Stack adotada (padrão do autor, definida para o projeto "Meu Financeiro")

Fonte: imagens em `/home/guelfi/Projetos/Stack` (4 arquivos, 1 duplicado). **Observação:** o material recebido tem as seções 1, 3, 4, 5 e 6; **a seção 2 não veio** nas imagens e deve ser incluída aqui quando disponível.

| Camada | Tecnologia | Finalidade neste produto |
|---|---|---|
| Linguagem | **C# 14** | Full-stack em uma só linguagem |
| Plataforma | **.NET 10 LTS** (suporte previsto até nov/2028) | Base da aplicação |
| Frontend | **Blazor Web App** | Cliente, equipe e admin |
| Renderização | **Interactive Server + WebAssembly** (híbrida, modo *Auto*) | Primeira tela rápida e processamento no aparelho depois |
| Componentes visuais | **MudBlazor** | Painéis, formulários, tabelas, diálogos |
| Backend | **ASP.NET Core Web API** | Serviços e integrações (WhatsApp, webhooks) |
| ORM | **Entity Framework Core** | Persistência, filtro global por tenant |
| Banco de dados | **PostgreSQL** | Dados de todos os tenants (RLS) |
| Validação | **FluentValidation** | Validação das entradas da API |
| Autenticação | **ASP.NET Core Identity** | Usuários da equipe e do admin, papéis e permissões por tenant |
| Testes | **xUnit + Playwright** | Unidade/integração e ponta a ponta (fluxos mobile) |
| Contêineres | **Docker + Docker Compose** | Desenvolvimento e implantação |
| Observabilidade | **OpenTelemetry** | Logs, métricas e rastreamento, com `tenant_id` |
| IA (opcional) | **Microsoft.Extensions.AI** (OpenAI, Claude, Gemini, Ollama/LM Studio; *tool calling*) | Recursos futuros (ver 8.5) |

**Diretrizes herdadas da stack:**
- **Arquitetura:** **monólito modular**, com separação de responsabilidades e serviços de IA desacoplados, preparado para evoluir conforme a complexidade.
- **Frontend exclusivamente Blazor, sem React.** (O piloto do Batuara usa React/MUI; o produto novo é uma reescrita na stack acima e reaproveita **as regras e o contrato** do piloto, não o código de tela.)
- **Mobile:** começa como **web responsiva + PWA**; depois, **.NET MAUI Blazor Hybrid** reaproveitando componentes Razor, com C# como linguagem principal.
- **Cálculos financeiros determinísticos em C#**: totais, "a pagar", caixa por garçom e fechamento nunca dependem de modelo de linguagem.
- **IA sem acesso direto ao banco:** só por serviços controlados da aplicação, com validações e confirmação do usuário quando necessário.

### 8.2 Módulos do monólito modular

Cada módulo tem seu contexto (casos de uso, entidades, repositórios) e expõe uma interface pública; comunicação entre módulos por interfaces e eventos de domínio internos, sem acesso cruzado às tabelas.

1. **Plataforma/Tenants:** tenants, planos, limites, uso, suspensão.
2. **Identidade e acesso:** Identity, papéis (Owner, Admin, Garçom, Caixa), convites, escala por evento.
3. **Eventos:** ciclo de vida, teste/zerar, copiar evento, fechamento geral.
4. **Cardápio e mesas:** itens, categorias, mesas, QR.
5. **Comandas e pedidos:** abertura, itens, retirada/entrega, contestação, fechamento, reabertura.
6. **Pagamentos e caixa:** formas de pagamento, cobrança, conferência por garçom, saída por QR.
7. **Relatórios:** painel, resumo, fechamento impresso, exportações.
8. **Mensageria:** canais (WhatsApp Cloud API atrás de `IMessageChannel`), templates, webhooks de status, cobrança amigável, cotas.
9. **Privacidade:** retenção, anonimização, atendimento ao titular, auditoria.
10. **IA (opcional, desacoplado):** ver 8.5.

### 8.3 Renderização híbrida e o uso em celular

- **Cliente (QR):** *Blazor Web App* em modo **Auto**: a primeira visita renderiza e interage via **Interactive Server** (sem baixar o runtime .NET; HTML pronto e SignalR) enquanto o **WebAssembly** é baixado em segundo plano para as visitas seguintes e para processamento no aparelho. Isso resolve o principal risco do WASM puro (download inicial em Wi-Fi ruim) sem abrir mão do WASM.
- **Equipe e admin:** podem usar WebAssembly (PWA instalável) com cache do runtime, pois são acessos repetidos e autenticados.
- **Resiliência:** com Interactive Server, a queda do WebSocket exige reconexão elegante (tela "reconectando", reenvio, estado da comanda no servidor e no aparelho); o modo WASM mantém fila local de ações.
- **Requisitos de capacidade:** circuitos Server consomem memória por cliente conectado; dimensionar para o pico de clientes simultâneos e usar o WASM para aliviar o servidor depois da primeira carga.

### 8.4 Multi-tenancy (recomendação)

Banco único e esquema único com `TenantId` em todas as tabelas de negócio, `ITenantContext` resolvido por requisição, **filtro global no EF Core** e **Row-Level Security no PostgreSQL** (`SET app.tenant_id` por conexão). Tenants grandes podem migrar para banco dedicado depois, pois a camada de acesso já isola o contexto. *Descartadas na v1:* esquema por tenant e banco por tenant (custo operacional e de migrations).

### 8.5 IA (opcional, fase posterior)

Mesmas regras da stack: IA fora do caminho crítico, sem acesso direto ao banco, *tool calling* sobre serviços validados, com confirmação do usuário. Ideias de valor para este produto:
- Resumo em linguagem natural do evento e sugestões (itens que esgotam cedo, horário de pico).
- Alerta de anomalias (muitas contestações de um mesmo garçom, divergência de caixa).
- Montagem do cardápio a partir de foto/planilha (OCR + IA).
- **Já no piloto:** leitura da comanda de papel por OCR/IA (§5.13), com o cardápio do evento no contexto, itens validados contra o cardápio no servidor e totais sempre recalculados em C#. O provedor fica atrás de uma interface, para trocar sem mexer no fluxo: hoje **Gemini**. **O produto derivado planeja incluir o Kimi (Moonshot) como provedor alternativo**; o piloto do Batuara não o usa (decisão de 09/11/2026).
Totais e conferências continuam calculados em C#.

### 8.6 Superfícies do frontend

1. `cliente` (rota pública `/{slug}/mesa/...`): carga mínima, sem autenticação, modo Auto.
2. `equipe` (garçom/caixa): autenticada, PWA, vibração e som.
3. `admin` (dono): painel, cardápio, eventos, relatórios.
Cada uma é um conjunto de rotas/assemblies com carregamento sob demanda; componentes compartilhados em uma biblioteca de classes Razor (RCL) com MudBlazor.

### 8.7 Integrações e implantação

WhatsApp Cloud API (webhook de status) atrás de `IMessageChannel`; futuro PSP de Pix; armazenamento de imagens em object storage. **Docker + Compose** (API/Web, Postgres, observabilidade), CI/CD com testes (xUnit, Playwright mobile) e verificação de migrations, ambientes `staging` e `produção`, *feature flags* por tenant, OpenTelemetry exportando para o coletor escolhido.

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
`PhotoTab` (evento, número da comanda normalizado, rótulo, itens em JSON, total, **forma de pagamento (nome, instantâneo)**, foto (opcional), criada em, **cancelamento: por/em/motivo**),
`MessageLog` (tabela de mensagens com status de entrega e custo estimado),
`AuditLog` (usuário, ação, entidade, antes/depois, data),
`UsageCounter` (por tenant/mês: comandas, mensagens, eventos).

**Índices e restrições importantes:** um evento aberto por tenant (índice único parcial); única comanda não paga por (tenant, evento, telefone); número de comanda de papel único entre as não canceladas por (tenant, evento); mesa única por (tenant, evento, número); índices por (tenant, evento, status).

## 10. API (grupos de endpoints)

Prefixo `/api/{tenant}/...` (ou subdomínio). Respostas padronizadas `{ success, data, message, code }`.

- **Públicos (cliente):** `GET info` · `POST comandas` · `GET comandas/{id}` · `POST comandas/{id}/itens` · `POST comandas/{id}/itens/{itemId}/contestar` · `POST comandas/{id}/encerrar` (com `cancelUndelivered`) · `POST comandas/{id}/reabrir` · `POST comandas/{id}/celular/enviar-codigo` · `POST comandas/{id}/celular/confirmar`.
- **Equipe (garçom):** `GET me` · `GET pedidos` · `POST itens/{id}/retirar|devolver|entregar|cancelar|resolver-contestacao` · `GET formas-pagamento` · `POST comandas/{id}/mesa` · `GET contas[?todas]` · `POST contas/pagar` · `GET saida/{tabId}` · `POST saida/{tabId}/liberar`.
- **Admin:** CRUD de eventos (+ abrir, encerrar, zerar teste, copiar de evento, fechamento geral), cardápio, mesas (+ QR), garçons (+ encerrar sessões), formas de pagamento, painel, resumo, histórico de comandas, pagamento, cancelamento e resolução de contestação, lembretes (pré-visualizar e enviar).
- **Comanda de papel (token do evento):** `POST comanda-foto/ler` · `POST comanda-foto` (com `paymentMethodId`; `imageBase64` vazio na digitação manual) · `GET comanda-foto/cardapio` (itens ativos do evento) · `POST comanda-foto/cardapio` (cadastrar item novo) · `GET comanda-foto/formas-pagamento` · `GET comanda-foto/relatorio` · `GET comanda-foto/{id}/foto` · `DELETE comanda-foto/{id}`.
- **Equipe (garçom), acréscimos:** `GET garcom/mesas/{n}/qr` (link assinado) · `GET garcom/comanda-foto/token`.
- **Público, acréscimos:** `GET info?mesa=N&s=…` (devolve `lockedMesa` quando a assinatura confere) · `POST comandas` aceita `mesaSignature` e recusa assinatura que não confere com a mesa.
- **Admin, acréscimos:** `PUT eventos/{id}` (nome e data) · `GET/DELETE/POST comandas-foto…` (lista, foto, cancelamento com justificativa).
- **Plataforma:** tenants, planos, uso, suspensão.
- **Webhooks:** status de mensagens do WhatsApp.
- **Tempo real (SignalR):** hubs `team` (pedidos novos, conta pedida, mudanças de status) e `tab` (atualização da comanda do cliente).

## 11. UI/UX (base de experiência do produto)

Esta seção reúne o que o piloto consolidou em interface e as decisões da revisão de telas de 09/11/2026. Vale como base para o ComandaFácil. Itens marcados **[Definido]** foram acordados na revisão e ainda não foram implementados no piloto; no produto novo já nascem assim.

### 11.1 Princípios
1. **Mobile-first na operação** (cliente e garçom usam o celular; o administrador usa celular e computador). Cada tela tem versão de celular e de computador pensadas separadamente; **ajustar uma não muda a outra**, salvo pedido explícito.
2. **Nenhum texto cortado ou quebrado onde se pediu uma linha:** títulos, subtítulos, avisos e botões ficam numa linha só, com a fonte ajustada à largura (tamanho fluido com mínimo e máximo), nunca com reticências no que é essencial.
3. **Pouca rolagem:** a tela aproveita a largura (painéis, colunas, tabelas baixas) e usa paginação ou seções recolhíveis em vez de listas longas.
4. **Informar e filtrar são coisas diferentes:** quadros de informação (somente leitura) nunca têm o mesmo visual de um filtro clicável. Filtros são **caixa de seleção**; informativos são **caixinhas** com rótulo pequeno e valor em destaque.
5. **Um caminho só para cada ação:** edição por ícone de lápis que abre uma janela; sem edição escondida por duplo clique.
6. **Contraste alto e estado visível:** cores com significado fixo (ver 11.3), selos numéricos nunca cortados, alvos de toque grandes.
7. **Ação destrutiva sempre pede confirmação**, com o texto do que será afetado e se é definitivo.
8. **Voz do produto:** português do Brasil, frases curtas e diretas, termos do cotidiano do salão ("comanda", "mesa", "fechar conta").

### 11.2 Padrões de componentes
- **Informativo (indicador):** caixinha com rótulo pequeno em cima e valor em destaque embaixo; no celular, grade de 2 ou 3 colunas; no computador, faixa numa linha só.
- **Filtro:** caixa de seleção rotulada ("Filtrar comandas") com a contagem em cada opção ("Pagas: 3") e a opção "Todas" para limpar.
- **Lista compacta (celular):** uma linha por item, com ordem, nome, valor/estado, interruptor e ícones de ação (lápis, lixeira); texto de apoio só quando relevante ("já usado: nome travado").
- **Tabela (computador):** linhas baixas (≈ 44 px), cabeçalho fixo, **paginação de 10 em 10** (anterior/próxima, "1–10 de N", sem seletor de quantidade), ordenação padrão pela coluna "Ordem" quando existir.
- **Edição:** ícone de **lápis** na coluna "Ações", antes da lixeira; abre a janela "Editar …" (tela cheia no celular, janela centralizada no computador) com Cancelar e Salvar. Campo travado mostra o motivo ("Item já usado: o nome não pode ser alterado").
- **Exclusão:** ícone de lixeira, desabilitado com dica quando houver vínculo ("Item já usado: marque como indisponível"). Onde não há exclusão (formas de pagamento), usa-se o interruptor ativo/inativo.
- **Botões de ação por linha (eventos):** todos na mesma linha, alinhados à direita, com espaçamento regular e sem largura mínima fixa; um evento por linha. Em telas estreitas, a tabela rola na horizontal em vez de quebrar os botões.
- **Seções recolhíveis (celular):** título + total no cabeçalho, abrem com um toque; a mais usada vem aberta.
- **Cartão flutuante de erro/alerta:** vermelho, no topo, para bloqueios (ex.: "Comanda N já registrada (R$ x)").
- **Esqueleto de carregamento:** com o formato da tela de destino (brilho em movimento) e o texto do progresso ("Lendo a comanda… tentativa N de 3").
- **Botão de impressão no celular:** ícone alinhado à direita na linha do título (slot de cabeçalho), em vez de botão largo.
- **Fotografia (ícone de câmera):** abre a foto da comanda; para comanda digitada manualmente, a janela informa "Sem foto: comanda digitada manualmente".
- **Avisos de ajuda:** uma linha só; sem instruções que dependam de gesto escondido.

### 11.3 Cores e significado
- **Primária (azul):** ação principal, abas, total em destaque.
- **Verde:** pago, confirmado, WhatsApp, "aberto".
- **Âmbar/laranja:** pediram a conta, suspenso, "teste", atenção.
- **Vermelho:** cancelar, descartar, contestação, bloqueio, falha de entrega.
- **Cinza:** inativo, "não confirmado", texto de apoio.
- Selos (chips) servem a **status**; nunca como filtro (ver 11.1, item 4).

### 11.4 Cliente (celular, sem instalar)
- Abrir comanda: "Olá, {nome}! Escolha sua mesa"; **mesa fixa** quando o QR é assinado ("Mesa N", sem seletor).
- Comanda compacta: cabeçalho fixo "COMANDA · Mesa N", nome, número, selo de celular confirmado.
- Abas **Cardápio / Pedido**, busca **"Buscar item…"** acima da lista, paginação conforme a altura da tela, quantidade em cada item, barra do carrinho sempre visível.
- "Não recebi", "Continuar pedindo", QR de saída.

### 11.5 Garçom (celular)
- Abas na ordem: **Pedidos**, **Contas**, **Mesas**, **Ler Comanda**, **Saída**; títulos numa linha só e selos numéricos inteiros (rolagem e selo com sobra de espaço).
- **Mesas:** escolhe a mesa e o QR assinado aparece; toque amplia em tela cheia com botão "Fechar" visível.
- **Ler Comanda:** subtítulo "Fotografar comanda para Fechar Conta" numa linha; fluxo da comanda de papel (11.8).
- **Saída:** tela "Conferir saída" (verde/vermelho/âmbar); texto auxiliar numa linha.
- Feedback sonoro/vibração apenas na equipe.

### 11.6 Administrador no celular (iPhone)
- Seletor de seção no lugar das abas; cartões em vez de tabelas; listas compactas de uma linha (Cardápio, Formas de pagamento).
- Painel ao vivo: informativos em grade + caixa de seleção "Filtrar comandas".
- Botões de uma linha só e centralizados; alvos ≥ 48 px.
- **[Definido] Resumo no celular:** indicadores em **grade de 2 colunas** (o "Total geral" ocupa a fileira inteira no topo) e **listas recolhíveis** ("Por forma de pagamento" aberta; "Por item" e "Conferência por garçom" fechadas); linhas mais baixas; botão de imprimir no título.
- Comandas fotografadas: item numa linha; abaixo "valor × quantidade = total"; abaixo "Forma de pagamento: {nome | Não identificado}".

### 11.7 Administrador no computador (decisões da revisão)
| Tela | Decisão |
|---|---|
| **Novo evento** | Mantida como está. |
| **Mesas** | Mantida (quantidade, Salvar, Imprimir, Projetar QR e QR na mesma linha, centralizados). |
| **Garçons** | Mantida (busca de filho + Escalar, tabela, "Encerrar sessão dos garçons"). |
| **Eventos** | **[Definido]** um evento por linha; todos os botões (Fechamento, Editar, Abrir/Retomar/Suspender, Cancelar, Encerrar) na mesma linha, alinhados à direita, sem largura mínima fixa e sem quebra; etiqueta "Teste" ao lado do nome; coluna de ações ocupa o espaço que sobra; abaixo de ~1100 px a tabela rola na horizontal. |
| **Painel ao vivo** | **[Definido]** tudo na primeira linha: informativos (Itens pendentes, Itens retirados, Total vendido; "Em contestação" e "Falha de entrega" só quando houver) + caixa de seleção "Filtrar comandas" + "Pedir fechamento geral" + "Suspender pedidos do evento" (textos numa linha). Seções "Mesas" e "Contas" mantidas. |
| **Cardápio** | **[Definido]** lápis antes da lixeira (janela "Editar item"); sem edição por duplo clique; texto de ajuda em **uma linha**: "Itens já usados em pedidos ou comandas não podem ser renomeados nem excluídos; marque como indisponível. O preço novo vale só para lançamentos futuros."; **paginação de 10 em 10**. |
| **Formas de pagamento** | **[Definido]** mesmo padrão do Cardápio (lápis, sem duplo clique, paginação de 10); sem lixeira (usa o interruptor "Ativa"); aviso "As formas ativas aparecem para o garçom escolher ao cobrar." mantido. |
| **Resumo** | **[Definido]** formato de painel: barra de ferramentas com **espaçamento regular entre os botões** (Copiar link, Enviar por WhatsApp, Imprimir fechamento); faixa de 6 indicadores numa linha (Total geral em destaque, Total vendido (pago), Comandas por foto, Em aberto, Cancelados, Em contestação); corpo em **duas colunas** (esquerda: "Por forma de pagamento" e "Conferência de caixa por garçom"; direita: "Por item" com rolagem interna e cabeçalho fixo); em < ~1000 px vira uma coluna; sem rolar a página em 1280 × 720. O mesmo componente serve ao histórico de eventos. |
| **Comandas Foto** | **[Implementado no piloto]** cartão de resumo numa linha ("Comandas Fotografadas — {evento}" · "N comandas · Total" · "Enviar link por WhatsApp"); linhas baixas (≈ 44 px, cerca do dobro de registros por tela); **forma de pagamento em coluna própria** (com "Não identificado"); "Ver foto" vira **ícone de câmera** com dica; "Descartar" continua em texto vermelho; **paginação de 10 em 10**. |

### 11.8 Fluxos especiais
- **Comanda de papel:** fotografar → esqueleto com tentativa N de 3 → conferência (itens, valores, total) → escolher a forma de pagamento (sugestão do OCR destacada; "Não identificado" disponível) → Fechar comanda. Em falha: "Tentar ler novamente", "Digitar sem foto" (só após as 3 tentativas), "Voltar".
- **Digitação manual:** número, nome opcional, cardápio com (−) quantidade (+) = total, busca, 10 por página, item fora do cardápio com "+ Cardápio", total fixo no rodapé.
- **Fechamento impresso (A4):** ver §5.10 e RF-R2.

### 11.9 Acessibilidade e desempenho
- Contraste alto, rótulos nos controles (`aria-label` em interruptores e ícones), foco visível, alvos de toque ≥ 48 px, texto legível sem zoom.
- Telas leves em rede móvel: paginação, imagens reduzidas no aparelho, esqueletos de carregamento.

### 11.10 Regras para quem implementa
- Ajuste de uma versão (celular/computador) não altera a outra, salvo pedido.
- Conferir sempre em 1280 × 720 (computador) e largura de iPhone (celular) antes de entregar.
- Componentes de fluxo repetido (ex.: comanda de papel) ficam em **um só lugar**, usado pelo Admin e pelo site público (no piloto estão duplicados; é uma dívida a não repetir).

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
10. **Leitura de comanda por IA falha às vezes:** ofereça tentativas automáticas com contador, repetição manual e digitação manual como saída. Mesmo quando a leitura funciona, pode faltar item ou haver item novo; sempre permita adicionar item.
11. **Forma de pagamento tem que ser pedida ao fechar a comanda de papel**, senão o fechamento do caixa por forma de pagamento fica incompleto. Comandas anteriores à regra, ou sem forma conhecida, ficam como "Não identificado". O OCR tenta ler a forma escrita no fim do papel e sugere; a pessoa confirma.
12. **Total pago único:** o que a equipe vê no Painel, no Resumo e na lista de eventos deve ser o mesmo número; digital só entra depois de pago, comanda de papel entra ao fechar.
13. **QR sem assinatura deixa o cliente trocar a mesa** pela URL ou pelo seletor; a assinatura no servidor resolve para links vindos de QR, mas QRs impressos antes precisam ser regenerados.
14. **Texto cortado e quebra de linha** em celular geram retrabalho: medir em iPhone, usar fonte proporcional à largura e nunca ocultar selos.
15. **Deploys seguidos se cancelam:** esperar o deploy atual terminar antes do próximo push; e o CI pode falhar por indisponibilidade do GitHub (rodar de novo antes de mexer no código).

## 13. Roadmap sugerido

| Fase | Entregas |
|---|---|
| **0 – Fundação (4–6 sem.)** | Solução .NET 10 + Blazor Web App (Server + WASM) + MudBlazor, monólito modular, Identity, multi-tenant (filtro global + RLS), autenticação por tenant, CI/CD, observabilidade, testes de isolamento |
| **1 – Núcleo do evento (6–8 sem.)** | Eventos, cardápio, mesas/QR, comanda do cliente, garçom (pedidos/contas/QR), pagamento, painel, resumo e fechamento impresso, LGPD (retenção) |
| **2 – Operação confiável (4–6 sem.)** | Fila offline do cliente, SignalR, confirmação por WhatsApp, cobrança amigável, saída por QR, auditoria, copiar evento |
| **3 – Produto (6–8 sem.)** | Onboarding self-service, planos e cobrança, painel da plataforma, exportações, comparativo entre eventos, categorias/observações no cardápio |
| **4 – Pagamentos** | Pix dinâmico via PSP, caixa com troco/sangria, conciliação |

## 14. Riscos e decisões em aberto

- **R1 – Download do WebAssembly e conexão do Server no cliente.** O runtime .NET pesa no primeiro acesso em Wi-Fi ruim, e o Interactive Server depende de WebSocket estável. *Mitigação:* modo **Auto** (Server na primeira visita, WASM em segundo plano), trimming e Brotli, cache PWA, reconexão elegante, fila local e medição da primeira carga em rede lenta como critério de aceite. WASM acelera processamento pesado, não telas de formulário; o ganho esperado está na menor carga no servidor e no uso repetido.
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
9. ~~Cancelar evento inteiro~~ **Decidido:** só sem lançamentos (digitais ou de papel, mesmo cancelados); com lançamentos, suspender ou encerrar; `Cancelado` é final, some das listas; evento de teste não cancela (RF-E10).
10. **Provedor de OCR:** manter Gemini, ou abstrair e oferecer Kimi (Moonshot) como alternativa? (Piloto: só Gemini. Produto derivado: prevê Kimi.)
11. **Comanda de papel:** continua como módulo opcional por tenant ou entra no núcleo? A fila de comandas de papel precisa de login do garçom (auditoria de quem fechou) em vez de só o token do evento?
12. **QR por mesa:** gerar para todas as mesas no Admin (RF-M6) e expirar/rotacionar a assinatura por evento?

## 15. Critérios de aceite do MVP

- Um tenant novo configura evento, cardápio, 10 mesas e 3 garçons e abre o evento em ≤ 30 min, sem ajuda.
- 100 clientes simultâneos pedem sem erro; pedido visível ao garçom em ≤ 5 s.
- Nenhum dado de um tenant é visível a outro (suíte de testes de isolamento passa).
- Fluxo completo: abrir comanda → pedir → retirar → entregar → contestar → resolver → pedir conta → desistir → pedir conta → pagar → QR de saída → conferir → fechamento impresso.
- Caixa por garçom confere com o total recebido, por forma de pagamento.
- Anonimização automática executa nos prazos e o histórico financeiro permanece.
- Primeira carga do cliente dentro da meta em rede lenta simulada.
- Deploy sem indisponibilidade e migrations aplicadas de forma idempotente.
- Comanda de papel: fotografar → (falha simulada) 3 tentativas com contador → digitar manualmente → escolher forma de pagamento → fechar; a comanda aparece no Resumo como paga, por forma de pagamento, no total do evento e no Painel.
- Cliente que abre o QR assinado de uma mesa não consegue trocar a mesa (seletor ausente; assinatura adulterada é recusada pelo servidor).

## 16. Referências do piloto

Imagens da stack adotada: `/home/guelfi/Projetos/Stack` (seção 2 ausente) · Contrato técnico detalhado do piloto: `docs/BINGO-CONTRATO.md` · Plano e histórico: `docs/PLANO-MELHORIAS.md` (PM-046 a PM-050) · Modelo de comanda em papel: `docs/comanda.jpeg` · Comanda de papel (código): `ComandaFotoService`, `ComandaFotoPage` (público) e `ComandaFotoPanel` (garçom) · QR assinado: `BingoMesaSignature`.
