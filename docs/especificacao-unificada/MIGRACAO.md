# Migração para `docs/especificacao-unificada`

## Objetivo

Consolidar especificações e recursos visuais em um diretório centralizado, reduzindo ambiguidades (especialmente em consumo por ferramentas de IA) ao padronizar:

- Caminhos relativos (sem `file:///` e sem `C:\...`).
- Nomes de arquivos sem espaços.
- Índice mestre em JSON para rastrear dependências e referências cruzadas.
- Validação automatizada para detectar links quebrados.

## Nova estrutura (resumo)

```
docs/especificacao-unificada/
  index.json
  MIGRACAO.md
  specs/
    desktop/
      spec-ui-ux-desktop.md
  assets/
    desktop/<secao>/
    shared/ui/
  historico-mobile/
    specs/mobile/spec-ui-ux-mobile.md
    assets/mobile/<secao>/
  tools/
    generate-index.ps1
    validate-references.ps1
```

## Regras de portabilidade

- Todo link entre documentos e assets deve ser relativo ao arquivo Markdown.
- Não usar links absolutos do tipo `file:///...` nem caminhos locais do tipo `C:\...`.
- Assets devem ficar em `assets/` e com nomes sem espaços.

## Como migrar preservando histórico (Git)

Para preservar histórico de versões, a migração deve ser feita com renome/movimentação rastreável:

1. Usar `git mv` (ou uma movimentação equivalente reconhecida pelo Git) ao invés de “copiar e deletar”.
2. Ajustar os links nos Markdown para o novo local.
3. Rodar validação automatizada (ver seção abaixo).
4. Commitar a mudança em um commit dedicado (“docs: consolidar especificações unificadas”).

## Mapeamento principal (antes → depois)

- `docs/Melhorias-UI-UX-Mobile/spec-melhoria.md` → `docs/especificacao-unificada/specs/mobile/spec-ui-ux-mobile.md`
- `docs/Melhorias-UI-UX-Desktop/spec-melhoria.md` → `docs/especificacao-unificada/specs/desktop/spec-ui-ux-desktop.md`
- `docs/Melhorias-UI-UX-Mobile/IMG_6694.jpeg` → `docs/especificacao-unificada/assets/mobile/inicio/inicio.jpeg`
- `docs/Melhorias-UI-UX-Mobile/IMG_6695.jpeg` → `docs/especificacao-unificada/assets/mobile/nossa-historia/nossa-historia.jpeg`
- `docs/Melhorias-UI-UX-Mobile/IMG_6696.jpeg` → `docs/especificacao-unificada/assets/mobile/nossa-missao/nossa-missao-cards.jpeg`
- `docs/Melhorias-UI-UX-Mobile/Captura de tela 2026-04-26 172047.png` → `docs/especificacao-unificada/assets/mobile/nossa-missao/captura-2026-04-26-172047.png`
- `docs/Melhorias-UI-UX-Mobile/Captura de tela 2026-04-26 180716.png` → `docs/especificacao-unificada/assets/mobile/nossa-missao/captura-2026-04-26-180716.png`
- `docs/Melhorias-UI-UX-Desktop/Captura de tela 2026-04-26 175337.png` → `docs/especificacao-unificada/assets/desktop/inicio/captura-2026-04-26-175337.png`
- `docs/Melhorias-UI-UX-Desktop/Captura de tela 2026-04-26 175352.png` → `docs/especificacao-unificada/assets/desktop/nossa-historia-missao/captura-2026-04-26-175352.png`
- `docs/Melhorias-UI-UX-Desktop/Captura de tela 2026-04-26 175939.png` → `docs/especificacao-unificada/assets/desktop/nossa-historia-missao/captura-2026-04-26-175939.png`
- `docs/Melhorias-UI-UX-Desktop/image.png` → `docs/especificacao-unificada/assets/shared/ui/bullet-orixas.png`

## Validação automatizada (links e índice)

Rodar:

```powershell
.\docs\especificacao-unificada\tools\validate-references.ps1 -EmitReport
```

Critérios:

- `index.json` aponta para arquivos existentes.
- Nenhum Markdown contém `file:///` ou `C:\...`.
- Nenhum link relativo em Markdown fica quebrado.

Relatório:

- `docs/especificacao-unificada/index/validation-report.json`

## Compatibilidade com ferramentas de IA

Esta estrutura foi desenhada para parsing estável por ferramentas como Gemini, Claude, Codex, Cursor, Trae e Antigravity por:

- minimizar caminhos absolutos específicos de máquina;
- reduzir ambiguidade por duplicação de specs;
- padronizar links e nomes de assets.

Testes “end-to-end” com modelos/IDE específicos exigem execução real de cada ferramenta (fora deste repositório). A validação automatizada cobre a parte estrutural (links/índice), que é o pré-requisito mais comum para parsing consistente.

## Métricas de redução de erro de interpretação

Para medir redução de erros de interpretação, recomenda-se:

1. Definir um conjunto fixo de tarefas de geração de código baseadas nas specs (prompts) e uma rubrica objetiva (ex.: presença de itens do menu, comportamento de âncoras, não-vazamento de seções).
2. Rodar o mesmo conjunto antes e depois da unificação, coletando outputs.
3. Calcular taxa de acerto (% de requisitos atendidos).

A coleta e execução dos modelos dependem de acesso às ferramentas citadas.
