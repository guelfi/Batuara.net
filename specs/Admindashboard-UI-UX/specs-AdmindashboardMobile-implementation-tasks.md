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

- [ ] Padronizar alvos de toque (48×48dp) para ícones de ação, setas, botões e itens de lista (mobile).
- [ ] Garantir ausência de scroll horizontal em 320px para todas as rotas (mobile).
- [ ] Garantir estados loading/error/empty em todas as telas com dados remotos.
- [ ] Garantir acessibilidade mínima: contraste AA, foco visível (desktop), aria-label em ícones.
- [x] Remover botão “Atualizar” nas telas onde não agrega valor (desktop e mobile), seguindo regra: auto-refresh/pull-to-refresh.
  - [x] CalendarPage / EventsPage / OrixasPage / GuidesPage / UmbandaLinesPage / SpiritualContentPage / MembersPage / LocationPage / DonationsContactPage / HistoryPage

## Navegação / Drawer

- [ ] Drawer mobile: abrir pelo hambúrguer, fechar por overlay e manter foco inicial no primeiro item.
- [ ] Drawer desktop: fechar via ESC e manter navegação por Tab consistente.
- [ ] Garantir que o AppBar e o botão hambúrguer permaneçam acessíveis (48×48dp) em todas as rotas.

Critérios de aceitação (Navegação):
- [ ] Ao autenticar, rota padrão é Dashboard.
- [ ] Drawer não bloqueia scroll após fechar e não causa “layout shift” ao abrir/fechar.

## Dashboard

### Cards de métricas (Dashboard[Top].jpeg)
- [ ] Mobile: cards em 1 coluna full-width (remover “slots vazios”).
- [ ] Padronizar card clicável com affordance (chevron/ícone) + feedback (pressed/ripple).
- [ ] Garantir hierarquia tipográfica (título, número, subtítulo) em 320px.

Critérios de aceitação (Dashboard / Cards):
- [ ] Em 320px, todos os cards são visíveis sem scroll horizontal e sem áreas “fantasmas”.

### Resumo Rápido (Dashboard [Med].jpeg)
- [ ] Reordenar: Resumo Rápido antes de Atividade Recente (mobile).
- [ ] Exibir somente: Próximo evento, Próximo atendimento, Status do sistema.
- [ ] Status com chip acessível (aria-label e contraste).

Critérios de aceitação (Dashboard / Resumo):
- [ ] Estados vazios não quebram layout (“Nenhum evento agendado”, etc.).

### Atividade Recente (Dashboard (foot).jpeg)
- [ ] Mobile: lista 1 coluna com quebra de linha segura.
- [ ] Desktop: foco visível em linhas e ações.
- [ ] Implementar paginação / “Ver mais” / scroll infinito (definir padrão único para o app).

Critérios de aceitação (Dashboard / Atividade):
- [ ] Em 320px, nenhum texto crítico é truncado sem alternativa de visualização.
- [ ] Loading/error/empty state presentes.

## Nossa História

- [ ] Remover “Recarregar/Atualizar” (desktop e mobile), manter “Salvar” como ação primária.
- [ ] Mobile: ação “Salvar” sticky (não coberta pelo teclado).
- [ ] Validação: Título/Subtítulo obrigatórios; feedback inline + toast.

Critérios de aceitação (Nossa História):
- [ ] Após salvar, dados persistidos aparecem ao recarregar a página sem “Atualizar” manual.

## Calendário Atendimento

### Cabeçalho / Filtros / Listagem (Calendario.jpeg)
- [ ] Remover “Atualizar” (desktop e mobile).
- [ ] Filtros colapsados em mobile (bottom sheet “Filtrar”); manter apenas “Buscar” inline.
- [ ] Listagem mobile: Data, Tipo (bullet/ícone), Horário, Ativo/Inativo, Editar, Inativar.
- [ ] Confirmar inativação (modal) para ação “Excluir”.
- [ ] Paginação ou scroll infinito + loading/error/empty.

Critérios de aceitação (Calendário Atendimento):
- [ ] Nenhum scroll horizontal em 320px.
- [ ] Ação “Inativar” sempre pede confirmação e não remove registro definitivamente.

### Modal Novo Atendimento (IMG_6788.jpeg)
- [ ] Full-screen dialog/bottom sheet com rolagem interna.
- [ ] Rodapé de ações fixo e não coberto pelo teclado.
- [ ] Validações: descrição obrigatória; data válida; início < fim; capacidade >= 0.

### Modal Editar Atendimento (IMG_6789.jpeg)
- [ ] Mesmo padrão do “Novo atendimento”.
- [ ] Snackbar de erro não cobre botões; mensagens em pt-BR (sem “Wednesday”).

## Eventos e Festas

### Listagem / Filtros (Evetos e Festas.jpeg)
- [ ] Remover “Atualizar” (desktop e mobile); manter “Novo evento” como ação primária.
- [ ] Filtros colapsados em mobile (bottom sheet).
- [ ] Listagem mobile: Data, Título, Horário, Ativo/Inativo, Editar, Inativar.
- [ ] Paginação/scroll infinito + loading/error/empty.

### Modal Novo Evento (IMG_6791.jpeg)
- [ ] Full-screen dialog/bottom sheet.
- [ ] Picker Tipo com toque 48×48dp.
- [ ] Validação: Título e Data obrigatórios; horário início < fim.
- [ ] Após salvar, atualizar lista automaticamente.

### Modal Editar Evento (IMG_6790.jpeg)
- [ ] Mesmos padrões do “Novo evento”.
- [ ] Validar URL da imagem (quando preenchida).

## Nossos Orixás (Orixas.jpeg)

- [ ] Remover “Atualizar” (desktop e mobile); manter “Novo Orixá”.
- [ ] Filtros colapsados em mobile.
- [ ] Mobile: exibir somente colunas essenciais:
  - [ ] Nome do Orixá
  - [ ] bullet com Cor Principal
  - [ ] Ativo/Inativo
  - [ ] Editar (ícone)
  - [ ] Inativar (ícone) + confirmação
- [ ] Garantir ações 48×48dp e aria-label.
- [ ] Paginação/scroll infinito + loading/error/empty.

## Guias e Entidades (Guias e Entidades.jpeg)

- [ ] Remover “Atualizar” (desktop e mobile); manter “Novo cadastro”.
- [ ] Filtros colapsados em mobile (bottom sheet).
- [ ] Mobile: Nome, Especialidade principal (chip único), Ativo/Inativo, Editar, Inativar.
- [ ] Chips longos truncam com “+N” e abrem detalhes em bottom sheet.
- [ ] Paginação/scroll infinito + loading/error/empty.

## Linhas da Umbanda (Linhas da Umbanda.jpeg)

- [ ] Filtros colapsados em mobile.
- [ ] Mobile: Nome, Entidade principal (+N), Ativo/Inativo, Editar, Inativar + confirmação.
- [ ] Formulários em full-screen dialog/bottom sheet com ações fixas.

## Orações e Pontos / Conteúdos Espirituais (Contudo Espiritual.jpeg)

- [ ] “Atualizar” não deve ser botão destacado; remover ou substituir por ação discreta (quando necessário).
- [ ] Filtros avançados colapsados em mobile.
- [ ] Mobile: Título, Tipo, Destaque, Ativo/Inativo, Editar, Inativar + confirmação.
- [ ] Editor/preview (se existir): full-screen com abas (Conteúdo/Metadados/Preview).

## Filhos da Casa (Filhos da Casa.jpeg)

- [ ] Filtros colapsados em mobile (bottom sheet).
- [ ] Mobile: Nome, Orixá principal (+N), Ativo/Inativo, Editar, Inativar + confirmação.
- [ ] Formulário em etapas/abas (Dados pessoais/Endereço/Orixás).
- [ ] Validações e máscaras (UF/telefone) com feedback inline.

## Doações e Contato (IMG_6792.jpeg, IMG_6793.jpeg, IMG_6794.jpeg)

### Formulário (Contato institucional + Doações e PIX)
- [ ] Remover “Atualizar” (desktop e mobile); “Salvar” como ação primária.
- [ ] Seções longas em acordeões.
- [ ] “Salvar” sticky em mobile e não coberto pelo teclado.
- [ ] Validações (email/telefone/whatsapp/cnpj) com feedback inline.

### Mensagens (listagem)
- [ ] Filtros colapsados em mobile (Buscar + Status em bottom sheet).
- [ ] Listagem mobile 1 coluna: Nome, Assunto, Status, Data, Visualizar/Editar.
- [ ] Ações 48×48dp; menu kebab por linha para ações secundárias.
- [ ] Loading/error/empty states.

## Meu Perfil (Perfil.jpeg)

- [ ] Layout mobile: cards empilhados, reduzir espaços vazios.
- [ ] Botão “Atualizar Perfil” full width + loading/disabled.
- [ ] Validação: nome/e-mail obrigatórios; senha com regras claras (quando aplicável).
- [ ] Acessibilidade: foco visível, aria-describedby para erros.

## Checklist de Teste (antes de concluir qualquer item)

- [ ] Mobile 320×568 (portrait): sem scroll horizontal; botões não cobertos pelo teclado.
- [ ] Mobile 360×800 / 390×844 / 414×896 (portrait): consistência de espaçamentos e tipografia.
- [ ] Tablet 768×1024 (portrait) e landscape: drawer e listas funcionam sem regressões.
- [ ] Desktop 1024×768 e 1280×800: foco visível; sem regressões de layout.
- [ ] Fluxos CRUD: criar/editar/inativar com confirmação e auto-refresh (sem botão “Atualizar”).
