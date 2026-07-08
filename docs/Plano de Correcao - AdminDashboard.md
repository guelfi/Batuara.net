# Plano de Correção — Batuara.net AdminDashboard

**Origem:** `docs/Plano de Testes Batuara - v5.xlsx`, aba "Plano de Ação", 22 casos com STATUS TESTE = Reprovado (18) ou Bloqueado (4).
**Escopo do código:** `src/Frontend/AdminDashboard` (React + TypeScript, MUI DataGrid).
**Gerado em:** 2026-07-03.

## Como usar este documento

Este arquivo foi escrito para ser executado por um agente de IA de desenvolvimento. Cada item de correção (`COR-XX`) é independente e traz: prioridade, casos de teste que ele resolve, arquivos e trechos já localizados no código, causa-raiz (confirmada por leitura direta do código-fonte, não é suposição), correção recomendada e critério de aceite.

Para o status operacional consolidado pós-implementação, consulte também `docs/Status Atual - RBAC WhatsApp e COR-09.md`.

Ordem sugerida de execução: seguir a ordem numérica (prioridade Alta primeiro). Ao concluir um item, reexecutar os casos de teste (`CT-XXX-NNN`) listados nele na planilha de testes para fechar o ciclo.

Convenção de caminhos: todos os arquivos abaixo são relativos a `src/Frontend/AdminDashboard/src/`.

---

## Resumo das frentes

| ID | Status | Prioridade | Casos cobertos | Frente |
|---|---|---|---|---|
| COR-01a | Pendente | Informativo | CT-GUI-006, CT-UMB-001, CT-UMB-009, CT-ESP-009 | Reclassificação: Ativo/Inativo NÃO se aplica a Orixás, Guias, Linhas de Umbanda e Conteúdo Espiritual |
| COR-01b | ✅ Concluído (2026-07-06) | Alta | CT-MBR-001 | Ativo/Inativo em Filhos da Casa (Membros) — controle real, mantém correção |
| COR-01c | ✅ Concluído (2026-07-06) | Alta | CT-CAL-008 (+ Eventos, proativo) | Status "Cancelada" em Calendário de Atendimentos e Eventos/Festas |
| COR-02 | ✅ Concluído (2026-07-06) | Alta | 5 | Validação client-side incompleta em formulários de cadastro |
| COR-03 | Implementado, pendente validação E2E | Alta | 1 (+ related) | Restrição de acesso por role (Editor) não aplicada nas rotas |
| COR-04 | Pendente | Média | 2 | Ação "Visualizar detalhes" ausente ou não descobrível |
| COR-05 | Pendente | Média | 2 | Paginação ausente ou não confirmada em listas |
| COR-06 | Pendente | Média | 2 | Marcar mensagem como lida/não lida inacessível na grade |
| COR-07 | Pendente | Baixa | 1 | Filtro por período não funcional em Eventos |
| COR-08 | Pendente | Informativo | 3 | Itens bloqueados por ambiente/dado de teste, não por bug de código |
| COR-09 | ✅ Concluído (2026-07-07) | Melhoria | — (fora do Plano de Testes original) | Integração real entre Orixás e Filhos da Casa (texto livre → seleção) |

Total: 22 casos (18 Reprovado + 4 Bloqueado) + 1 melhoria proposta fora do escopo original de testes.

> **Regra de negócio confirmada pelo dono do produto (2026-07-03):** o AdminDashboard não deve usar o conceito de "Ativo/Inativo" em CRUDs de Orixás, Guias e Entidades, Linhas de Umbanda e Conteúdo Espiritual — a exclusão nesses módulos deve ser **física**, por ser mais simples de entender para o usuário. Em Calendário de Atendimentos e Eventos/Festas, o mesmo tipo de controle deve existir, mas com semântica de **"Cancelada"** (não "Inativo"), porque um visitante do PublicWebsite pode ter guardado a informação de que haveria um compromisso naquela data — o registro não pode simplesmente sumir ou virar "inativo" sem explicação. Em Filhos da Casa, "Ativo/Inativo" é um controle real já usado pelos Dirigentes da Casa e deve ser mantido.

---

## COR-01a — Reclassificação: Ativo/Inativo NÃO se aplica a Orixás, Guias, Linhas de Umbanda e Conteúdo Espiritual

**Prioridade:** Informativo (decisão de produto, não é bug)
**Casos afetados:** CT-GUI-006, CT-UMB-001, CT-UMB-009, CT-ESP-009

### Diagnóstico
O Plano de Testes original esperava um toggle "Ativo/Inativo" nesses quatro módulos (`pages/GuidesPage.tsx`, `pages/UmbandaLinesPage.tsx`, `pages/SpiritualContentPage.tsx`). Confirmado em código que **nenhum dos quatro tem esse controle implementado hoje** (campo `isActive` existe só no estado do formulário de Guias/Umbanda, sem `Switch` nem coluna na grade; em Conteúdo Espiritual o único `Switch`, linha 568, controla `isFeatured`/"Destaque", não `isActive`).

**Decisão do produto (2026-07-03):** esse comportamento está correto por design — esses módulos devem usar **exclusão física**, não um toggle de status. Não implementar Switch/coluna de Ativo-Inativo nesses quatro módulos.

### Ação recomendada
1. **Não desenvolver** toggle Ativo/Inativo em `GuidesPage.tsx`, `UmbandaLinesPage.tsx` e `SpiritualContentPage.tsx`.
2. Atualizar `docs/Plano de Testes Batuara - v5.xlsx`: revisar o "Resultado esperado" de CT-GUI-006, CT-UMB-001, CT-UMB-009 e CT-ESP-009 para remover a expectativa de Ativo/Inativo (o resultado esperado passa a ser, por exemplo, "campo de status não se aplica; exclusão é física").
3. Garantir que a exclusão física funciona corretamente nesses módulos (ver COR-08 — CT-ORI-007/CT-UMB-010 tratam do mesmo tema para exclusões bloqueadas por vínculo).

### Critério de aceite
Test plan atualizado; CT-GUI-006, CT-UMB-001, CT-UMB-009 e CT-ESP-009 fecham como "Não se aplica" em vez de reabrir como bug de UI.

---

## COR-01b — Ativo/Inativo em Filhos da Casa (Membros)

**Status:** ✅ Concluído em 2026-07-06 — colunas E-mail, Status e Entrada adicionadas em `MembersPage.tsx` (mobile e desktop). Validado no navegador contra a API real (Docker local): grade exibe as três colunas com dados reais (122 membros), Status em chip Ativo/Inativo, Entrada formatada `DD/MM/YYYY`.
**Prioridade:** Alta
**Caso coberto:** CT-MBR-001

Este é um controle real, já usado pelos Dirigentes da Casa — mantém-se a correção original.

### Diagnóstico
- **`pages/MembersPage.tsx`**: o modelo já tem `isActive` (usado no filtro, linha ~185, e num `Switch` de edição, linhas 816-820), mas o array `columns` (linhas 218-263, ambas as variantes mobile e desktop) só define `actions`, `fullName` e `mobilePhone`.
- Faltam as colunas **E-mail**, **Status (Ativo/Inativo)** e **Data de entrada**, que o resultado esperado do teste exige.

### Ação recomendada
Adicionar `{ field: 'email', headerName: 'E-mail', ... }`, `{ field: 'isActive', headerName: 'Status', renderCell: (params) => <Chip label={params.row.isActive ? 'Ativo' : 'Inativo'} color={params.row.isActive ? 'success' : 'default'} size="small" /> }` e `{ field: 'entryDate', headerName: 'Entrada', ... }` nas duas variantes do array `columns`.

### Critério de aceite
Reexecutar CT-MBR-001: grade exibe Nome, E-mail, Status (Ativo/Inativo) e data de entrada.

---

## COR-01c — Status "Cancelada" em Calendário de Atendimentos e Eventos/Festas

**Status: ✅ Implementado e validado em 2026-07-06** — `Switch` "Cancelar atendimento"/"Cancelar evento" confirmado funcional via navegador em `http://192.168.15.157/batuara-admin` (Calendário e Eventos e Festas), com chip Ativo/Cancelado refletindo a mudança. Coluna Status também adicionada em `EventsPage.tsx` (o backend já suportava `IsActive`/`Activate`/`Deactivate` em `Event`, ao contrário do que o diagnóstico original supunha). Bug adicional encontrado e corrigido em `CalendarPage.tsx`: o diff de `handleSubmit` comparava `form.type` (número) com `editingItem.type` (string, pois o backend serializa enums como string), sempre resultando `true` e disparando indevidamente a trava de "atendimento já ocorreu" em qualquer edição — corrigido normalizando `editingItem.type` antes de comparar.

**Prioridade:** Alta
**Caso coberto:** CT-CAL-008 (falha confirmada) + Eventos e Festas (recomendação proativa, sem CT reprovado específico)

### Diagnóstico
- **`pages/CalendarPage.tsx`**: a coluna `isActive` já existe na grade (linhas 253-260 e 329-335) e o `renderCell` já usa a semântica correta — `<Chip label={isActive ? 'Ativo' : 'Cancelado'} .../>` — ou seja, o rótulo "Cancelado" já é usado no lugar de "Inativo", alinhado com a regra de negócio. **O problema é que a coluna é somente leitura**: não há `onClick` na grade nem `Switch`/controle no formulário (o único `Switch` do formulário, linha 781, é `requiresRegistration`, não `isActive`).
- **`pages/EventsPage.tsx`**: existe um filtro `isActive` (linha 242) enviado para a API, mas **nenhuma coluna, chip ou controle na UI** para o status do evento em si. Antes de implementar, confirmar no backend (`Event` entity em `Batuara.Domain`) se já existe um campo equivalente a `IsActive`/cancelamento — a memória de arquitetura deste projeto não lista esse campo na entidade `Event`, então pode ser necessário incluir migração de banco + API antes do frontend.

### Ação recomendada
1. **Calendário:** adicionar `Switch`/`FormControlLabel` para `form.isActive` no formulário de edição, rotulado como "Cancelar atendimento" (não "Ativo/Inativo"), reaproveitando o Chip que já diz "Cancelado" na grade.
2. **Eventos e Festas:** verificar se `Event` (Domain/API) já suporta um campo de cancelamento. Se sim, replicar o mesmo padrão do Calendário (Chip "Cancelado" + controle de edição). Se não, tratar como item de backlog maior (Domain + Infrastructure + API + Frontend), não como correção pontual de frontend.
3. Em ambos, manter a linguagem "Cancelada/Cancelado" na UI — nunca "Inativo" — já que o registro pode ter sido visto por um visitante do PublicWebsite antes do cancelamento.

### Critério de aceite
Reexecutar CT-CAL-008: status "Cancelado" pode ser alternado a partir da UI e reflete no chip da lista. Para Eventos, validar com o time de produto se a funcionalidade entra neste ciclo ou em um próximo.

---

## COR-02 — Validação client-side incompleta em formulários de cadastro

**Status: ✅ Implementado e validado em 2026-07-06** — testado ao vivo em `http://192.168.15.157/batuara-admin`: Eventos bloqueia submit sem descrição com mensagem específica, e também valida limites de 200 (título) e 2000 (descrição) caracteres; Orixás rejeita cor não reconhecida com mensagem específica (`Cor "X" não reconhecida...`); Linhas de Umbanda não fecha mais silenciosamente e exibe "Informe pelo menos uma entidade."/"Descrição é obrigatória." corretamente — payload movido para dentro do `try` com defaults defensivos (`form.entities || ''`), e erro de submit padronizado com `dialogError` (Alert inline), igual a Orixás.

**Prioridade:** Alta
**Casos cobertos:** CT-EVT-007, CT-EVT-009, CT-EVT-010, CT-ORI-002, CT-UMB-004

### Diagnóstico

1. **`pages/EventsPage.tsx`** (CT-EVT-007, CT-EVT-009, CT-EVT-010)
   - `validateForm()` (linhas 400-415) valida `title`, `date`, `startTime`, `endTime` — mas **não valida `description`** (obrigatoriedade) **nem limites de tamanho** de `title` (200) e `description` (2000), apesar de o backend (`Event` entity) ter esses limites.
   - **Ação:** em `validateForm()`, adicionar:
     ```ts
     if (!form.description.trim()) nextErrors.description = 'Descrição é obrigatória.';
     if (form.title.length > 200) nextErrors.title = 'O título não pode exceder 200 caracteres.';
     if (form.description.length > 2000) nextErrors.description = 'A descrição não pode exceder 2000 caracteres.';
     ```
   - Adicionar `description` ao tipo `formErrors` (linha ~200) e ligar `error`/`helperText` no campo de descrição do formulário (mesmo padrão usado no campo `title`, linhas 684-687).

2. **`pages/OrixasPage.tsx`** (CT-ORI-002)
   - `validateOrixaForm` só checa se `colors` está vazio (linha 50: `if (!form.colors.trim())`), sem validar se os nomes informados existem no mapa de cores conhecidas (linhas 84-100+).
   - O `handleSubmit` (linhas 316-350) tem tratamento de erro (`dialogError` + `Alert`, linhas 548-549) mas cai no fallback genérico `'Não foi possível salvar o Orixá.'` quando o backend não retorna `message` no formato esperado — por isso o teste percebeu como "erro silencioso".
   - **Ação:** validar no client que cada valor de `colors` (após `splitCsv`) bate com uma chave do mapa de cores (ou é um hex válido `#RRGGBB`) antes de enviar; se não bater, marcar `formErrors.colors` com mensagem específica (ex.: `"Cor 'X' não reconhecida"`), evitando depender só do erro do backend.

3. **`pages/UmbandaLinesPage.tsx`** (CT-UMB-004)
   - Em `handleSubmit` (linhas 266-300), o `payload` é montado **fora do bloco `try`** (linhas 273-280), incluindo `form.entities.split(',')` e `form.workingDays.split(',')`. Se `form.entities`/`form.workingDays` for `undefined`/`null` em algum fluxo de criação, o `.split` lança exceção não tratada — o modal não fecha e nenhuma mensagem aparece, batendo exatamente com o sintoma relatado.
   - Além disso, o erro de submissão aqui usa `setFeedback` (Snackbar, linha 294-297), enquanto `OrixasPage.tsx` usa `dialogError` (Alert dentro do modal). Painéis diferentes usam padrões diferentes de exibição de erro — padronizar reduz esse tipo de falha silenciosa.
   - **Ação:** mover a montagem do `payload` para dentro do `try`, garantir que `form.entities`/`form.workingDays` nunca sejam `undefined` (default `''` no `initialFormState`), e padronizar o uso de `dialogError` (Alert inline no modal) como padrão de erro de submissão em todos os módulos de cadastro.

### Critério de aceite
Reexecutar CT-EVT-007, CT-EVT-009, CT-EVT-010, CT-ORI-002, CT-UMB-004: cada tentativa de salvar dado inválido deve exibir mensagem de erro específica e manter o formulário aberto, sem fechar silenciosamente.

---

## COR-03 — Restrição de acesso por role (Editor) não aplicada nas rotas

**Status:** Implementado em código em 2026-07-07; pendente validação E2E com usuários reais Admin/Editor/Viewer no ambiente.

**Prioridade:** Alta (segurança/controle de acesso)
**Caso relacionado:** CT-GRL-007 (Bloqueado)

### Diagnóstico
- `components/common/ProtectedRoute.tsx` já implementa a lógica de checagem de role (linhas 38-45: `requiredRole` + `user.role <= requiredRole` + redirect para `/unauthorized`).
- Porém, `App.tsx` **não passa `requiredRole` em nenhuma rota** (busca no arquivo não encontrou nenhuma ocorrência) — ou seja, hoje **qualquer usuário autenticado, independente da role, acessa todas as páginas administrativas**.
- `ProfilePage.tsx:256` indica que o sistema tem 3 níveis de role (0=Administrador, 1=Moderador, 2=Editor), não apenas Admin/Editor como documentado.
- Este não é apenas um problema de dado de teste (usuário Editor inexistente) — é uma lacuna real de controle de acesso no frontend, mesmo que a API já valide roles no backend.

### Ação recomendada
1. Definir, junto com o responsável do produto, quais páginas devem ser restritas a Admin (ex.: `UsersPage`/gestão de usuários, `SiteSettings`).
2. Passar `requiredRole={UserRole.Admin}` nas rotas correspondentes em `App.tsx`.
3. Criar um usuário de teste com role Editor no ambiente de QA para validar o comportamento ponta a ponta.

### Critério de aceite
Reexecutar CT-GRL-007 com um usuário Editor real: acesso a páginas restritas deve redirecionar para `/unauthorized` sem expor dados.

---

## COR-04 — Ação "Visualizar detalhes" ausente ou não descobrível

**Prioridade:** Média
**Casos cobertos:** CT-GUI-008, CT-UMB-007

### Diagnóstico

1. **`pages/GuidesPage.tsx`** (CT-GUI-008)
   - Existe um `Drawer` de detalhes já implementado (linhas 454-479) com estado `detailsOpen`/`detailsTitle` (linhas 83-84, 129), **mas `setDetailsOpen(true)` nunca é chamado em nenhum lugar do arquivo** — o componente está "morto", sem nenhum botão ou ação que o acione. `getActions` da grade (linhas 141, 184) só tem "Editar".
   - **Ação:** adicionar um `GridActionsCellItem` com ícone de visualização (`VisibilityIcon`) em `getActions` que chame `setDetailsTitle(...)` + `setDetailsOpen(true)`, reaproveitando o Drawer já existente.

2. **`pages/UmbandaLinesPage.tsx`** (CT-UMB-007)
   - Aqui o Drawer de detalhes **é funcional** (`openDetails`, linhas 121-125, chamado nas linhas 161 e 198), mas o gatilho é um chip pequeno `+N` que **só aparece quando a linha tem mais de 1 entidade** (linha 155: `entities.length > 1`). Linhas com 0 ou 1 entidade não têm nenhuma forma de abrir o painel, e mesmo quando aparece, não é um controle óbvio de "visualizar detalhes".
   - **Ação:** adicionar uma ação explícita "Visualizar" (`GridActionsCellItem` com `VisibilityIcon`) em `getActions`, chamando `openDetails(...)` independentemente da quantidade de entidades.

### Critério de aceite
Reexecutar CT-GUI-008 e CT-UMB-007: deve existir um botão visível e sempre disponível para abrir o painel de detalhes.

---

## COR-05 — Paginação ausente ou não confirmada em listas

**Prioridade:** Média
**Casos cobertos:** CT-DASH-003, CT-ESP-001

### Diagnóstico

1. **`components/dashboard/DashboardContent.tsx`** (CT-DASH-003)
   - Nenhuma referência a paginação, `GridPager` ou "carregar mais" no arquivo — o log de atividades recentes realmente não tem nenhum controle de paginação implementado.
   - **Ação:** implementar paginação (reaproveitar o componente `components/common/GridPager.tsx`, já usado em outras páginas) ou "carregar mais" incremental no log de atividades.

2. **`pages/SpiritualContentPage.tsx`** (CT-ESP-001)
   - **Atenção — possível falso-negativo:** o código já tem `GridPager` renderizado (linha 444-449) acima de um `DataGrid` com `paginationMode="server"` e `hideFooter` (linhas 450-460), ou seja, a paginação parece corretamente implementada na versão atual do código.
   - **Ação:** antes de qualquer alteração, reexecutar CT-ESP-001 manualmente. Se a paginação já funcionar, apenas atualizar o resultado do teste (pode ser um item já corrigido após a rodada de testes, ou um falso-negativo de ambiente). Se persistir, investigar se `totalCount` chega zerado da API (o que deixaria o `GridPager` com os dois botões desabilitados e "0 de 0", parecendo quebrado).

### Critério de aceite
Reexecutar CT-DASH-003 e CT-ESP-001.

---

## COR-06 — Marcar mensagem como lida/não lida inacessível na grade

**Prioridade:** Média
**Casos cobertos:** CT-MSG-005, CT-MSG-006

### Diagnóstico
- `pages/ContactMessagesPage.tsx` já implementa `handleToggleRead` (linhas 165-170) e um botão com tooltip "Marcar como lida"/"Marcar como não lida" (linhas 522-528) — **mas esse botão só existe dentro da visualização de detalhes da mensagem selecionada** (`selectedMessage`), não como ação rápida direto na grade/lista.
- O teste avaliou a grade principal e só encontrou as abas de filtro (lida/não lida), sem ação individual — condizente com o código.

### Ação recomendada
Adicionar um `GridActionsCellItem` (ícone de envelope aberto/fechado) na coluna de ações da grade, chamando `handleToggleRead(params.row)` diretamente, sem precisar abrir o detalhe da mensagem.

### Critério de aceite
Reexecutar CT-MSG-005 e CT-MSG-006 a partir da grade, sem abrir o painel de detalhes.

---

## COR-07 — Filtro por período não funcional em Eventos

**Prioridade:** Baixa
**Caso coberto:** CT-EVT-004

### Diagnóstico
Não investigado em profundidade nesta rodada (baixo volume — 1 caso). Ponto de partida para o agente: `pages/EventsPage.tsx`, procurar o estado do filtro de data (provavelmente próximo aos outros filtros, antes do `useEffect` que recarrega a lista) e confirmar se os valores de início/fim do intervalo estão sendo enviados para `apiService.getEvents(...)` e se a API realmente filtra por `EventDate` dentro do range.

### Critério de aceite
Reexecutar CT-EVT-004: lista deve exibir somente eventos dentro do intervalo informado.

---

## COR-08 — Itens que não são bugs de código (ambiente/dado de teste/processo)

Estes casos não indicam defeito no código — são lacunas de execução do teste ou decisões de produto pendentes. Não devem ser tratados como tarefas de desenvolvimento sem antes uma decisão de negócio.

| Caso | Situação |
|---|---|
| CT-AUTH-006 | Renovação de token é automática por design (refresh token via cookie httpOnly, sem UI). Se a intenção é validar via QA, criar um mecanismo de diagnóstico (ex.: log visível em modo dev) em vez de expor o refresh token na UI de produção. |
| CT-ORI-007 | Bloqueado por suposição de "risco de integridade referencial com membros vinculados" — **não confirmada em código.** `HouseMember.cs` tem `HeadOrixaFront/Back/Ronda` como `string?` livres, sem nenhuma foreign key para `Orixa`. Não existe constraint de banco que impeça a exclusão. **Ação: apenas reexecutar o teste**, sem necessidade de desenvolvimento prévio — a exclusão física já deve funcionar. Ver nota abaixo sobre risco residual de dado órfão. |
| CT-UMB-010 | Mesmo diagnóstico do item acima: nenhuma referência a `UmbandaLine` foi encontrada em `HouseMember.cs`. **Ação: apenas reexecutar o teste**, sem bloqueio real. |
| CT-GRL-007 | Ver COR-03 — falta usuário Editor no ambiente de teste, além da lacuna de código já registrada em COR-03. |

**Nota sobre CT-ORI-007/CT-UMB-010 — risco residual (não bloqueia o teste, é item de backlog):** como `HeadOrixaFront/Back/Ronda` em `MembersPage.tsx` (linhas 881-898) são `TextField` de digitação livre, não um `Autocomplete`/`Select` ligado ao catálogo de Orixás, excluir um Orixá não quebra nada tecnicamente, mas pode deixar Filhos da Casa com um nome de Orixá "órfão" (que não existe mais no catálogo) sem nenhum aviso. Mesmo raciocínio se algum dia Linhas de Umbanda ganhar um campo de digitação análogo. Isso é uma melhoria de qualidade de dado a avaliar separadamente (ex.: trocar por `Autocomplete` com opções vindas de `GET /api/orixas`), não um motivo para manter os testes bloqueados.

**Nota de correção sobre a nota anterior:** `CT-GUI-007 — Excluir guia` está **Aprovado** na planilha (não bloqueado) — a exclusão de Guias já foi testada e funciona.

---

## COR-09 — Integração real entre Orixás e Filhos da Casa (melhoria, fora do Plano de Testes original)

**Status:** ✅ Implementado em 2026-07-07 — os campos `HeadOrixaFront`, `HeadOrixaBack` e `HeadOrixaRonda` em `MembersPage.tsx` foram substituídos por `Autocomplete` carregado de `apiService.getOrixas(...)`, com `freeSolo` para preservar cadastros antigos com texto livre. `Orixá de frente` agora é obrigatório no formulário administrativo. Validado por `npm run build` e `docker compose -f docker-compose.local.yml build admindashboard`; permanecem apenas warnings antigos de lint não relacionados.

**Prioridade:** Melhoria (não corrige um `CT` reprovado/bloqueado — é um item de evolução identificado durante a análise do COR-08)
**Módulo:** `pages/MembersPage.tsx` (aba "Orixás" do CRUD de Filhos da Casa, `dialogTab === 2`)

### Contexto
Antes da correção, os campos "Orixá de frente", "Orixá de costas" e "Orixá de ronda" eram `TextField` de digitação livre, sem nenhuma ligação com o cadastro de Orixás (`pages/OrixasPage.tsx` / `GET /api/orixas`). Isso foi identificado como causa do "risco" que bloqueou CT-ORI-007 (ver COR-08) — na prática não bloqueava a exclusão, mas permitia nomes digitados livremente, com risco de erro de digitação e de ficarem "órfãos" caso um Orixá fosse renomeado ou excluído.

**Decisão do produto (2026-07-03):** vale a pena implementar essa integração como item de melhoria do projeto — trocar os três campos de texto livre por caixas de seleção associadas ao cadastro real de Orixás.

### Regra de negócio
- **Orixá de frente:** obrigatório.
- **Orixá de costas:** opcional.
- **Orixá de ronda:** opcional.

(Hoje nenhum dos três é validado como obrigatório em `validateForm`, linhas 382-402 de `MembersPage.tsx` — a obrigatoriedade do Orixá de frente também precisa ser adicionada.)

### Ação recomendada
1. Substituir os três `TextField` (linhas 881-898) por `Autocomplete` do MUI, com as opções carregadas do catálogo de Orixás (mesmo padrão de chamada usado em `OrixasPage.tsx`, via `apiService.getOrixas(...)`). Sugestão: carregar a lista uma vez ao abrir o diálogo de edição/criação do membro (não a cada tecla digitada), já que o catálogo de Orixás tende a ser pequeno e estável.
2. Manter compatibilidade com os dados já existentes: registros antigos têm `headOrixaFront/Back/Ronda` como texto livre que pode não bater exatamente com um nome do catálogo atual — o `Autocomplete` deve aceitar exibir o valor salvo mesmo que não esteja mais na lista de opções (ex.: `freeSolo` combinado com validação, ou uma opção "outro" explícita), para não travar a edição de cadastros antigos.
3. Adicionar em `validateForm()`: `if (!form.headOrixaFront.trim()) nextErrors.headOrixaFront = 'Orixá de frente é obrigatório.'` — sem validação equivalente para `headOrixaBack`/`headOrixaRonda`, que continuam opcionais.
4. Decisão em aberto para o time (não bloqueia esta melhoria): manter o dado como string (só trocando o componente de UI, sem mudança de schema) ou evoluir para uma relação real com `OrixaId` no banco (`Batuara.Domain`/`Batuara.Infrastructure`, com migração EF Core). A primeira opção é bem mais simples e resolve o problema de digitação; a segunda dá integridade referencial completa, mas é um escopo maior de backend.

### Critério de aceite
No formulário de Filhos da Casa: Orixá de frente exige seleção de um item do catálogo (ou bloqueia submit se vazio); Orixá de costas e de ronda continuam opcionais mas também restritos ao catálogo quando preenchidos; cadastros antigos com texto livre continuam visíveis/editáveis sem erro.

---

## Referência cruzada com o Plano de Testes

Para cada `COR-XX` concluído, reabrir `docs/Plano de Testes Batuara - v5.xlsx` e atualizar o `STATUS TESTE` dos `CT-XXX-NNN` correspondentes após reexecução, seguindo o fluxo já usado no projeto.
