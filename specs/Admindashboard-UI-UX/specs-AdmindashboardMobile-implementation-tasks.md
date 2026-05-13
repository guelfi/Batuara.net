# Controle de Implementação — AdminDashboard (Mobile + ajustes Desktop)

Legenda:
- [ ] Pendente
- [x] Concluído

Regras:
- Não iniciar implementação de um item sem confirmar impacto em desktop.
- Não introduzir comportamento divergente desktop/mobile sem justificativa e critério de aceitação.
- “Excluir” sempre = inativação lógica (soft delete) + modal de confirmação.

## Estratégia de Branching

- Branch de produção (referência OCI): master
- Branch dedicada deste desenvolvimento: feature/admindashboard-mobile-first
- Fluxo:
  - todo desenvolvimento ocorre em feature/admindashboard-mobile-first
  - PR obrigatório para master
  - merge somente após validação (mobile + desktop) conforme checklist deste arquivo
- Como criar/usar (equipe):
  - `git fetch origin --prune`
  - `git checkout master && git pull`
  - `git checkout -b feature/admindashboard-mobile-first`
  - `git push -u origin feature/admindashboard-mobile-first`

## Global (base)

- [x] Padronizar alvos de toque (48×48dp) para ícones de ação, setas, botões e itens de lista (mobile).
- [ ] Garantir ausência de scroll horizontal em 320px para todas as rotas (mobile).
- [x] Garantir estados loading/error/empty em todas as telas com dados remotos.
- [x] Garantir acessibilidade mínima: contraste AA, foco visível (desktop), aria-label em ícones.
- [x] Remover botão “Atualizar” nas telas onde não agrega valor (desktop e mobile), seguindo regra: auto-refresh/pull-to-refresh.
  - [x] CalendarPage / EventsPage / OrixasPage / GuidesPage / UmbandaLinesPage / SpiritualContentPage / MembersPage / LocationPage / DonationsContactPage / HistoryPage

## Navegação / Drawer

- [x] Drawer mobile: abrir pelo hambúrguer, fechar por overlay e manter foco inicial no primeiro item.
- [x] Drawer desktop: fechar via ESC e manter navegação por Tab consistente.
- [x] Garantir que o AppBar e o botão hambúrguer permaneçam acessíveis (48×48dp) em todas as rotas.

Critérios de aceitação (Navegação):
- [x] Ao autenticar, rota padrão é Dashboard.
- [x] Drawer não bloqueia scroll após fechar e não causa “layout shift” ao abrir/fechar.

## Dashboard

### Cards de métricas (Dashboard[Top].jpeg)
- [x] Mobile: cards em 1 coluna full-width (remover “slots vazios”).
- [x] Padronizar card clicável com affordance (chevron/ícone) + feedback (pressed/ripple).
- [x] Garantir hierarquia tipográfica (título, número, subtítulo) em 320px.

Critérios de aceitação (Dashboard / Cards):
- [x] Em 320px, todos os cards são visíveis sem scroll horizontal e sem áreas “fantasmas”.

### Resumo Rápido (Dashboard [Med].jpeg)
- [x] Reordenar: Resumo Rápido antes de Atividade Recente (mobile).
- [x] Exibir somente: Próximo evento, Próximo atendimento, Status do sistema.
- [x] Status com chip acessível (aria-label e contraste).

Critérios de aceitação (Dashboard / Resumo):
- [x] Estados vazios não quebram layout (“Nenhum evento agendado”, etc.).

### Atividade Recente (Dashboard (foot).jpeg)
- [x] Mobile: lista 1 coluna com quebra de linha segura.
- [x] Desktop: foco visível em linhas e ações.
- [x] Implementar paginação / “Ver mais” / scroll infinito (definir padrão único para o app).

Critérios de aceitação (Dashboard / Atividade):
- [x] Em 320px, nenhum texto crítico é truncado sem alternativa de visualização.
- [x] Loading/error/empty state presentes.

## Nossa História

- [x] Remover “Recarregar/Atualizar” (desktop e mobile), manter “Salvar” como ação primária.
- [x] Mobile: ação “Salvar” sticky (não coberta pelo teclado).
- [x] Validação: Título/Subtítulo obrigatórios; feedback inline + toast.

Critérios de aceitação (Nossa História):
- [x] Após salvar, dados persistidos aparecem ao recarregar a página sem “Atualizar” manual.

## Calendário Atendimento

### Cabeçalho / Filtros / Listagem (Calendario.jpeg)
- [x] Remover “Atualizar” (desktop e mobile).
- [x] Filtros colapsados em mobile (bottom sheet “Filtrar”); manter apenas “Buscar” inline.
- [x] Listagem mobile: Data, Tipo (bullet/ícone), Horário, Ativo/Inativo, Editar, Inativar.
- [x] Confirmar inativação (modal) para ação “Excluir”.
- [x] Paginação ou scroll infinito + loading/error/empty.

Critérios de aceitação (Calendário Atendimento):
- [x] Nenhum scroll horizontal em 320px.
- [x] Ação “Inativar” sempre pede confirmação e não remove registro definitivamente.

### Modal Novo Atendimento (IMG_6788.jpeg)
- [x] Full-screen dialog/bottom sheet com rolagem interna.
- [x] Rodapé de ações fixo e não coberto pelo teclado.
- [x] Validações: descrição obrigatória; data válida; início < fim; capacidade >= 0.

### Modal Editar Atendimento (IMG_6789.jpeg)
- [x] Mesmo padrão do “Novo atendimento”.
- [x] Snackbar de erro não cobre botões; mensagens em pt-BR (sem “Wednesday”).

## Eventos e Festas

### Listagem / Filtros (Evetos e Festas.jpeg)
- [x] Remover “Atualizar” (desktop e mobile); manter “Novo evento” como ação primária.
- [x] Filtros colapsados em mobile (bottom sheet).
- [x] Listagem mobile: Data, Título, Horário, Ativo/Inativo, Editar, Inativar.
- [x] Paginação/scroll infinito + loading/error/empty.

### Modal Novo Evento (IMG_6791.jpeg)
- [x] Full-screen dialog/bottom sheet.
- [x] Picker Tipo com toque 48×48dp.
- [x] Validação: Título e Data obrigatórios; horário início < fim.
- [x] Após salvar, atualizar lista automaticamente.

### Modal Editar Evento (IMG_6790.jpeg)
- [x] Mesmos padrões do “Novo evento”.
- [x] Validar URL da imagem (quando preenchida).

## Nossos Orixás (Orixas.jpeg)

- [x] Remover “Atualizar” (desktop e mobile); manter “Novo Orixá”.
- [x] Filtros colapsados em mobile.
- [x] Mobile: exibir somente colunas essenciais:
  - [x] Nome do Orixá
  - [x] bullet com Cor Principal
  - [x] Ativo/Inativo
  - [x] Editar (ícone)
  - [x] Inativar (ícone) + confirmação
- [x] Garantir ações 48×48dp e aria-label.
- [x] Paginação/scroll infinito + loading/error/empty.

## Guias e Entidades (Guias e Entidades.jpeg)

- [x] Remover “Atualizar” (desktop e mobile); manter “Novo cadastro”.
- [x] Filtros colapsados em mobile (bottom sheet).
- [x] Mobile: Nome, Especialidade principal (chip único), Ativo/Inativo, Editar, Inativar.
- [x] Chips longos truncam com “+N” e abrem detalhes em bottom sheet.
- [x] Paginação/scroll infinito + loading/error/empty.

## Linhas da Umbanda (Linhas da Umbanda.jpeg)

- [x] Filtros colapsados em mobile.
- [x] Mobile: Nome, Entidade principal (+N), Ativo/Inativo, Editar, Inativar + confirmação.
- [x] Formulários em full-screen dialog/bottom sheet com ações fixas.

## Orações e Pontos / Conteúdos Espirituais (Contudo Espiritual.jpeg)

- [x] “Atualizar” não deve ser botão destacado; remover ou substituir por ação discreta (quando necessário).
- [x] Filtros avançados colapsados em mobile.
- [x] Mobile: Título, Tipo, Destaque, Ativo/Inativo, Editar, Inativar + confirmação.
- [x] Editor/preview (se existir): full-screen com abas (Conteúdo/Metadados/Preview).

## Filhos da Casa (Filhos da Casa.jpeg)

- [x] Filtros colapsados em mobile (bottom sheet).
- [x] Mobile: Nome, Orixá principal (+N), Ativo/Inativo, Editar, Inativar + confirmação.
- [x] Formulário em etapas/abas (Dados pessoais/Endereço/Orixás).
- [x] Validações e máscaras (UF/telefone) com feedback inline.

## Doações e Contato (IMG_6792.jpeg, IMG_6793.jpeg, IMG_6794.jpeg)

### Formulário (Contato institucional + Doações e PIX)
- [x] Remover “Atualizar” (desktop e mobile); “Salvar” como ação primária.
- [x] Seções longas em acordeões.
- [x] “Salvar” sticky em mobile e não coberto pelo teclado.
- [x] Validações (email/telefone/whatsapp/cnpj) com feedback inline.

### Mensagens (listagem)
- [x] Filtros colapsados em mobile (Buscar + Status em bottom sheet).
- [x] Listagem mobile 1 coluna: Nome, Assunto, Status, Data, Visualizar/Editar.
- [x] Ações 48×48dp; menu kebab por linha para ações secundárias.
- [x] Loading/error/empty states.

## Meu Perfil (Perfil.jpeg)

- [x] Layout mobile: cards empilhados, reduzir espaços vazios.
- [x] Botão “Atualizar Perfil” full width + loading/disabled.
- [x] Validação: nome/e-mail obrigatórios; senha com regras claras (quando aplicável).
- [x] Acessibilidade: foco visível, aria-describedby para erros.

## Checklist de Teste (antes de concluir qualquer item)

- [ ] Mobile 320×568 (portrait): sem scroll horizontal; botões não cobertos pelo teclado.
- [ ] Mobile 360×800 / 390×844 / 414×896 (portrait): consistência de espaçamentos e tipografia.
- [ ] Tablet 768×1024 (portrait) e landscape: drawer e listas funcionam sem regressões.
- [ ] Desktop 1024×768 e 1280×800: foco visível; sem regressões de layout.
- [ ] Fluxos CRUD: criar/editar/inativar com confirmação e auto-refresh (sem botão “Atualizar”).
