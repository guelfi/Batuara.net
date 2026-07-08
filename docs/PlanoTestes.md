# Plano de Testes — AdminDashboard Batuara.net

**Versão:** 1.1  
**Data:** 2026-07-08  
**Status:** Em atualização — sincronizar com `docs/Plano de Testes Batuara - v5.xlsx` antes da próxima rodada  

---

## 1. Objetivo

Validar as operações administrativas e fluxos operacionais disponíveis no AdminDashboard do projeto Batuara.net, garantindo que cada módulo funcione conforme o esperado em cenários de sucesso, falha de validação, controle de acesso e comportamento de borda.

---

## 2. Escopo

### Módulos cobertos

| Módulo | Create | Read/Listar | Update | Delete | Observações |
|---|:---:|:---:|:---:|:---:|---|
| Autenticação | — | — | — | — | Login/Logout/Refresh Token |
| RBAC / Usuários | ✓ | ✓ | ✓ | ✓ | Admin/Editor/Viewer/Member e bloqueios por perfil |
| Login Filho da Casa | — | ✓ | — | — | Solicitação e validação de código por WhatsApp |
| Dashboard | — | ✓ | — | — | Somente leitura |
| Eventos | ✓ | ✓ | ✓ | ✓ | Ativar/desativar |
| Calendário (Atendimentos) | ✓ | ✓ | ✓ | ✓ | Ativar/desativar |
| Guias / Entidades | ✓ | ✓ | ✓ | ✓ | Ativar/desativar |
| Membros da Casa | ✓ | ✓ | ✓ | ✓ | Inclui sub-CRUD de Contribuições, recorrência e autosserviço Member |
| Orixás | ✓ | ✓ | ✓ | ✓ | |
| Conteúdo Espiritual | ✓ | ✓ | ✓ | ✓ | Destaque (isFeatured) |
| Linhas de Umbanda | ✓ | ✓ | ✓ | ✓ | Ativar/desativar |
| Mensagens de Contato | — | ✓ | ✓ | — | Atualiza status/leitura e resposta por WhatsApp quando há opt-in |
| Configurações do Site | — | ✓ | ✓ | — | Configuração única |

### Fora do escopo desta versão
- Testes de APIs públicas (PublicWebsite)
- Testes de performance / carga
- Testes de segurança / penetração
- Testes de acessibilidade

---

## 3. Pré-condições

- **URL do AdminDashboard:** usar a URL do ambiente sob teste informada em `docs/testcontrol.md` ou pelo operador da rodada.
- **Usuário Admin:** ler de `docs/credential.md`; nunca registrar senha no plano, na planilha ou no chat.
- API acessível pela rota base do ambiente sob teste, normalmente `/batuara-api/api`.
- Banco de dados disponível com dados de seed aplicados
- Usuário com role **Editor** cadastrado e ativo (para validar restrições de role — criar separadamente se necessário)
- Usuário/Filho da Casa com telefone autorizado para validar login Member por WhatsApp, quando o caso exigir envio real.
- Ambiente de rede compatível com a rodada: local, staging ou produção, conforme instrução do operador.

### Lacunas conhecidas desta versão

- Detalhar casos específicos para `Usuários` e RBAC multiadmin.
- Detalhar casos específicos para login/autosserviço de Filho da Casa por WhatsApp.
- Detalhar casos específicos de contribuição recorrente e geração automática da próxima mensalidade.
- Detalhar casos específicos de resposta WhatsApp a mensagens públicas com opt-in.
- Revisar casos de Guias/Orixás para refletir que `Exu` e `Pomba Gira` são Guias/Entidades na Casa Batuara, não Orixás.

---

## 4. Convenções

- **CT-XXX** — Código do caso de teste  
- **Resultado Esperado** — comportamento correto da aplicação  
- **Pré-condição específica** — quando diferente da pré-condição geral  
- ✅ Campo obrigatório | 🔲 Campo opcional

---

## 5. Autenticação

### CT-AUTH-001 — Login com credenciais válidas
- **Pré-condição:** usuário Admin ativo cadastrado
- **Passos:**
  1. Acessar `http://192.168.15.157/batuara-admin`
  2. Preencher e-mail `admin@batuara.org.br` e senha `Admin123!`
  3. Clicar em "Entrar"
- **Resultado esperado:** redirecionado para `/admin/dashboard`; token JWT armazenado no localStorage; nome do usuário exibido na interface

### CT-AUTH-002 — Login com senha incorreta
- **Passos:** preencher e-mail correto e senha errada, clicar em "Entrar"
- **Resultado esperado:** mensagem de erro "Credenciais inválidas" exibida; usuário permanece na tela de login

### CT-AUTH-003 — Login com e-mail não cadastrado
- **Passos:** preencher e-mail inexistente
- **Resultado esperado:** mensagem de erro genérica; sem exposição de qual campo está errado

### CT-AUTH-004 — Acesso a rota protegida sem autenticação
- **Passos:** acessar `/admin/events` sem estar logado
- **Resultado esperado:** redirecionado para `/admin/login`

### CT-AUTH-005 — Logout
- **Passos:** estando logado, clicar no botão de logout
- **Resultado esperado:** tokens removidos do localStorage; redirecionado para `/admin/login`; tentativa de acessar rota protegida redireciona para login

### CT-AUTH-006 — Renovação automática de token (Refresh Token)
- **Passos:** deixar o token JWT expirar com a sessão aberta; realizar uma ação que chame a API
- **Resultado esperado:** a aplicação renova o token automaticamente sem necessidade de novo login; a operação original é concluída com sucesso

---

## 6. Dashboard

### CT-DASH-001 — Carregamento dos indicadores
- **Passos:** acessar `/admin/dashboard`
- **Resultado esperado:** cards exibem corretamente os totais de eventos, atendimentos e membros ativos; sem erros na tela

### CT-DASH-002 — Log de atividades recentes
- **Passos:** na tela do Dashboard, verificar a lista de atividades
- **Resultado esperado:** atividades listadas em ordem decrescente de data; cada item exibe entidade, ação e timestamp

### CT-DASH-003 — Paginação do log de atividades
- **Passos:** clicar em "carregar mais" no log de atividades
- **Resultado esperado:** novos registros são carregados e acumulados na lista; botão desaparece quando não há mais páginas

---

## 7. Eventos

### CT-EVT-001 — Listar eventos
- **Passos:** acessar `/admin/events`
- **Resultado esperado:** grade exibe eventos paginados (20 por página); colunas Título, Tipo, Data, Ativo visíveis

### CT-EVT-002 — Filtrar eventos por texto
- **Passos:** digitar parte do título no campo de busca
- **Resultado esperado:** lista atualizada exibindo apenas eventos cujo título contenha o texto buscado

### CT-EVT-003 — Filtrar eventos por tipo
- **Passos:** selecionar um tipo no filtro (ex.: "Festa")
- **Resultado esperado:** lista exibe somente eventos do tipo selecionado

### CT-EVT-004 — Filtrar eventos por período
- **Passos:** selecionar data inicial e data final no filtro de período
- **Resultado esperado:** lista exibe somente eventos dentro do intervalo de datas

### CT-EVT-005 — Criar evento com dados válidos
- **Passos:**
  1. Clicar em "Novo Evento"
  2. Preencher: Título ✅, Descrição ✅, Data ✅, Hora Início, Hora Fim, Tipo ✅, Localização 🔲, Cor do Card 🔲
  3. Clicar em "Salvar"
- **Resultado esperado:** modal fecha; snackbar de sucesso exibida; novo evento aparece na lista; log de atividade registrado

### CT-EVT-006 — Criar evento sem título
- **Passos:** abrir formulário de novo evento, deixar Título em branco, clicar em "Salvar"
- **Resultado esperado:** campo Título destacado com mensagem de erro; evento não criado

### CT-EVT-007 — Criar evento sem descrição
- **Passos:** preencher apenas o título, clicar em "Salvar"
- **Resultado esperado:** campo Descrição destacado com mensagem de erro; evento não criado

### CT-EVT-008 — Criar evento sem data
- **Passos:** preencher título e descrição, deixar data em branco, clicar em "Salvar"
- **Resultado esperado:** campo Data destacado com mensagem de erro; evento não criado

### CT-EVT-009 — Criar evento com título acima do limite
- **Passos:** preencher título com mais de 200 caracteres
- **Resultado esperado:** erro de validação "O título não pode exceder 200 caracteres"

### CT-EVT-010 — Criar evento com descrição acima do limite
- **Passos:** preencher descrição com mais de 2000 caracteres
- **Resultado esperado:** erro de validação "A descrição não pode exceder 2000 caracteres"

### CT-EVT-011 — Editar evento existente
- **Passos:**
  1. Clicar no ícone de edição de um evento existente
  2. Alterar título e/ou descrição e/ou tipo
  3. Clicar em "Salvar"
- **Resultado esperado:** modal fecha; snackbar de sucesso; dados atualizados refletem na lista

### CT-EVT-012 — Editar evento removendo campo obrigatório
- **Passos:** abrir edição, apagar o título, tentar salvar
- **Resultado esperado:** erro de validação; alteração não salva

### CT-EVT-013 — Excluir evento
- **Passos:**
  1. Clicar no ícone de exclusão de um evento
  2. Confirmar no diálogo de confirmação
- **Resultado esperado:** evento removido da lista; snackbar de sucesso

### CT-EVT-014 — Cancelar exclusão de evento
- **Passos:** clicar no ícone de exclusão, clicar em "Cancelar" no diálogo
- **Resultado esperado:** modal fecha; evento permanece na lista

### CT-EVT-015 — Paginação da lista de eventos
- **Passos:** com mais de 20 eventos cadastrados, navegar para a página 2
- **Resultado esperado:** próxima página carregada com eventos corretos; controles de paginação refletem página atual e total

---

## 8. Calendário (Atendimentos)

### CT-CAL-001 — Listar atendimentos do mês atual
- **Passos:** acessar `/admin/calendar`
- **Resultado esperado:** grade exibe atendimentos do mês corrente; cabeçalho exibe mês/ano atual

### CT-CAL-002 — Navegar entre meses
- **Passos:** clicar nas setas de navegação (anterior / próximo)
- **Resultado esperado:** lista atualizada com atendimentos do mês navegado; cabeçalho atualiza corretamente

### CT-CAL-003 — Criar atendimento com dados válidos
- **Passos:**
  1. Clicar em "Novo Atendimento"
  2. Preencher: Data ✅, Hora Início, Hora Fim, Tipo ✅ (Kardecismo/Umbanda/Palestra/Curso/Festa), Descrição 🔲, Observações 🔲
  3. Configurar "Requer Inscrição" e "Capacidade Máxima" se necessário
  4. Clicar em "Salvar"
- **Resultado esperado:** atendimento criado e exibido na lista do mês correspondente

### CT-CAL-004 — Criar atendimento sem data
- **Passos:** abrir formulário, não preencher data, clicar em "Salvar"
- **Resultado esperado:** erro de validação no campo Data

### CT-CAL-005 — Criar atendimento com requer inscrição habilitado e capacidade máxima
- **Passos:** habilitar "Requer Inscrição", preencher Capacidade Máxima com valor numérico positivo, salvar
- **Resultado esperado:** atendimento criado com capacidade máxima registrada

### CT-CAL-006 — Criar atendimento com capacidade máxima inválida (texto)
- **Passos:** preencher Capacidade Máxima com texto não numérico
- **Resultado esperado:** erro de validação; atendimento não criado

### CT-CAL-007 — Editar atendimento existente
- **Passos:** clicar em editar, alterar tipo e/ou horário, salvar
- **Resultado esperado:** dados atualizados refletem na lista

### CT-CAL-008 — Ativar/desativar atendimento
- **Passos:** editar atendimento, alterar o campo "Ativo", salvar
- **Resultado esperado:** status de ativo atualizado; chip na lista reflete o novo estado

### CT-CAL-009 — Excluir atendimento
- **Passos:** clicar em excluir, confirmar no diálogo
- **Resultado esperado:** atendimento removido da lista

---

## 9. Guias / Entidades

### CT-GUI-001 — Listar guias
- **Passos:** acessar o módulo de Guias
- **Resultado esperado:** lista paginada exibindo Nome, Especialidades, Status

### CT-GUI-002 — Criar guia com dados válidos
- **Passos:**
  1. Clicar em "Novo Guia"
  2. Preencher: Nome ✅, Descrição ✅, Especialidades ✅ (separadas por vírgula), Ordem de Exibição 🔲, Comida 🔲, Fruta 🔲, Dia da Semana 🔲, Cor 🔲, Saudação 🔲
  3. Clicar em "Salvar"
- **Resultado esperado:** guia criado e listado

### CT-GUI-003 — Criar guia sem nome
- **Resultado esperado:** erro "Nome é obrigatório"

### CT-GUI-004 — Criar guia sem especialidades
- **Resultado esperado:** erro "Informe pelo menos uma especialidade"

### CT-GUI-005 — Editar guia
- **Passos:** editar nome e especialidades de um guia existente, salvar
- **Resultado esperado:** alterações refletidas na lista

### CT-GUI-006 — Ativar/desativar guia
- **Passos:** editar guia, alterar flag "Ativo", salvar
- **Resultado esperado:** chip de status atualizado na lista

### CT-GUI-007 — Excluir guia
- **Passos:** clicar em excluir, confirmar
- **Resultado esperado:** guia removido da lista

### CT-GUI-008 — Visualizar detalhes do guia
- **Passos:** clicar no botão de detalhes/drawer de um guia
- **Resultado esperado:** painel lateral exibe todos os campos preenchidos corretamente

---

## 10. Membros da Casa

### CT-MBR-001 — Listar membros
- **Passos:** acessar o módulo de Membros
- **Resultado esperado:** grade exibe Nome, E-mail, Status (Ativo/Inativo), data de entrada

### CT-MBR-002 — Filtrar membros por nome/e-mail
- **Passos:** digitar parte do nome no campo de busca
- **Resultado esperado:** lista filtra corretamente

### CT-MBR-003 — Criar membro com dados obrigatórios
- **Passos:**
  1. Clicar em "Novo Membro"
  2. Preencher: Nome Completo ✅, Data de Nascimento 🔲, Data de Entrada 🔲, Orixá de Frente 🔲, Orixá de Coroa 🔲, Orixá de Ronda 🔲, E-mail 🔲, Telefone 🔲, Endereço completo 🔲, Notas 🔲
  3. Clicar em "Salvar"
- **Resultado esperado:** membro criado e exibido na lista

### CT-MBR-004 — Criar membro sem nome
- **Resultado esperado:** erro de validação no campo Nome

### CT-MBR-005 — Criar membro com e-mail inválido
- **Passos:** preencher e-mail em formato inválido (ex.: "naoeemail")
- **Resultado esperado:** erro de validação no campo E-mail

### CT-MBR-006 — Editar dados de membro
- **Passos:** clicar em editar, alterar nome e/ou orixá de frente, salvar
- **Resultado esperado:** dados atualizados na grade

### CT-MBR-007 — Ativar/desativar membro
- **Passos:** editar membro, alterar switch "Ativo", salvar
- **Resultado esperado:** chip de status atualizado na lista

### CT-MBR-008 — Excluir membro
- **Passos:** clicar em excluir, confirmar no diálogo
- **Resultado esperado:** membro removido da lista

### CT-MBR-009 — Adicionar contribuição a um membro
- **Passos:**
  1. Abrir edição de um membro
  2. Na aba de Contribuições, clicar em "Adicionar Contribuição"
  3. Preencher: Mês de Referência ✅, Data de Vencimento ✅, Valor ✅ (padrão R$ 50,00), Status ✅ (Pendente/Pago)
  4. Salvar
- **Resultado esperado:** contribuição registrada e visível na aba de contribuições do membro

### CT-MBR-010 — Registrar pagamento de contribuição
- **Passos:** editar contribuição pendente, alterar status para "Pago", preencher data de pagamento, salvar
- **Resultado esperado:** status atualizado para "Pago"; data de pagamento exibida

### CT-MBR-011 — Editar contribuição existente
- **Passos:** editar valor e/ou observações de uma contribuição, salvar
- **Resultado esperado:** dados da contribuição atualizados

### CT-MBR-012 — Excluir contribuição
- **Passos:** clicar em excluir contribuição, confirmar
- **Resultado esperado:** contribuição removida da lista do membro

---

## 11. Orixás

### CT-ORI-001 — Listar orixás
- **Passos:** acessar o módulo de Orixás
- **Resultado esperado:** lista exibindo Nome, Cores, Ordem de Exibição

### CT-ORI-002 — Criar orixá com dados válidos
- **Passos:**
  1. Clicar em "Novo Orixá"
  2. Preencher: Nome ✅, Descrição ✅, Cores ✅ (separadas por vírgula), Características 🔲, Elementos 🔲, Saudação 🔲, Fruta 🔲, Comida 🔲, Dia da Semana 🔲, Ordem de Exibição 🔲
  3. Clicar em "Salvar"
- **Resultado esperado:** orixá criado e listado com swatches de cores exibidos corretamente

### CT-ORI-003 — Criar orixá sem nome
- **Resultado esperado:** erro "Nome é obrigatório"

### CT-ORI-004 — Criar orixá sem cores
- **Resultado esperado:** erro "Informe pelo menos uma cor"

### CT-ORI-005 — Verificar swatches de cores
- **Passos:** criar ou editar orixá com cores nomeadas (ex.: "branco, azul, dourado")
- **Resultado esperado:** swatches coloridos exibidos na lista correspondendo às cores informadas

### CT-ORI-006 — Editar orixá
- **Passos:** editar descrição e cores de um orixá, salvar
- **Resultado esperado:** alterações refletidas na lista

### CT-ORI-007 — Excluir orixá
- **Passos:** clicar em excluir, confirmar
- **Resultado esperado:** orixá removido da lista

### CT-ORI-008 — Ordenação por displayOrder
- **Passos:** criar dois orixás com ordens diferentes (ex.: 1 e 5), verificar ordem na lista
- **Resultado esperado:** orixás exibidos de acordo com a ordem de exibição definida

---

## 12. Conteúdo Espiritual

### CT-ESP-001 — Listar conteúdos espirituais
- **Passos:** acessar o módulo de Conteúdo Espiritual
- **Resultado esperado:** lista paginada exibindo Título, Tipo, Categoria, Destaque, Status

### CT-ESP-002 — Filtrar por tipo
- **Passos:** selecionar um tipo no filtro (ex.: "Oração")
- **Resultado esperado:** lista exibe somente conteúdos do tipo selecionado

### CT-ESP-003 — Filtrar por categoria
- **Passos:** selecionar uma categoria (ex.: "Umbanda")
- **Resultado esperado:** lista exibe somente conteúdos da categoria selecionada

### CT-ESP-004 — Criar conteúdo com dados válidos
- **Passos:**
  1. Clicar em "Novo Conteúdo"
  2. Preencher: Título ✅, Conteúdo ✅, Tipo ✅ (Oração/Ensinamento/Doutrina/Ponto Cantado/Ritual), Categoria ✅ (Umbanda/Kardecismo/Geral/Orixás), Fonte 🔲, Ordem de Exibição 🔲
  3. Configurar "Em Destaque" e "Ativo" conforme necessário
  4. Clicar em "Salvar"
- **Resultado esperado:** conteúdo criado e listado

### CT-ESP-005 — Criar conteúdo sem título
- **Resultado esperado:** erro "Título é obrigatório"

### CT-ESP-006 — Criar conteúdo sem corpo do texto
- **Resultado esperado:** erro de validação no campo Conteúdo

### CT-ESP-007 — Marcar/desmarcar conteúdo como destaque
- **Passos:** editar conteúdo, alternar flag "Em Destaque", salvar
- **Resultado esperado:** ícone de destaque atualizado na lista

### CT-ESP-008 — Editar conteúdo espiritual
- **Passos:** editar título, tipo e/ou conteúdo, salvar
- **Resultado esperado:** alterações refletidas na lista

### CT-ESP-009 — Ativar/desativar conteúdo
- **Passos:** editar conteúdo, alterar flag "Ativo", salvar
- **Resultado esperado:** status atualizado na lista

### CT-ESP-010 — Excluir conteúdo espiritual
- **Passos:** clicar em excluir, confirmar
- **Resultado esperado:** conteúdo removido da lista

---

## 13. Linhas de Umbanda

### CT-UMB-001 — Listar linhas de Umbanda
- **Passos:** acessar o módulo de Linhas de Umbanda
- **Resultado esperado:** lista exibindo Nome, Entidades, Dias de Trabalho, Status

### CT-UMB-002 — Filtrar por entidade
- **Passos:** digitar nome de uma entidade no filtro
- **Resultado esperado:** lista exibe somente linhas que contenham a entidade buscada

### CT-UMB-003 — Filtrar por dia de trabalho
- **Passos:** selecionar um dia no filtro de dias
- **Resultado esperado:** lista exibe somente linhas com trabalho no dia selecionado

### CT-UMB-004 — Criar linha com dados válidos
- **Passos:**
  1. Clicar em "Nova Linha"
  2. Preencher: Nome ✅, Descrição ✅, Entidades ✅ (separadas por vírgula), Dias de Trabalho 🔲 (separados por vírgula), Ordem de Exibição 🔲
  3. Clicar em "Salvar"
- **Resultado esperado:** linha criada e listada

### CT-UMB-005 — Criar linha sem nome
- **Resultado esperado:** erro "Nome é obrigatório"

### CT-UMB-006 — Criar linha sem entidades
- **Resultado esperado:** erro "Informe pelo menos uma entidade"

### CT-UMB-007 — Visualizar detalhes das entidades
- **Passos:** clicar no botão de detalhes das entidades de uma linha
- **Resultado esperado:** drawer/painel lateral exibe a lista completa das entidades cadastradas

### CT-UMB-008 — Editar linha de Umbanda
- **Passos:** alterar nome, entidades e/ou dias de trabalho, salvar
- **Resultado esperado:** alterações refletidas na lista

### CT-UMB-009 — Ativar/desativar linha
- **Passos:** editar linha, alterar flag "Ativo", salvar
- **Resultado esperado:** status atualizado na lista

### CT-UMB-010 — Excluir linha de Umbanda
- **Passos:** clicar em excluir, confirmar
- **Resultado esperado:** linha removida da lista

---

## 14. Mensagens de Contato

### CT-MSG-001 — Listar mensagens
- **Passos:** acessar o módulo de Mensagens de Contato
- **Resultado esperado:** lista exibindo Remetente, Assunto, Status, Data, indicador de lida/não lida; contador de mensagens não lidas exibido

### CT-MSG-002 — Filtrar por texto
- **Passos:** digitar texto no campo de busca (nome ou assunto)
- **Resultado esperado:** lista filtrada exibindo apenas mensagens que contenham o texto

### CT-MSG-003 — Filtrar por status
- **Passos:** selecionar um status no filtro (Nova/Em atendimento/Resolvida/Arquivada)
- **Resultado esperado:** lista exibe somente mensagens com o status selecionado

### CT-MSG-004 — Visualizar mensagem completa
- **Passos:** clicar em uma mensagem para abrir detalhes
- **Resultado esperado:** drawer/modal exibe todos os campos: Nome, E-mail, Telefone, Assunto, Mensagem completa, Data, Status

### CT-MSG-005 — Marcar mensagem como lida
- **Passos:** clicar no ícone de "Marcar como lida" em uma mensagem não lida
- **Resultado esperado:** indicador de não lida removido; contador de não lidas decrementado

### CT-MSG-006 — Marcar mensagem como não lida
- **Passos:** clicar no ícone de "Marcar como não lida" em uma mensagem já lida
- **Resultado esperado:** indicador de não lida retorna; contador incrementado

### CT-MSG-007 — Alterar status para "Em atendimento"
- **Passos:** abrir mensagem com status "Nova", alterar status para "Em atendimento", salvar
- **Resultado esperado:** chip de status atualizado; alteração refletida na lista

### CT-MSG-008 — Alterar status para "Resolvida"
- **Passos:** alterar status de mensagem para "Resolvida"
- **Resultado esperado:** chip verde de "Resolvida" exibido

### CT-MSG-009 — Alterar status para "Arquivada"
- **Passos:** alterar status para "Arquivada"
- **Resultado esperado:** chip de "Arquivada" exibido; mensagem permanece na lista (sem exclusão)

### CT-MSG-010 — Abertura automática marca como lida
- **Passos:** abrir uma mensagem não lida
- **Resultado esperado:** ao visualizar, mensagem é automaticamente marcada como lida

---

## 15. Configurações do Site

### CT-CFG-001 — Carregar configurações atuais
- **Passos:** acessar a página de Configurações do Site
- **Resultado esperado:** todos os campos carregados com os valores atuais do banco

### CT-CFG-002 — Atualizar informações de contato
- **Passos:** alterar E-mail Institucional, Telefone Principal e/ou WhatsApp, salvar
- **Resultado esperado:** snackbar de sucesso; valores persistidos (recarregar página confirma)

### CT-CFG-003 — Atualizar endereço
- **Passos:** alterar campos de endereço (Rua, Número, Bairro, Cidade, Estado, CEP), salvar
- **Resultado esperado:** endereço atualizado e refletido no site público

### CT-CFG-004 — Atualizar redes sociais
- **Passos:** alterar URLs de Instagram, Facebook, YouTube, salvar
- **Resultado esperado:** links atualizados

### CT-CFG-005 — Atualizar dados de doação / Pix
- **Passos:** alterar Chave Pix, Nome do Beneficiário, Cidade, salvar
- **Resultado esperado:** dados de Pix atualizados

### CT-CFG-006 — Atualizar texto institucional (história)
- **Passos:** alterar Título, Subtítulo e/ou conteúdo HTML da história, salvar
- **Resultado esperado:** texto atualizado e refletido na seção "Sobre" do site público

### CT-CFG-007 — Salvar sem alterar nenhum campo
- **Passos:** acessar configurações e salvar sem modificar nada
- **Resultado esperado:** operação bem-sucedida sem erros; dados permanecem inalterados

---

## 16. RBAC / Usuários

### CT-USR-001 — Listar usuários como Admin
- **Pré-condição:** usuário Admin autenticado
- **Passos:** acessar `/admin/users`
- **Resultado esperado:** lista de usuários exibida; ações administrativas visíveis; sem erro 403

### CT-USR-002 — Criar usuário Editor
- **Passos:** criar usuário com role `Editor`, e-mail válido e senha temporária segura
- **Resultado esperado:** usuário criado com role correta; aparece na listagem; consegue autenticar se ativado

### CT-USR-003 — Bloquear acesso de Editor a Usuários
- **Pré-condição:** usuário Editor autenticado
- **Passos:** tentar acessar `/admin/users`
- **Resultado esperado:** acesso negado/403; menu de Usuários não deve ficar disponível para Editor

### CT-USR-004 — Normalização de role retornada pela API
- **Passos:** autenticar com usuário cuja API retorne role como string ou número, conforme ambiente
- **Resultado esperado:** frontend interpreta corretamente a role; rotas e menu seguem permissões esperadas

---

## 17. Filho da Casa / Login WhatsApp

### CT-MEM-AUTH-001 — Solicitar código por WhatsApp
- **Pré-condição:** Filho da Casa ativo com telefone cadastrado e autorizado no ambiente de teste
- **Passos:** na tela de login, selecionar fluxo Filho da Casa, informar celular com DDD e solicitar código
- **Resultado esperado:** mensagem genérica de envio exibida; código recebido no WhatsApp quando o número existir/autorizado; não há enumeração de cadastro

### CT-MEM-AUTH-002 — Validar código correto
- **Passos:** informar o código recebido por WhatsApp e confirmar login
- **Resultado esperado:** usuário autenticado como `Member`; redirecionado para `Meu Cadastro`; menu exibe apenas opções permitidas ao membro

### CT-MEM-AUTH-003 — Código inválido ou expirado
- **Passos:** informar código incorreto ou aguardar expiração antes de validar
- **Resultado esperado:** login recusado; mensagem de erro exibida; tentativas limitadas; sem criação de sessão

### CT-MEM-AUTH-004 — Bloqueio de Member em rotas administrativas
- **Pré-condição:** usuário Member autenticado
- **Passos:** tentar acessar rotas administrativas como `/admin/users`, `/admin/events` ou `/admin/members`
- **Resultado esperado:** acesso negado/redirecionado; nenhum dado administrativo é exibido

### CT-MEM-SELF-001 — Atualizar Meu Cadastro
- **Pré-condição:** usuário Member autenticado
- **Passos:** acessar `Meu Cadastro`, alterar dados pessoais/endereço permitidos e salvar
- **Resultado esperado:** dados atualizados com sucesso; recarregar a página mantém as alterações

---

## 18. Contribuições Recorrentes

### CT-CONTR-001 — Criar contribuição recorrente como Admin/Editor
- **Passos:** acessar Filhos da Casa, abrir membro, criar contribuição com `Recorrente` marcado e, se aplicável, `Permitir lembrete WhatsApp`
- **Resultado esperado:** contribuição salva com flags persistidas; lista exibe corretamente recorrência/lembrete

### CT-CONTR-002 — Gerar próxima contribuição ao marcar como paga
- **Pré-condição:** contribuição recorrente pendente existente
- **Passos:** marcar contribuição recorrente como paga
- **Resultado esperado:** contribuição atual muda para paga; sistema cria automaticamente próxima mensalidade pendente sem duplicidade

### CT-CONTR-003 — Registrar contribuição pelo autosserviço Member
- **Pré-condição:** usuário Member autenticado
- **Passos:** acessar `Meu Cadastro`, registrar contribuição pendente com dados válidos
- **Resultado esperado:** contribuição criada vinculada ao próprio membro; membro não consegue criar contribuição para outro cadastro

### CT-CONTR-004 — Lembretes automáticos permanecem desligados por padrão
- **Passos:** validar configuração do ambiente e logs após criar contribuição com lembrete permitido
- **Resultado esperado:** nenhum envio automático ocorre enquanto `ContributionReminders.Enabled=false`; envio só deve ocorrer após decisão operacional explícita

---

## 19. Mensagens de Contato / Resposta WhatsApp

### CT-WACON-001 — Contato público com opt-in WhatsApp
- **Passos:** no PublicWebsite, preencher formulário de contato marcando opção de receber resposta por WhatsApp e informar telefone com DDD
- **Resultado esperado:** mensagem criada com opt-in; aparece no AdminDashboard com indicação de WhatsApp

### CT-WACON-002 — Bloquear opt-in sem telefone válido
- **Passos:** marcar opt-in WhatsApp e tentar enviar sem telefone ou com telefone incompleto
- **Resultado esperado:** formulário exige telefone com DDD; mensagem não é enviada até correção

### CT-WACON-003 — Responder contato por WhatsApp pelo AdminDashboard
- **Pré-condição:** mensagem pública com opt-in WhatsApp e telefone autorizado no ambiente
- **Passos:** abrir mensagem no AdminDashboard, escrever resposta e clicar em enviar por WhatsApp
- **Resultado esperado:** mensagem enviada pelo WhatsApp; contato registra texto/data de resposta; status visual atualizado

### CT-WACON-004 — Falha de envio não marca como respondida
- **Passos:** simular envio desabilitado ou número não autorizado e tentar responder por WhatsApp
- **Resultado esperado:** erro exibido; mensagem não recebe `WhatsAppResponseSentAt`; contato não é marcado indevidamente como respondido

---

## 20. Comportamentos Gerais

### CT-GRL-001 — Feedback visual de operação em andamento
- **Passos:** clicar em "Salvar" em qualquer formulário
- **Resultado esperado:** botão exibe indicador de loading enquanto a requisição está em andamento; não é possível clicar novamente

### CT-GRL-002 — Mensagem de sucesso (Snackbar)
- **Passos:** completar qualquer operação de criação, edição ou exclusão com sucesso
- **Resultado esperado:** snackbar verde exibida com mensagem de confirmação; desaparece automaticamente após alguns segundos

### CT-GRL-003 — Mensagem de erro de API
- **Passos:** simular falha de rede ou erro 500 da API durante uma operação
- **Resultado esperado:** mensagem de erro exibida na interface; formulário não fecha; usuário pode tentar novamente

### CT-GRL-004 — Confirmação antes de excluir
- **Passos:** clicar no ícone de excluir em qualquer módulo
- **Resultado esperado:** diálogo de confirmação exibido antes de executar a exclusão

### CT-GRL-005 — Fechar modal sem salvar
- **Passos:** abrir formulário de criação/edição, preencher dados, fechar sem salvar
- **Resultado esperado:** modal fecha; nenhuma alteração é persistida; lista permanece inalterada

### CT-GRL-006 — Paginação em todas as listagens
- **Passos:** com mais registros que o tamanho de página (padrão 10 ou 20), navegar entre páginas
- **Resultado esperado:** paginação funciona corretamente; total de registros exibido; página atual indicada

### CT-GRL-007 — Acesso de usuário com role Editor
- **Passos:** logar com usuário Editor e tentar acessar módulos restritos ao Admin (ex.: Usuários)
- **Resultado esperado:** acesso negado com mensagem apropriada; sem exposição de dados não autorizados

---

## 21. Critérios de Aceite

Um módulo é considerado aprovado quando:

1. Todos os casos de teste de sucesso passam sem erros
2. Todas as validações de campos obrigatórios funcionam e exibem mensagens claras
3. As operações de exclusão exigem confirmação do usuário
4. Feedback visual (loading, sucesso, erro) é exibido em todas as operações
5. Os dados persistidos na API refletem exatamente o que foi inserido/editado na interface
6. A paginação funciona corretamente em todas as listagens
7. O comportamento é consistente entre criação e edição para o mesmo módulo

---

## 22. Próximos Passos

Após validação deste plano:

- [ ] Definir ambiente de testes (manual x automatizado)
- [ ] Definir ferramenta de execução (ex.: planilha de evidências, Jira, TestRail)
- [ ] Criar dados de carga para testes de paginação
- [ ] Planejar execução dos testes (prioridade por módulo)
- [ ] Definir responsáveis por módulo
- [ ] Planejar testes de regressão pós-correção de bugs
- [ ] Atualizar `docs/Plano de Testes Batuara - v5.xlsx` com os novos casos CT-USR, CT-MEM-AUTH, CT-MEM-SELF, CT-CONTR e CT-WACON

---

*Plano elaborado com base na análise do código-fonte do AdminDashboard (React/TypeScript) e da API (.NET Clean Architecture) em 2026-06-25; atualizado em 2026-07-08 para RBAC, Filho da Casa, recorrência e WhatsApp.*
