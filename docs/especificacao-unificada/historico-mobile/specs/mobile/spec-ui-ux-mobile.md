# Batuara.net (Mobile) — Spec / Prompt de Melhorias UI/UX

## Contexto e objetivo

Você vai ajustar o UI/UX do Batuara.net para dispositivos mobile, garantindo:

- Navegação consistente e clara via menu hambúrguer.
- Cada opção do menu corresponde a uma seção/página mobile que ocupa 100% do canvas (viewport).
- Nenhuma seção “invade” o canvas da seção selecionada.
- Ainda assim, o site em mobile deve permitir navegação por rolagem para acessar todas as seções (experiência de “página única” com seções).
- As opções de menu devem manter equivalência funcional entre mobile e desktop (mesmas entradas e comportamento de navegação).
- A seção “Nossa Missão” deve existir como seção dedicada no mobile (não deve ser comprimida/aninhada dentro de “Nossa História”).
- No desktop, “Nossa Missão” pode ser uma subseção dentro de “Nossa História”, desde que o item de menu “Nossa Missão” navegue diretamente para uma âncora dedicada e o conteúdo não seja duplicado de forma confusa.

Referências:

- Imagens:
  - [inicio.jpeg](../../assets/mobile/inicio/inicio.jpeg) (Início)
  - [nossa-historia.jpeg](../../assets/mobile/nossa-historia/nossa-historia.jpeg) (Nossa História)
  - [nossa-missao-cards.jpeg](../../assets/mobile/nossa-missao/nossa-missao-cards.jpeg) (Nossa Missão — cards)
  - [captura-2026-04-26-172047.png](../../assets/mobile/nossa-missao/captura-2026-04-26-172047.png) (Card “Missão”)
  - [captura-2026-04-26-180716.png](../../assets/mobile/nossa-missao/captura-2026-04-26-180716.png)
  - [calendario-atendimento.jpeg](../../assets/mobile/calendario-atendimento/calendario-atendimento.jpeg) (Calendário Atendimento)
  - [eventos-e-festas.jpeg](../../assets/mobile/eventos-e-festas/eventos-e-festas.jpeg) (Eventos e Festas)
  - [orixas.jpeg](../../assets/mobile/orixas/orixas.jpeg) (Orixás)
  - [guias-e-entidades.jpeg](../../assets/mobile/guias-e-entidades/guias-e-entidades.jpeg) (Guias e Entidades)
  - [linhas-da-umbanda.jpeg](../../assets/mobile/linhas-da-umbanda/linhas-da-umbanda.jpeg) (Linhas da Umbanda)
  - [oracoes.jpeg](../../assets/mobile/oracoes/oracoes.jpeg) (Orações)
  - [doacoes-1.jpeg](../../assets/mobile/doacoes/doacoes-1.jpeg) (Doações)
  - [doacoes-2.jpeg](../../assets/mobile/doacoes/doacoes-2.jpeg) (Doações — cards)
  - [entre-em-contato.jpeg](../../assets/mobile/entre-em-contato/entre-em-contato.jpeg) (Entre em Contato)
  - [nossa-localizacao.jpeg](../../assets/mobile/nossa-localizacao/nossa-localizacao.jpeg) (Localização)
  - [redes-sociais.jpeg](../../assets/mobile/redes-sociais/redes-sociais.jpeg) (Redes Sociais)

## Regras gerais (mobile)

- Cada item do menu deve levar a uma seção/página cujo conteúdo principal ocupe 100% do viewport do dispositivo (ex.: 100vh), com padding adequado.
- Evitar que conteúdos de outras seções “apareçam” abaixo/atrás ou acima do conteúdo atual quando o usuário está em uma seção específica.
- Manter rolagem vertical para navegação entre as seções.
- Todo componente de navegação flutuante (botões circulares no lado direito) não pode sobrepor/interferir em controles essenciais (setas de carrossel, botões “Mais Informações”, filtros).
- Ajustar camadas (z-index), áreas de toque e espaçamentos para evitar elementos “escondidos” ou tocáveis por engano.

## Menu de navegação (mobile e desktop)

Recriar a navegação para conter exatamente estas opções (mesmos itens no desktop). No mobile, o padrão é menu hambúrguer; no desktop, o padrão é menu superior. Em ambos, os itens e o destino devem ser equivalentes.

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

Comportamento:

- Ao selecionar um item, navegar diretamente para a seção correspondente.
- O destaque do item selecionado deve ficar claro (estado ativo).
- As seções devem ter âncoras/rotas estáveis para link direto.

## Especificação por seção (o que ajustar)

### Início

- Referência: [inicio.jpeg](../../assets/mobile/inicio/inicio.jpeg)
- Comportamento: já está ok, sem alteração funcional. Manter 100% do canvas.

### Nossa História

- Referência: [nossa-historia.jpeg](../../assets/mobile/nossa-historia/nossa-historia.jpeg)
- Ajustes:
  - Remover o card “Missão” desta seção.
  - Manter somente o conteúdo de “Nossa História” nesta seção.

### Nossa Missão

- Referências: [nossa-missao-cards.jpeg](../../assets/mobile/nossa-missao/nossa-missao-cards.jpeg), [captura-2026-04-26-172047.png](../../assets/mobile/nossa-missao/captura-2026-04-26-172047.png)
- Ajustes:
  - Exibir o card “Missão” nesta seção.
  - Exibir também os cards: “Tradição”, “Caridade”, “Fraternidade”, “Espiritualidade”.
  - Os 5 cards devem ser distribuídos de forma que todos sejam apresentados no canvas do mobile (sem depender de carrossel que esconda cards).

### Calendário Atendimento

- Referência: [calendario-atendimento.jpeg](../../assets/mobile/calendario-atendimento/calendario-atendimento.jpeg)
- Ajustes de layout:
  - Diminuir o espaçamento vertical entre o título do mês (“Abril de 2026”) e o componente do calendário.
  - A linha “Informações Importantes: …” não pode ficar truncada; permitir quebra em duas linhas quando necessário para mostrar a mensagem completa.
- Ajustes de conteúdo/legenda:
  - Inserir bullets/legenda de tipos com cores:
    - Giras (Azul)
    - Kardec (Verde)
    - Festas (Vermelho)
    - Bazares (Laranja)
    - Cursos (Roxo)
- Ajustes de interação:
  - No calendário, o dia com evento deve indicar:
    - Borda na cor do tipo de evento.
    - Texto/etiqueta indicando o tipo (ex.: “Gira”, “Kardec”, “Festa”, “Bazar”, “Curso”).
  - Ao tocar em um dia, abrir um card/modal/lista com os eventos daquela data (pode haver mais de um evento na mesma data).
- Regra importante:
  - Nesta tela, devem aparecer somente informações do Calendário de Eventos (não misturar com outras seções do site).

### Eventos e Festas

- Referência: [eventos-e-festas.jpeg](../../assets/mobile/eventos-e-festas/eventos-e-festas.jpeg)
- Ajustes:
  - Remover a busca por descrição (“Buscar eventos…”).
  - Manter apenas os chips de filtro por tipo (ex.: Festa, Evento, Celebração, Bazar, Palestra).
  - Corrigir sobreposição: as setas de navegação dos eventos não podem ficar escondidas atrás dos botões flutuantes de navegação do site (ajustar layout/z-index/posicionamento).

### Orixás

- Referência: [orixas.jpeg](../../assets/mobile/orixas/orixas.jpeg)
- Ajustes:
  - Garantir que somente conteúdo de “Orixás” apareça na seção (sem vazamento de outras seções).
  - Corrigir sobreposição das setas/controles de navegação do carrossel (não podem ficar atrás dos botões flutuantes).

### Guias e Entidades

- Referência: [guias-e-entidades.jpeg](../../assets/mobile/guias-e-entidades/guias-e-entidades.jpeg)
- Ajustes:
  - Garantir que somente conteúdo de “Guias e Entidades” apareça na seção (sem vazamento de outras seções).
  - Corrigir sobreposição das setas/controles (mesmo problema de camadas).
  - Corrigir carregamento de dados: “não está puxando as informações da API”. Ajustar o consumo da API para listar guias/entidades quando existirem.

### Linhas da Umbanda

- Referência: [linhas-da-umbanda.jpeg](../../assets/mobile/linhas-da-umbanda/linhas-da-umbanda.jpeg)
- Ajustes:
  - Garantir que somente conteúdo de “Linhas da Umbanda” apareça na seção.
  - Corrigir sobreposição das setas/controles do carrossel (não podem ficar atrás dos botões flutuantes).

### Orações

- Referência: [oracoes.jpeg](../../assets/mobile/oracoes/oracoes.jpeg)
- Ajustes:
  - Garantir que somente conteúdo de “Orações e Preces” apareça na seção.

### Doações

- Referências: [doacoes-1.jpeg](../../assets/mobile/doacoes/doacoes-1.jpeg), [doacoes-2.jpeg](../../assets/mobile/doacoes/doacoes-2.jpeg)
- Ajustes:
  - Botões “Doação via PIX” e “Falar com a Casa” devem ficar lado a lado (em uma linha) no mobile, com boa área de toque.
  - As informações/cards “Assistência Espiritual”, “Ações Sociais”, “Transparência” devem aparecer nesta mesma opção de navegação (seção Doações), compondo o conteúdo desta seção.
  - Garantir que somente conteúdo de Doações apareça nesta seção.

### Entre em Contato

- Referência: [entre-em-contato.jpeg](../../assets/mobile/entre-em-contato/entre-em-contato.jpeg)
- Ajustes:
  - Garantir que somente conteúdo de contato apareça nesta seção.
  - Aparência atual parece ok; focar em manter consistência de layout (100% canvas) e evitar sobreposição por botões flutuantes.

### Nossa Localização

- Referência: [nossa-localizacao.jpeg](../../assets/mobile/nossa-localizacao/nossa-localizacao.jpeg)
- Ajustes:
  - Esta seção deve conter apenas o conteúdo de Localização (mapa/endereço e informações relevantes).

### Redes Sociais

- Referência: [redes-sociais.jpeg](../../assets/mobile/redes-sociais/redes-sociais.jpeg)
- Ajustes:
  - Esta seção deve conter apenas o conteúdo de Redes Sociais (links/handles e texto de acompanhamento).
  - Separar de “Nossa Localização” (duas opções distintas no menu).

## Critérios de aceite (checklist)

- Menu de navegação contém exatamente os 13 itens definidos e navega corretamente.
- Cada item do menu abre a seção correta e a seção ocupa 100% do viewport mobile.
- Não há “vazamento” de conteúdo de uma seção para outra.
- Em Eventos/Orixás/Guias/Linhas:
  - Controles de carrossel/setas ficam sempre visíveis e clicáveis.
  - Botões flutuantes do site não escondem nem interceptam cliques dos controles.
- Calendário Atendimento:
  - Mensagem “Informações Importantes…” não é truncada.
  - Legenda com bullets e cores existe e é clara.
  - Dias com evento têm borda colorida e etiqueta de tipo.
  - Ao tocar em um dia, abre lista/card com todos os eventos do dia.
- Guias e Entidades:
  - Dados carregam via API quando existir conteúdo.
- Doações:
  - Dois botões principais lado a lado.
  - Cards “Assistência Espiritual”, “Ações Sociais”, “Transparência” presentes na mesma seção.
