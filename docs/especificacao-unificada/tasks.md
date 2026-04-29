# Batuara.net — Checklist de Implementação (UI/UX)

## Arquivo de entrada (para iniciar a sessão)

- Começar por: [index.json](./index.json)
- Em seguida:
  - [Spec desktop](./specs/desktop/spec-ui-ux-desktop.md)
  - (Histórico) Spec mobile arquivada em: [historico-mobile/specs/mobile/spec-ui-ux-mobile.md](./historico-mobile/specs/mobile/spec-ui-ux-mobile.md)

## Setup e navegação (comum)

- [x] Garantir que o menu tenha exatamente 13 itens (mesma lista em mobile e desktop).
- [x] Implementar âncoras/rotas estáveis para cada item do menu.
- [x] Garantir estado ativo do item selecionado no menu.
- [x] Garantir isolamento de seções (sem “vazamento” visual/semântico entre seções).
- [x] Garantir que botões flutuantes não interceptem cliques nem escondam controles essenciais (setas, chips, botões).

## Desktop

### Menu e ancoragem

- [x] Menu superior com os mesmos 13 itens do mobile.
- [x] Ao clicar em um item, cair no topo da seção/subseção correspondente.

### Nossa História + Nossa Missão (desktop)

- [ ] Consolidar “Nossa Missão” como subseção dentro de “Nossa História” (desktop).
- [ ] Criar âncora dedicada para “Nossa Missão” dentro da seção de História (para o item de menu).
- [ ] Garantir que “Missão” não seja duplicada de forma confusa (uma fonte de verdade).
- [ ] Garantir leitura coerente: História → bloco Missão → cards de valores (grid).

### Calendário Atendimento (desktop)

- [ ] Isolamento da seção (somente calendário).
- [ ] Alinhar comportamento ao mobile: legenda por tipo/cor + indicador por cor + clique mostra todos os eventos do dia.

### Eventos e Festas (desktop)

- [ ] Remover busca por texto.
- [ ] Manter filtros por chips.
- [ ] Grid consistente sem “buracos” ao filtrar.

### Orixás (desktop)

- [ ] Isolamento da seção.
- [ ] Borda do card com a cor do Orixá.
- [ ] Bullet/ícone herda a cor do Orixá, com consistência visual.

### Guias e Entidades (desktop)

- [ ] Isolamento da seção (não mostrar “Linhas da Umbanda” junto).
- [ ] Corrigir consumo da API (listar quando houver itens).
- [ ] Estado vazio amigável.

### Linhas da Umbanda (desktop)

- [ ] Isolamento da seção.
- [ ] Bordas respeitam as cores definidas nos cards.
- [ ] Setas/scroll/carrossel claros e sem conflito com elementos flutuantes.

### Orações (desktop)

- [ ] Isolamento da seção.

### Doações (desktop)

- [ ] Isolamento da seção.
- [ ] Corrigir “Contato” vazando/aparecendo dentro de Doações (âncoras/altura/espaçamento).

### Entre em Contato (desktop)

- [ ] Isolamento da seção.
- [ ] Formulário centralizado com grid/espaçamentos consistentes.

### Nossa Localização (desktop)

- [ ] Isolamento da seção.
- [ ] Mapa com dimensões equilibradas, sem cortar controles.

### Redes Sociais + Rodapé (desktop)

- [ ] Isolamento da seção (sem “Localização” vazando por cima).
- [ ] Clique em “Redes Sociais” leva ao topo do bloco correto.

## Histórico de alterações

### 2026-04-28 — Remoção de itens mobile do checklist

- Removido do arquivo: toda a seção "Mobile (prioridade)" e seus subtópicos, para manter este checklist focado apenas no Desktop.
- Itens removidos (com status no momento da remoção):
  - Regras gerais (mobile): 3 itens marcados como [x]
  - Início (mobile): 1 item marcado como [x]
  - Nossa História (mobile): 2 itens marcados como [x]
  - Nossa Missão (mobile): 4 itens marcados como [x]
  - Calendário Atendimento (mobile): 6 itens marcados como [x]
  - Eventos e Festas (mobile): 3 itens marcados como [x]
  - Orixás (mobile): 2 itens marcados como [x]
  - Guias e Entidades (mobile): 3 itens marcados como [x]
  - Linhas da Umbanda (mobile): 2 itens marcados como [x]
  - Orações (mobile): 1 item marcado como [ ]
  - Doações (mobile): 3 itens marcados como [ ]
  - Entre em Contato (mobile): 2 itens marcados como [ ]
  - Nossa Localização (mobile): 1 item marcado como [ ]
  - Redes Sociais (mobile): 2 itens marcados como [x]
