# Priorização Consolidada — Batuara.net AdminDashboard

Cruza os dois planejamentos existentes para definir uma ordem única de execução:
- `docs/Plano de Correcao - AdminDashboard.md` (COR-01 a COR-09, origem: `Plano de Testes Batuara - v5.xlsx`)
- `docs/Plano de Implementacao - RBAC e Login WhatsApp.md` (Fase 1 a Fase 3)

**Gerado em:** 2026-07-07

## Achado principal do cruzamento

**COR-03 e a Fase 2.3 são o mesmo trabalho.** COR-03 ("Restrição de acesso por role não aplicada nas rotas") pede exatamente o que a Fase 2 do plano de RBAC já cobre com mais profundidade (2.1 corrige o rótulo de papel, 2.2 cria a página Usuários, 2.3 aplica `requiredRole` nas rotas). **Não implementar COR-03 isoladamente** — ele é absorvido pela Fase 2. Executar a Fase 2 já fecha CT-GRL-007 (parte de código) e COR-03 ao mesmo tempo.

**COR-09 e a Fase 3.5 tocavam áreas próximas (`MembersPage.tsx`/`HouseMember`).** A ordem recomendada era COR-09 antes da Fase 3 para evitar retrabalho. A execução inicial inverteu essa ordem, mas a inconsistência foi corrigida em 2026-07-07: COR-09 foi implementado depois, sem impacto direto em `MemberProfilePage.tsx`, porque a tela do Filho da Casa não exibe a aba Orixás.

Fora esses dois pontos, os demais itens não têm conflito de arquivo entre si — podem ser paralelizados se houver mais de um desenvolvedor/agente trabalhando ao mesmo tempo.

---

## Ordem única recomendada (se for uma pessoa/agente por vez)

| # | Item | Origem | Esforço | Por quê nessa posição |
|---|---|---|---|---|
| 1 | COR-01a — atualizar Plano de Testes (remover expectativa de Ativo/Inativo em Orixás/Guias/Umbanda/Conteúdo) | Correção | Trivial, sem código | Zero risco, zero dependência — só ajuste de planilha |
| 2 | COR-08 — reexecutar CT-ORI-007 e CT-UMB-010 (sem bloqueio real) | Correção | Trivial, sem código | Idem — só reteste |
| 3 | **Fase 2 completa (RBAC/multiadmin)** — absorve COR-03 | Implementação | Alto | Fundação de segurança: antes de criar um novo tipo de usuário (Member, Fase 3), o sistema de papéis existente precisa estar correto e com a UI de gestão pronta |
| 4 | Fase 1 (infraestrutura Evolution API/OCI) | Implementação | Médio | Independente do frontend — pode rodar em paralelo com o item 3 por outra pessoa, mas precisa estar pronta antes da Fase 3 |
| 5 | COR-09 — Autocomplete de Orixá em Filhos da Casa | Correção (melhoria) | Médio | ✅ Concluído em 2026-07-07; a ordem ideal era antes da Fase 3, mas foi corrigido sem retrabalho relevante |
| 6 | **Fase 3 completa (login WhatsApp + autoatendimento do Filho da Casa)** | Implementação | Alto | Maior novidade do pacote; depende de 3 e 4 prontos |
| 7 | COR-04, COR-05, COR-06 (média prioridade) | Correção | Baixo/Médio cada | Sem conflito de arquivo com nada acima — podem ser feitos a qualquer momento a partir daqui, inclusive em paralelo com 3–6 se houver outra pessoa |
| 8 | COR-07 (filtro por período em Eventos, baixa prioridade) | Correção | Baixo | Menor impacto, fica por último |

## Se houver mais de um desenvolvedor/agente disponível

Trilhas que podem correr em paralelo sem conflito de arquivo:

- **Trilha A (RBAC/segurança):** item 3 → item 6 (Fase 2 → Fase 3), nessa ordem — são dependentes entre si.
- **Trilha B (infra):** item 4 (Fase 1) — só precisa estar pronta antes do item 6 começar a testar o envio real de código.
- **Trilha C (correções isoladas de UI):** itens 5, 7 e 8, em qualquer ordem — `MembersPage.tsx` (COR-09), `GuidesPage.tsx`/`UmbandaLinesPage.tsx` (COR-04), `DashboardContent.tsx`/`SpiritualContentPage.tsx` (COR-05), `ContactMessagesPage.tsx` (COR-06), `EventsPage.tsx` (COR-07) — nenhum desses arquivos é tocado pelas Trilhas A ou B.

## Itens já concluídos (não entram na fila)

Ver também o resumo operacional completo em `docs/Status Atual - RBAC WhatsApp e COR-09.md`.

COR-01b, COR-01c e COR-02 — implementados e validados ao vivo em 2026-07-06 (ver status no `Plano de Correcao - AdminDashboard.md`).

Fase 1.2 — abstração backend do WhatsApp via Evolution API implementada em 2026-07-07 (`IWhatsAppService`, `EvolutionApiWhatsAppService`, opções e DI). A Fase 1 operacional está funcional/dev na OCI; a instância definitiva `batuara-casa` foi pareada e validada com envio real em 2026-07-08. Pendências: revisão de logs antes de produção e troca para chip dedicado da Casa quando disponível.

Fase 2 — RBAC/multiadmin implementada em código em 2026-07-07; **E2E validado em 2026-07-08** (Admin e Editor testados no navegador, bloqueio real 403 de rota Admin-only confirmado, itens de menu escondidos corretamente). Bug de regressão encontrado e corrigido nessa validação: `role` vindo do backend como string comparado como número no frontend — normalizado via `normalizeUserRole`.

COR-09 — Autocomplete de Orixá em Filhos da Casa implementado em 2026-07-07; `MembersPage.tsx` agora carrega Orixás via API, usa `Autocomplete` nos três campos e exige Orixá de frente no formulário administrativo.

Fase 3 — login WhatsApp e autoatendimento de Filho da Casa implementada em código em 2026-07-07; **E2E validado com envio/recebimento real em 2026-07-08** (código solicitado, recebido no WhatsApp, verificado, perfil carregado com dados reais). Resposta por WhatsApp a mensagens de contato público também validada de ponta a ponta nessa sessão, após corrigir 2 bugs reais (mensagem marcada como respondida sem enviar de fato; allowlist sem normalização de código do país). Pendente: E2E manual de contribuição recorrente (só validado por teste automatizado) e confirmação de que o deploy real na OCI aplica as migrations pendentes (uma delas ficou sem aplicar silenciosamente no ambiente local até ser detectada nessa validação).
