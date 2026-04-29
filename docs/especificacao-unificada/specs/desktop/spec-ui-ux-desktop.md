# Batuara.net (Desktop) — Spec / Prompt de Melhorias UI/UX

## Contexto e objetivo

Você vai ajustar o UI/UX do Batuara.net para a versão desktop, garantindo:

- Menu superior consistente com a versão mobile (mesmos itens).
- Cada item do menu navega para a seção correta (âncoras/rotas estáveis).
- Cada seção exibe apenas o seu próprio conteúdo (sem “vazamento” de outras seções).
- Componentes interativos (carrosséis, setas, botões e filtros) ficam sempre visíveis e clicáveis, sem sobreposição por elementos flutuantes.
- Layout responsivo em desktop (larguras grandes) com alinhamento, espaçamentos e hierarquia visual coerentes.
- Implementação deve seguir o princípio mobile first, sem degradar a experiência em desktop.

Referências:

- Spec mobile (mobile first — arquivado): [spec-ui-ux-mobile.md](../../historico-mobile/specs/mobile/spec-ui-ux-mobile.md)
- Imagens:
  - [captura-2026-04-26-175337.png](../../assets/desktop/inicio/captura-2026-04-26-175337.png) (Início)
  - [captura-2026-04-26-175352.png](../../assets/desktop/nossa-historia-missao/captura-2026-04-26-175352.png) (Nossa História + card Missão)
  - [captura-2026-04-26-175939.png](../../assets/desktop/nossa-historia-missao/captura-2026-04-26-175939.png) (Cards de valores)
  - [captura-2026-04-26-175421.png](../../assets/desktop/calendario-atendimento/captura-2026-04-26-175421.png) (Calendário)
  - [captura-2026-04-26-175455.png](../../assets/desktop/eventos-e-festas/captura-2026-04-26-175455.png) (Eventos e Festas)
  - [captura-2026-04-26-175509.png](../../assets/desktop/orixas/captura-2026-04-26-175509.png) (Orixás)
  - [bullet-orixas.png](../../assets/shared/ui/bullet-orixas.png) (ícone/bullet de referência)
  - [captura-2026-04-26-175522.png](../../assets/desktop/guias-e-entidades/captura-2026-04-26-175522.png) (Guias e Entidades / início de Linhas)
  - [captura-2026-04-26-175536.png](../../assets/desktop/linhas-da-umbanda/captura-2026-04-26-175536.png) (Linhas da Umbanda)
  - [captura-2026-04-26-175549.png](../../assets/desktop/oracoes/captura-2026-04-26-175549.png) (Orações)
  - [captura-2026-04-26-175604.png](../../assets/desktop/doacoes/captura-2026-04-26-175604.png) (Doações + “Contato” aparecendo embaixo)
  - [captura-2026-04-26-175624.png](../../assets/desktop/entre-em-contato/captura-2026-04-26-175624.png) (Entre em Contato)
  - [captura-2026-04-26-175637.png](../../assets/desktop/nossa-localizacao/captura-2026-04-26-175637.png) (Nossa Localização)
  - [captura-2026-04-26-175651.png](../../assets/desktop/redes-sociais-rodape/captura-2026-04-26-175651.png) (Redes sociais + rodapé, com “Localização” vazando)

## Regras gerais (desktop)

- Menu superior deve conter os mesmos itens do mobile.
- Ao navegar por um item do menu, o usuário deve cair no topo da seção correspondente.
- Cada seção deve isolar seu conteúdo visualmente e semanticamente (ex.: espaçamento/containers), evitando que o conteúdo da seção seguinte apareça “junto” quando não deveria.
- Elementos flutuantes (ex.: botões circulares no lado direito) não podem sobrepor conteúdo importante nem capturar cliques que deveriam ir para setas/botões/chips.
- Padronizar:
  - Largura máxima de conteúdo (container) para leitura confortável.
  - Grid para cards (2–4 colunas conforme largura).
  - Espaçamento vertical consistente entre seções (ex.: 64–96px).

## Menu (desktop e mobile)

O menu deve conter exatamente estes itens:

1. Início
2. Nossa História
3. Nossa Missão
4. Calendário Atendimento
5. Eventos e Festas
6. Orixás
7. Guias e Entidades
8. Linhas da Umbanda
9. Orações
10. Doações
11. Entre em Contato
12. Nossa Localização
13. Redes Sociais

Observação importante (desktop):

- Para manter equivalência funcional do menu entre mobile e desktop, o item “Nossa Missão” deve existir e navegar corretamente.
- É viável consolidar “Nossa Missão” dentro de “Nossa História” no desktop, desde que:
  - exista uma âncora dedicada para “Nossa Missão” dentro da seção de História;
  - o conteúdo de Missão não seja duplicado de forma confusa (uma única fonte de verdade);
  - a leitura do texto de História não seja interrompida de forma incoerente (ex.: Missão deve entrar como bloco destacado e/ou subseção com título próprio).

## Especificação por seção (o que ajustar)

### Início

- Referência: [captura-2026-04-26-175337.png](../../assets/desktop/inicio/captura-2026-04-26-175337.png)
- Ajuste:
  - Garantir que apenas conteúdo do Início esteja visível quando o usuário navega para “Início”.
  - No geral parece ok; manter sem mudanças funcionais.

### Nossa História

- Referências: [captura-2026-04-26-175352.png](../../assets/desktop/nossa-historia-missao/captura-2026-04-26-175352.png), [captura-2026-04-26-175939.png](../../assets/desktop/nossa-historia-missao/captura-2026-04-26-175939.png)
- Ajustes:
  - Esta área deve conter o texto de “Nossa História” e os cards de valores.
  - Consolidar “Nossa Missão” como subseção dentro desta área (desktop), com título “Nossa Missão” e âncora própria (para o item de menu “Nossa Missão”).
  - Evitar que componentes de outras seções (ex.: Calendário) apareçam antes do fim desta seção.
  - Recomenda-se o layout:
    - Bloco de texto de História com largura confortável (leitura).
    - Card “Missão” como bloco destacado ao lado (2 colunas) ou logo abaixo (1 coluna), mas sempre dentro da seção de História e acima dos cards de valores.
    - Cards de valores (Tradição, Caridade, Fraternidade, Espiritualidade) em grid abaixo.

### Nossa Missão

- Referências: [captura-2026-04-26-175352.png](../../assets/desktop/nossa-historia-missao/captura-2026-04-26-175352.png), [card Missão (mobile)](../../historico-mobile/assets/mobile/nossa-missao/captura-2026-04-26-172047.png)
- Ajustes:
  - Implementar como subseção dentro de “Nossa História” no desktop (âncora dedicada).
  - Garantir título claro “Nossa Missão” e o card “Missão” com o texto completo.
  - Os cards “Tradição”, “Caridade”, “Fraternidade”, “Espiritualidade” devem permanecer visíveis e alinhados em grid na mesma área (evitar duplicação do card “Missão” no grid, a menos que haja uma razão clara).
  - Navegação via menu deve levar exatamente ao topo dessa subseção (sem cair no meio de parágrafos).

### Calendário Atendimento

- Referência: [captura-2026-04-26-175421.png](../../assets/desktop/calendario-atendimento/captura-2026-04-26-175421.png)
- Ajustes:
  - Garantir que a seção exiba apenas o Calendário Atendimento.
  - A imagem parece conforme; manter UX atual, mas garantir isolamento da seção e consistência de espaçamentos.
  - Manter compatibilidade com o comportamento do mobile:
    - Legenda clara de tipos/cores.
    - Dias com eventos devem indicar o tipo por cor (borda/tag).
    - Clique em um dia deve mostrar todos os eventos daquela data (suporta múltiplos eventos no mesmo dia).

### Eventos e Festas

- Referência: [captura-2026-04-26-175455.png](../../assets/desktop/eventos-e-festas/captura-2026-04-26-175455.png)
- Ajustes:
  - Remover a busca por texto (“Buscar eventos…”).
  - Manter apenas filtros por chips (Todos, Festa, Evento, Celebração, Bazar, Palestra, etc.).
  - Garantir que o layout dos cards não tenha “buracos” estranhos quando filtros mudam (grid consistente).

### Orixás

- Referências: [captura-2026-04-26-175509.png](../../assets/desktop/orixas/captura-2026-04-26-175509.png), [bullet-orixas.png](../../assets/shared/ui/bullet-orixas.png)
- Ajustes:
  - Garantir que apenas conteúdo de Orixás apareça nesta seção.
  - Cards de Orixás:
    - A borda do card deve usar a cor do Orixá (a mesma cor descrita/indicada no próprio card).
    - O “bullet”/ícone decorativo (como o da referência) deve herdar a cor do Orixá.
  - Manter consistência: mesma espessura de borda, mesmo raio, mesma hierarquia tipográfica.

### Guias e Entidades

- Referência: [captura-2026-04-26-175522.png](../../assets/desktop/guias-e-entidades/captura-2026-04-26-175522.png)
- Ajustes:
  - Garantir que apenas conteúdo de “Guias e Entidades” apareça nesta seção (hoje “Linhas da Umbanda” aparece logo abaixo).
  - Corrigir carregamento de dados: atualmente não puxa informações da API (o endpoint supostamente existe).
  - Cards:
    - A borda do card deve usar a cor associada ao Guia/Entidade (a indicada/descritiva no card).
    - Manter consistência de layout (grid) e estado vazio (mensagem amigável quando não houver itens).

### Linhas da Umbanda

- Referência: [captura-2026-04-26-175536.png](../../assets/desktop/linhas-da-umbanda/captura-2026-04-26-175536.png)
- Ajustes:
  - Garantir que apenas conteúdo de “Linhas da Umbanda” apareça nesta seção.
  - Ajustar cores das bordas:
    - A cor da borda deve respeitar a cor indicada no card (por linha/guia/entidade, conforme regra do site).
  - Garantir que o carrossel/listagem tenha:
    - Setas/scroll visíveis e óbvios em desktop.
    - Sem conflito com botões flutuantes (se existirem).

### Orações

- Referência: [captura-2026-04-26-175549.png](../../assets/desktop/oracoes/captura-2026-04-26-175549.png)
- Ajustes:
  - Garantir que apenas conteúdo de “Orações e Preces” apareça nesta seção.
  - A imagem parece conforme; manter UX, apenas reforçar isolamento da seção e consistência de espaçamento.

### Doações

- Referência: [captura-2026-04-26-175604.png](../../assets/desktop/doacoes/captura-2026-04-26-175604.png)
- Ajustes:
  - Garantir que apenas conteúdo de “Doações” apareça nesta seção.
  - Corrigir o problema de “Contato” estourando/aparecendo na parte inferior dentro da seção de Doações:
    - Ajustar altura, espaçamento entre seções e/ou âncoras para que “Contato” só apareça quando o usuário navegar/rolar até a seção “Entre em Contato”.

### Entre em Contato

- Referência: [captura-2026-04-26-175624.png](../../assets/desktop/entre-em-contato/captura-2026-04-26-175624.png)
- Ajustes:
  - Garantir que apenas conteúdo de contato apareça nesta seção.
  - Layout do formulário: manter centralizado, com grid e espaçamentos consistentes.

### Nossa Localização

- Referência: [captura-2026-04-26-175637.png](../../assets/desktop/nossa-localizacao/captura-2026-04-26-175637.png)
- Ajustes:
  - Garantir que apenas conteúdo de Localização apareça nesta seção.
  - Mapa deve ficar com largura/altura equilibradas e sem cortar controles importantes do Google Maps.

### Redes Sociais + Rodapé

- Referência: [captura-2026-04-26-175651.png](../../assets/desktop/redes-sociais-rodape/captura-2026-04-26-175651.png)
- Ajustes:
  - Esta seção deve conter apenas conteúdo de Redes Sociais e rodapé.
  - Corrigir o “vazamento” de conteúdo da seção Localização aparecendo na parte superior.
  - Garantir que ao clicar em “Redes Sociais” no menu, o usuário cai no topo do bloco de redes/rodapé, sem sobras de mapa.

## Critérios de aceite (checklist)

- Menu desktop contém os mesmos 13 itens do mobile e todos navegam corretamente.
- Cada seção apresenta apenas o conteúdo da seção (sem vazamento).
- Eventos e Festas: sem busca por texto; filtros via chips funcionando.
- Orixás: bordas e bullets com cor do Orixá (consistente em todos os cards).
- Guias e Entidades: carrega dados via API quando houver; estado vazio adequado.
- Linhas da Umbanda: bordas respeitam as cores definidas nos cards; navegação/scroll/carrossel claros.
- Doações: seção “Contato” não invade a área de Doações.
- Redes Sociais + Rodapé: não há “Localização” vazando por cima.
