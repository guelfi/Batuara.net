# Fase E — Refinamento de Calendário e Gestão de Eventos

## Problemas Identificados
1. **Duplicidade:** Eventos como "Festa de Ogum" aparecem duplicados no calendário público quando cadastrados tanto em "Eventos" quanto em "Atendimentos".
2. **Navegação Admin:** A tela de "Calendário Atendimento" no AdminDashboard não possui navegação mensal, dificultando a gestão futura/passada.
3. **Restrição de Edição:** Eventos especiais (Festas, Cursos, Bazares) não devem ser editados via "Calendário Atendimento", apenas via "Eventos e Festas".
4. **UI/UX Público:** O calendário no PublicWebsite está cortando ou com visualização incompleta em alguns viewports.

## Mudanças Propostas

### 1. [MODIFY] [CalendarSection.tsx](file:///c:/Users/MarcoGuelfi/Projetos/Batuara.net/src/Frontend/PublicWebsite/src/components/sections/CalendarSection.tsx)
- Implementar lógica de de-duplicação no `useMemo`: se houver um Evento e um Atendimento na mesma data com o mesmo nome, manter apenas o Evento.
- Ajustar CSS para garantir que o calendário seja totalmente visível e responsivo (revisar paddings e maxWidth).

### 2. [MODIFY] [CalendarPage.tsx](file:///c:/Users/MarcoGuelfi/Projetos/Batuara.net/src/Frontend/AdminDashboard/src/pages/CalendarPage.tsx)
- Adicionar estado de `selectedMonthDate` para navegação mensal (mesma lógica do PublicWebsite).
- Atualizar `loadAttendances` para enviar filtros de `month` e `year`.
- No diálogo de edição, exibir uma mensagem de alerta e desabilitar o botão de salvar se o tipo for `Festa` ou `Curso`, orientando o usuário a usar a seção "Eventos e Festas".

### 3. [OCI] Deploy
- Executar build, push e merge para atualização na Oracle Cloud.

## Verificação
- Abrir o site público e validar que "Festa de Ogum" aparece apenas uma vez.
- Abrir o Admin, navegar entre os meses no Calendário e tentar editar uma "Festa".
