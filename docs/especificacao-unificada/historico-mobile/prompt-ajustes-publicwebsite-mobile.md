Você é um assistente de engenharia de software trabalhando no repositório Batuara.net, especificamente no frontend src\Frontend\PublicWebsite. Analise e implemente os ajustes descritos no arquivo docs\especificacao-unificada\historico-mobile\ajustes.md (as imagens de referência estão em docs\especificacao-unificada\historico-mobile\Batuara-Mobile/ e docs\especificacao-unificada\historico-mobile\assets\mobile/).

Objetivo Ajustar a experiência mobile do PublicWebsite, corrigindo espaçamentos entre Header e títulos das seções, removendo a navegação flutuante lateral direita (botões azuis), e melhorando a UX do Calendário (destaques por cor, instrução e card flutuante com detalhes).

## 1) Remover os botões flutuantes de navegação (lateral direita)
Problema: os botões flutuantes de navegação entre seções cobrem trechos importantes e confundem a navegação.

Implementação

- Remover o componente de navegação flutuante da árvore principal (atualmente importado/instanciado no App).
- Arquivo alvo: src/Frontend/PublicWebsite/src/App.tsx
  - Remover o import NavigationButtons from './components/common/ScrollToTopButton'
  - Remover <NavigationButtons /> do JSX.
Critérios de aceitação

- No mobile não existe mais o conjunto de botões flutuantes na lateral direita.
- Nenhuma área de conteúdo é encoberta por botões fixos.
Opcional (se der para manter uma alternativa “agradável” sem atrapalhar)

- Propor e implementar alternativa menos intrusiva (ex.: um único botão “Topo” discreto, ou um botão que só aparece ao final do scroll e não cobre conteúdo).
- A alternativa não pode cobrir textos/cards; deve ser pequena e ter posição segura.
## 2) Ajustar distância entre Header e título das seções (mobile)
Problema: em várias seções o título está com espaçamento grande ou aparece “vazamento” da seção anterior (“Início” aparecendo em “Nossa História”).

Implementação

- Padronizar o espaçamento vertical no mobile nas seções (top/bottom padding) e garantir que ao navegar por âncoras o título não fique colado ou sobreposto pelo header.
- Ajustar principalmente:
  - HeroSection (Início): manter como referência (não alterar visual se já está perfeito).
  - AboutSection (Nossa História / Nossa Missão)
  - CalendarSection (Calendário Atendimento)
  - EventsSection (Eventos e Festas)
  - OrixasSection
  - GuiasEntidadesSection
  - UmbandaSection (Linhas da Umbanda)
  - PrayersSection (Orações)
  - DonationsSection (Doações)
  - ContactSection (Contato)
  - LocationSection (Localização)
Sugestão técnica

- Revisar scrollMarginTop (âncoras) e py/pt no mobile para que:
  - O título nunca fique escondido sob o Header
  - Não apareça “pedaço” de seção anterior quando parar no topo da seção
- Ajustar com base em um offset consistente equivalente à altura do header no mobile.
Critérios de aceitação

- Em todas as seções, no mobile, o título fica visualmente “alinhado” com uma folga pequena (ex.: ~5px conforme o ajustes.md ) sem encostar no header.
- Ao abrir o menu e navegar para uma seção, não aparece “pedaço” da seção anterior no topo.
## 3) Calendário (mobile): bordas/cores, instrução e card flutuante com detalhes
Problema: o calendário precisa destacar dias com evento/atendimento usando a cor correta (borda e bullet), exibir instrução abaixo do calendário, e ao clicar na data abrir um card flutuante com os detalhes.

Implementação

- Arquivo alvo: src/Frontend/PublicWebsite/src/components/sections/CalendarSection.tsx
- Ajustar a lógica visual dos dias:
  - Dias com evento/atendimento devem ter borda na cor do evento do dia.
  - O “bullet”/indicador dentro do dia deve usar a mesma cor do evento.
  - Aplicar também (opcional/recomendado) preenchimento em tom pastel (background suave) seguindo a cor do evento para reforçar o destaque.
- Ajustar o mapeamento de cores para bater com o que está descrito em ajustes.md :
  - Kardecismo: roxo
  - Gira de Umbanda: azul
  - Curso: verde
  - Festas: ajustar para verde (conforme observação do ajustes.md )
  - Validar demais tipos para manter consistência com o site
- Adicionar abaixo do calendário um texto de ajuda:
  - “Clique na data desejada para obter maiores informações sobre o atendimento”
- Ao clicar em uma data com itens, abrir um card/dialog flutuante contendo:
  - Dia (data formatada)
  - Descrição
  - Hora de início (e fim se existir)
  - Orientação: recomendação de chegar com 30 minutos de antecedência
Critérios de aceitação

- Bordas e indicadores dos dias refletem a cor do tipo do evento corretamente (incluindo Festas em verde).
- O texto de instrução aparece abaixo do calendário no mobile.
- Clique em data com itens abre um flutuante com os campos solicitados.
## 4) Guias e Entidades: incluir linha descritiva como em Orixás/Linhas
Problema: a seção “Guias e Entidades” precisa ter uma linha de texto explicativa (subtítulo/descrição) similar às seções “Orixás” e “Linhas da Umbanda”.

Implementação

- Arquivo alvo: src/Frontend/PublicWebsite/src/components/sections/GuiasEntidadesSection.tsx
- Inserir um Typography (subtítulo) abaixo do título principal, com texto descritivo curto sobre Guias e Entidades, seguindo o padrão visual das seções equivalentes.
Critérios de aceitação

- A seção “Guias e Entidades” exibe título + linha descritiva (subtítulo) com espaçamento adequado no mobile.
## 5) Doações (mobile): cards estourando no final da tela
Problema: os cards “Assistência Espiritual / Ações Sociais / Transparência” estouram no final da tela no mobile (precisa ajustar altura/tamanho).

Implementação

- Arquivo alvo: src/Frontend/PublicWebsite/src/components/sections/DonationsSection.tsx
- Reduzir altura efetiva no mobile:
  - Ajustar padding interno ( CardContent )
  - Ajustar tamanho do ícone
  - Ajustar tamanho de fonte/line-height no mobile se necessário
- Garantir que os 3 cards caibam bem no viewport sem overflow visual.
Critérios de aceitação

- No mobile, os cards não “estouram”/não ficam cortados no final da tela.
## 6) Testes manuais (checklist)
- Abrir em viewport mobile (ex.: 390x844) e navegar via menu para todas as seções.
- Confirmar:
  - Sem botões flutuantes laterais cobrindo conteúdo.
  - Títulos com espaçamento correto em todas as seções.
  - Calendário: bordas/cores corretas + texto de instrução + card flutuante com detalhes ao clicar em dia com evento.
  - “Guias e Entidades” com linha descritiva.
  - Doações: cards sem overflow/corte.
Entrega

- Apenas mudanças de código necessárias para cumprir os itens acima.
- Não criar arquivos novos de documentação.
