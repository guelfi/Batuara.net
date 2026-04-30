# Specs AdminDashboard (Mobile-first)

## Objetivo

Garantir uma experiência mobile-first no AdminDashboard (320–768px), sem regressões na experiência desktop, e aplicar melhorias desktop quando fizer sentido (com foco inicial em remover o botão “Atualizar”, substituindo por atualização automática/pull-to-refresh e recarregamento orientado a eventos).

## Estratégia de Branching

- Branch de produção (referência OCI): master
- Branch dedicada deste desenvolvimento: feature/admindashboard-mobile-first
- Todo desenvolvimento ocorre na branch dedicada; master permanece estável e só recebe mudanças via PR após validação.

## Regras Gerais (Mobile + Desktop)

- Não iniciar codificação a partir deste arquivo sem checklist de tasks associado e revisão do impacto em desktop.
- “Atualizar” (refresh manual) deve ser removido onde não agrega valor; preferir:
  - auto-refresh após operações CRUD (criar/editar/inativar),
  - pull-to-refresh no mobile quando houver lista,
  - revalidação automática ao voltar de um modal,
  - fallback: ação de recarregar discreta (ícone) apenas quando necessário.
- Ações destrutivas: “Excluir” deve significar inativação lógica (soft delete), sempre com modal de confirmação explícito.
- Alvos de toque: mínimo 48×48dp (botões, ícones de ação, itens de lista, setas de navegação).
- Listas e grids no mobile: exibir apenas informações essenciais + ações (editar/inativar), evitando scroll horizontal.
- Estados obrigatórios em todas as telas com dados remotos:
  - loading (skeleton/spinner),
  - empty state,
  - error state com retry.
- Acessibilidade:
  - contraste AA,
  - foco visível,
  - aria-label em ícones sem texto,
  - suporte consistente a teclado no desktop.

Menu: Dashboard
Imagem: Admindashboard [menu].jpg
Descrição:
- Priorizar este item como fluxo principal no mobile (primeira opção e rota padrão pós-login).
- Menu lateral (drawer) deve abrir/fechar com gesto/toque; foco inicial no primeiro item; fechamento com ESC/overlay.
- Manter o botão hambúrguer sempre visível no AppBar; garantir área de toque mínima 48×48dp.
- Evitar ações redundantes no topo (ex.: “Atualizar”); preferir auto-refresh após salvar e/ou pull-to-refresh.
- Testar viewport 320–768px (portrait/landscape) garantindo leitura sem zoom.
- CA: Ao autenticar, o usuário cai no Dashboard por padrão (mobile e desktop).
- CA: O drawer abre com toque no hambúrguer e fecha ao tocar no overlay; no desktop, fecha também via ESC.
- CA: Nenhum elemento interativo principal fica abaixo de 48×48dp em mobile.

Menu: Dashboard
Imagem: Dashboard[Top].jpeg
Descrição:
- Cards de métricas devem virar layout 1 coluna no mobile (full width), sem “slots vazios” (áreas destacadas em vermelho).
- Priorizar métricas: Eventos, Atendimentos, Filhos da Casa e Atividade; cada card com título, número e subtítulo em 2–3 linhas no máximo.
- Espaçamentos: reduzir padding interno do card em mobile e aumentar a densidade visual sem comprometer legibilidade (line-height consistente).
- Cards devem ser clicáveis com ripple/feedback, mas com affordance clara (ícone/chevron) e área de toque 48×48dp.
- Acessibilidade: contraste AA (texto vs fundo), estados de foco visível nos cards.
- CA: Em 320px, todos os cards do topo aparecem em 1 coluna, sem áreas em branco “fantasmas” e sem scroll horizontal.
- CA: Card clicável fornece feedback (hover no desktop, ripple/pressed no mobile) e mantém foco visível.

Menu: Dashboard
Imagem: Dashboard [Med].jpeg
Descrição:
- Reordenar conteúdo: “Resumo Rápido” deve aparecer antes da lista de “Atividade Recente” (seta indica foco no resumo).
- “Resumo Rápido” deve mostrar apenas itens essenciais: Próximo evento, Próximo atendimento, Status do sistema.
- Chip de status (Online/Offline) deve ter contraste e texto acessível (aria-label com estado).
- Em mobile, limitar “Atividade Recente” com paginação/infinite scroll e botão “Ver mais” se necessário.
- Loading/error: skeleton para cards e lista; estado vazio com mensagem objetiva.
- CA: “Resumo Rápido” aparece antes de “Atividade Recente” em mobile.
- CA: Quando não houver próximo evento/atendimento, exibir estado vazio (“Nenhum evento agendado”) sem quebrar layout.

Menu: Dashboard
Imagem: Dashboard (foot).jpeg
Descrição:
- Lista “Atividade Recente” deve ser responsiva: 1 coluna, espaçamento vertical consistente e tipografia com hierarquia clara.
- Itens de atividade devem suportar quebra de linha sem truncar informações críticas (tipo + título + data/hora).
- Filtros de atividade (se existirem) devem ficar colapsados em mobile (bottom sheet/accordion) para não empurrar a lista.
- Acessibilidade: navegação por teclado (Tab) e foco visível nas linhas/ações.
- CA: Itens de atividade nunca sobrepõem texto/ícones ao quebrar linhas em 320px.
- CA: No desktop, navegação por Tab percorre itens e ações com foco visível.

Menu: Nossa História
Imagem: NossaHistoria.jpeg
Descrição:
- Remover/evitar ação redundante de “Recarregar/Atualizar” no mobile (imagem indica despriorização); manter apenas “Salvar” como ação primária.
- “Salvar” deve ficar em posição de destaque (botão primário no topo) e também como ação fixa (sticky) no rodapé quando teclado estiver aberto.
- Campos (Título, Subtítulo, Missão da casa) em uma coluna; ajustar altura do textarea para leitura/edição confortável.
- Feedback: snackbar/toast de sucesso/erro com texto claro e sem cobrir botões.
- Validação: obrigatoriedade de Título/Subtítulo e limites de tamanho com contadores (quando aplicável).
- CA: Botão “Atualizar/Recarregar” não aparece no desktop e no mobile nesta tela.
- CA: Ao salvar com sucesso, exibir feedback e refletir os dados persistidos ao recarregar a página.

Menu: Calendário Atendimento
Imagem: Calendario.jpeg
Descrição:
- Cabeçalho de navegação por mês (Abril de 2026) deve ocupar a largura disponível; setas de mês com área de toque 48×48dp.
- Remover/evitar botão “Atualizar” no mobile (imagem riscada) e no desktop; aplicar auto-refresh após ações e pull-to-refresh.
- Filtros (Buscar/Tipo/Status/Inscrição) devem ficar colapsados por padrão (bottom sheet “Filtrar”); exibir somente “Buscar” inline.
- Listagem deve mostrar colunas essenciais em mobile: Data, Tipo (como bullet/ícone), Horário, Ativo/Inativo, Editar, Excluir.
- Excluir deve ser inativação lógica com modal de confirmação claro (texto: “Inativar atendimento?” + consequência).
- Paginação/infinite scroll; estados de loading/error e vazio (“Nenhum atendimento encontrado”).
- CA: Em 320px, a listagem não tem scroll horizontal e mantém ações (editar/inativar) acessíveis (48×48dp).
- CA: “Excluir” sempre abre confirmação e resulta em inativação lógica (registro permanece consultável/recuperável).

Menu: Calendário Atendimento
Imagem: IMG_6788.jpeg
Descrição:
- Modal “Novo atendimento” deve ser full-screen dialog ou bottom sheet com rolagem interna; ações fixas no rodapé.
- Campos em uma coluna com espaçamento compacto; inputs de Data/Hora devem abrir picker nativo-friendly.
- Botões “Cancelar” e “Criar atendimento” não podem ficar cobertos pelo teclado; aplicar safe-area e ajuste de viewport.
- Validação: descrição obrigatória, data válida, início < fim, capacidade numérica >= 0; mensagens inline + snackbar.
- Acessibilidade: labels associados aos campos, ordem de tab correta, foco inicial no primeiro campo.
- CA: Em 320px, o rodapé de ações do modal permanece visível (não coberto pelo teclado).
- CA: Erros de validação aparecem junto ao campo e não apenas em toast.

Menu: Calendário Atendimento
Imagem: IMG_6789.jpeg
Descrição:
- Modal “Editar atendimento” deve manter o mesmo comportamento do “Novo atendimento”.
- Snackbar de erro não deve sobrepor ações do modal; posicionar acima do rodapé fixo.
- Mensagens de validação devem ser localizadas (“Wednesday” → “quarta-feira”) e consistentes com o idioma da UI.
- Em erro, destacar campo(s) relacionados e oferecer orientação (“Selecione um dia permitido”).
- CA: Mensagens de erro aparecem em pt-BR e não cobrem botões do modal.

Menu: Eventos e Festas
Imagem: Evetos e Festas.jpeg
Descrição:
- Remover/evitar botão “Atualizar” no mobile (imagem riscada) e no desktop; manter “Novo evento” como ação primária.
- Filtros (Buscar/Tipo/Status/De/Até) devem ser colapsados por padrão (bottom sheet “Filtrar”).
- Listagem em mobile com colunas essenciais: Data, Título, Horário, Ativo/Inativo, Editar, Excluir.
- Excluir deve ser inativação lógica com modal de confirmação.
- Paginação/infinite scroll; loading/error; suporte a ordenação simples (mais recentes primeiro).
- CA: “Novo evento” é a ação primária e permanece acessível em 320px.

Menu: Eventos e Festas
Imagem: IMG_6791.jpeg
Descrição:
- Modal “Novo evento” deve ser full-screen dialog/bottom sheet; picker de Tipo com lista rolável e toque 48×48dp.
- Campos: Título e Data obrigatórios; horários opcionais mas validados (início < fim).
- Ao salvar, fechar modal e atualizar listagem automaticamente; feedback de sucesso.
- Acessibilidade: foco preso no modal (focus trap), botão de fechar acessível.
- CA: Após salvar, o novo item aparece na lista sem exigir “Atualizar” manual.

Menu: Eventos e Festas
Imagem: IMG_6790.jpeg
Descrição:
- Modal “Editar evento” deve seguir os mesmos padrões do “Novo evento”.
- Campos longos (Descrição) com altura mínima adequada e contagem de caracteres se necessário.
- Campo “URL da imagem” com validação (URL) e preview opcional (somente visual; sem carregar automaticamente se impactar performance).
- CA: Campo URL inválido impede salvar e exibe mensagem clara.

Menu: Nossos Orixás
Imagem: Orixas.jpeg
Descrição:
- Remover/evitar “Atualizar” no mobile (imagem riscada) e no desktop; manter “Novo Orixá” como ação primária.
- Filtros devem ser colapsados por padrão (mostrar apenas “Buscar”).
- Grid/listagem (mobile): exibir somente colunas essenciais:
  - Nome do Orixá
  - bullet com Cor Principal
  - indicador Ativo/Inativo
  - ícone de Edição
  - ícone de Exclusão
- Excluir = inativação lógica (não remover registro); modal de confirmação claro antes de executar.
- Ações de editar/excluir com área mínima 48×48dp; ícones com tooltip/aria-label.
- Paginação/infinite scroll; estados de loading/error; manter performance em listas longas.
- CA: Em mobile, a listagem mostra somente os campos essenciais (Nome + Cor Principal + Ativo/Inativo + Editar + Inativar).

Menu: Guias e Entidades
Imagem: Guias e Entidades.jpeg
Descrição:
- Remover/evitar “Atualizar” no mobile (imagem riscada) e no desktop; manter “Novo cadastro” como ação primária.
- Filtros (Buscar/Especialidade/Status) colapsados por padrão; abrir via bottom sheet.
- Listagem (mobile): exibir colunas essenciais: Nome, Especialidade principal (bullet/chip único), Ativo/Inativo, Editar, Excluir.
- Chips de especialidades devem truncar com “+N” e abrir detalhe em bottom sheet ao tocar.
- Excluir = inativação lógica com confirmação.
- Acessibilidade: chips com contraste e leitura por leitor de tela (aria-label com lista completa).
- CA: Em mobile, chips longos não quebram layout; “+N” abre detalhes.

Menu: Linhas da Umbanda
Imagem: Linhas da Umbanda.jpeg
Descrição:
- Filtros devem ser colapsados em mobile; manter apenas “Buscar” visível inicialmente.
- Listagem (mobile): Nome da linha, entidade principal (ou “+N”), Ativo/Inativo, Editar, Excluir.
- Excluir = inativação lógica com confirmação.
- Formulários de criação/edição em full-screen dialog/bottom sheet, com ações fixas no rodapé.
- Acessibilidade: campos obrigatórios com indicação clara e mensagens inline.
- CA: Nenhuma coluna extra aparece no mobile além do essencial; sem scroll horizontal.

Menu: Orações e Pontos
Imagem: Contudo Espiritual.jpeg
Descrição:
- Esta tela aparece como “Conteúdos Espirituais”; no mobile, priorizar leitura da listagem e esconder filtros avançados por padrão.
- Ação primária: “Novo conteúdo” (manter destaque); “Atualizar” pode virar ícone no AppBar ou ser removido.
- Listagem (mobile): Título, Tipo (oração/ponto/ensinamento), Destaque (badge), Ativo/Inativo, Editar, Excluir.
- Excluir = inativação lógica com confirmação.
- Editor/preview (se existir) deve abrir em full-screen com navegação por abas (“Conteúdo”, “Metadados”, “Preview”) para evitar rolagens longas.
- CA: “Atualizar” não aparece como botão destacado; atualização acontece após salvar/voltar do modal.

Menu: Filhos da Casa
Imagem: Filhos da Casa.jpeg
Descrição:
- Filtros (Buscar/Cidade/UF/Status) colapsados por padrão; abrir via bottom sheet.
- Listagem (mobile): Nome, Orixá(s) (bullet principal + “+N”), Ativo/Inativo, Editar, Excluir.
- Excluir = inativação lógica com confirmação; deixar claro que “inativar” não remove histórico.
- Formulários: agrupar em etapas/abas (Dados pessoais, Endereço, Orixás) para reduzir altura e facilitar mobile-first.
- Acessibilidade: máscara e validação de telefone/UF; feedback visual imediato.
- CA: Formulário em mobile não exige rolagem excessiva sem organização (etapas/abas).

Menu: Doações e Contato
Imagem: IMG_6792.jpeg
Descrição:
- Remover/evitar botão “Atualizar” no mobile (imagem riscada) e no desktop; manter “Salvar” como ação primária.
- Seções longas devem virar acordeões (Contato institucional / Doações e PIX / Mensagens) para reduzir rolagem.
- “Salvar” deve ser sticky no rodapé quando formulário estiver longo; desabilitar enquanto inválido.
- Validação e feedback: destacar campos inválidos; mostrar mensagem clara (ex.: e-mail/telefone/whatsapp).
- Acessibilidade: labels sempre visíveis, não depender apenas de placeholder.
- CA: Sem botão “Atualizar”; salvar reflete dados imediatamente.

Menu: Doações e Contato
Imagem: IMG_6793.jpeg
Descrição:
- Seção “Doações e PIX” deve ser reorganizada em mobile:
  - Campos essenciais primeiro (Chave PIX, Favorecido, Banco)
  - Campos secundários em acordeão (“Detalhes bancários”).
- Campo CNPJ com máscara e validação; feedback inline.
- Texto informativo (alert) não deve empurrar excessivamente a tela; permitir colapsar/expandir.
- CA: Campos essenciais ficam acessíveis sem rolagem excessiva em 320px.

Menu: Doações e Contato
Imagem: IMG_6794.jpeg
Descrição:
- Listagem de mensagens deve ser mobile-first:
  - Filtros colapsados (Buscar mensagem + Status em bottom sheet).
  - Listagem em 1 coluna com campos essenciais: Nome, Assunto, Status, Data, Editar/Visualizar.
- Ações com área mínima 48×48dp; menu “kebab” (⋮) por linha para ações secundárias.
- Estados: loading (skeleton), error (retry), vazio (mensagem).
- Qualquer ação destrutiva deve exigir confirmação; se houver exclusão, aplicar inativação lógica.
- CA: Em mobile, a tabela vira lista e não há scroll horizontal.

Menu: Meu Perfil
Imagem: Perfil.jpeg
Descrição:
- Cards “Informações Pessoais” e “Alterar Senha” devem ser empilhados com largura total; reduzir espaços em branco.
- Botão “Atualizar Perfil” deve ser full width no mobile e com estado loading/disabled.
- Validação: e-mail e nome obrigatórios; senha com regras claras e checklist (mínimo, maiúscula, número etc. se aplicável).
- Acessibilidade: foco visível, suporte a leitor de tela (aria-describedby nas mensagens de erro), contraste AA.
- CA: Botões e inputs permanecem utilizáveis em 320px, com teclado aberto, sem sobreposição.

## Processo de Teste (obrigatório antes de marcar qualquer item como concluído)

- Viewports: 320×568, 360×800, 390×844, 414×896, 768×1024 (portrait) + landscape equivalente.
- Desktop: 1024×768 e 1280×800 (mínimo) para garantir ausência de regressões.
- Interações críticas:
  - drawer abre/fecha e não “trava” o scroll,
  - modais não ficam com botões cobertos pelo teclado,
  - ações editar/inativar sempre com área 48×48dp,
  - confirmação obrigatória antes de inativar.
- Estados:
  - loading (skeleton/spinner),
  - error (mensagem + retry),
  - empty state.
- Acessibilidade:
  - foco visível no desktop,
  - aria-label em ícones,
  - contraste AA nas tags/chips/status.

