# Plano de Melhorias e Handoff — Batuara.net

**Documento único de controle de atividades em desenvolvimento**  
**Versão:** 2026.08.03  
**Branch de referência:** `master`  
**Baseline operacional:** plataforma em produção OCI (CMS, RBAC, WhatsApp, Filho da Casa)

---

## 1. Como usar este documento

Este é o **único** arquivo para planejar, priorizar e acompanhar melhorias pendentes.

| Papel | Ação |
|-------|------|
| Início de sessão | Ler §2 (baseline), §3 (fila ativa) e §6 (handoff) |
| Durante o trabalho | Mudar status do item: `todo` → `doing` → `done` / `blocked` |
| Fim de sessão | Atualizar status, notas e §7 (changelog); preencher §6 se houver handoff |
| Novo item | Adicionar na tabela da §3 com ID `PM-XXX` e prioridade |

**Convenção de status**

| Status | Significado |
|--------|-------------|
| `todo` | Pronto para pegar |
| `doing` | Em andamento nesta sessão/branch |
| `blocked` | Impedido (dependência externa ou decisão) |
| `done` | Concluído e validado; mover resumo para §8 quando a fila engordar |
| `cancelled` | Descartado por decisão de produto; não retomar sem nova decisão |

**Prioridade**

| P | Significado |
|---|-------------|
| P0 | Operação/segurança com impacto imediato ou bloqueio de produção |
| P1 | Qualidade Admin/QA e endurecimento rápido |
| P2 | Plataforma, governança e otimização |
| P3 | Evolução de produto / nice-to-have |

**Documentos que NÃO controlam tarefas** (só referência): `ROADMAP.md` (histórico), `docs/Backlog-Executavel.md` (histórias/aceite), `docs/STATUS-PROJETO.md` (estado dos módulos), `docs/PlanoTestes.md` + planilha (casos de teste).

---

## 2. Baseline — o que já está entregue

Não reabrir como “melhoria pendente” sem evidência de regressão:

- CMS admin + PublicWebsite consumindo API real
- Auth JWT, refresh, RBAC (`Admin` / `Editor` / `Viewer` / `Member`)
- WhatsApp via Evolution API OCI (`batuara-casa`), login Member, resposta de contato
- Contribuições recorrentes + processor de lembretes (**desligado** por padrão)
- CI (gitleaks, audit de deps), deploy rolling OCI, logging, backup, runbook
- COR-01b, COR-01c, COR-02, COR-09 (AdminDashboard)
- Hardening OCI básico (ingress público `22`/`80`/`443`; Evolution só em loopback)

Detalhe de módulos: `docs/STATUS-PROJETO.md`.  
Histórico de fases: `ROADMAP.md`.

---

## 3. Fila ativa (checklist)

### P0 — Operação e segurança crítica

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-001 | `done` | **HTTPS + domínio próprio** (ex-ROADMAP 5.3) | ✅ Em produção: `https://www.batuara.org.br/` (Cloudflare + TLS; HSTS ativo; API `/batuara-api/health` Healthy). Confirmado em 2026-08-03. |
| PM-002 | `cancelled` | **Restringir Swagger em produção** | ❌ Decisão de produto (2026-08-03): Swagger **permanece aberto** em produção. Não implementar. |
| PM-003 | `done` | **CORS estrito em produção** | ✅ Concluído em 23/out (commit `54c4cd0`): sem fallback `AllowAnyOrigin()` quando `CorsSettings:AllowedOrigins` estiver vazio fora de Development; API falha no startup com erro claro (fail-closed); `appsettings.json` só com `https://www.batuara.org.br` e `https://batuara.org.br`; localhost/LAN movidos para `appsettings.Development.json`. Validado localmente (build + preflight por ambiente) e code review sem achados. |
| PM-004 | `todo` | **E2E manual — contribuição recorrente** | No Admin: criar contribuição recorrente → marcar paga → confirmar geração do mês seguinte; documentar resultado na planilha/PlanoTestes. |
| PM-005 | `done` | **Validar migrations no deploy OCI** | ✅ Concluído em 23/out (commit `ec159ae`): Step 3.5 do `deploy-rolling.sh` roda SQL + registro no histórico em transação única (`ON_ERROR_STOP`), erros visíveis, aborta antes de recriar containers e tem guarda de drift (migration do código ausente do histórico falha o deploy). Descobriu e aplicou `20260623120000_UnifyDescriptionFields`, que nunca tinha sido aplicada em produção (colunas `NOT NULL` órfãs em Orixas/UmbandaLines). Backup prévio em `~/backups` na OCI. `deploy-rolling-staging.sh` segue tolerante de propósito. |
| PM-006 | `cancelled` | ~~**Revisar logs Evolution API**~~ | ❌ Reescopo (22/out): `batuara-casa` desconectada e Batuara 100% na Meta Cloud API — Evolution só serve outros projetos. Se necessário, reabrir como "revisão de PII nos logs da API Batuara". |
| PM-007 | `done` | **Canal WhatsApp oficial da Casa (Meta Cloud API)** | **EM PRODUÇÃO**: OTP de login sai do número oficial `+55 11 94067-7714` via Meta Cloud API (validado E2E, commit `1becc37`). Empresa verificada; `casa_login_code` (AUTHENTICATION) aprovado; app Meta publicado. Evolution `batuara-casa` desconectada — número pessoal liberado (Evolution segue na OCI para outros projetos). Webhook Meta deployado (`/api/webhooks/whatsapp-meta`, commit `7faff76`), verificado, campo `messages` assinado, app inscrito na WABA e PMA `1400706312217668` — mensagens reais de visitantes entregues e processadas (validado 22/out). **Fluxo de contato bidirecional validado E2E em produção (22/out)**: visitante envia formulário com opt-in WhatsApp → admin responde no AdminDashboard → texto livre entregue na janela 24h (grátis, sem template, commit `8efbf09`) → réplica do visitante anexada na thread via webhook e exibida no dashboard. Webhook agora valida `X-Hub-Signature-256` quando `WhatsApp:AppSecret` configurado (commit `11919b6`). Digest diário 19h (SP) notifica admin via WhatsApp c/ contagem de pendências (`casa_pendencias_aviso_v3`, commit `11919b6`). Templates **todos APROVADOS** (conferido no WhatsApp Manager em 25/out): `casa_login_code` (AUTHENTICATION), `casa_pendencias_aviso_v3`, `casa_contact_reply` e `casa_contribution_reminder` (UTILITY). Residual: aviso da Meta sobre 4 modelos de utilidade sinalizados/reclassificados como marketing (ver §6.1). |
| PM-008 | `todo` | **Decidir ativação dos lembretes de contribuição** | `ContributionReminders.Enabled=false` em prod até OK explícito do dono do produto. **Destravado**: template `casa_contribution_reminder` (UTILITY) aprovado pela Meta e send-time 10h00 SP configurável — basta setar `CONTRIBUTION_REMINDERS_ENABLED=true` no `.env.whatsapp` e redeploy. (Controle operacional — decisão, não implementação.) |
| PM-040 | `done` | **Inbox p/ WhatsApp de visitante sem thread** | **Em produção e validado (25/out, `3f640c7`):** mensagem de texto sem thread ativa cria uma `ContactMessage` (assunto `Mensagem recebida pelo WhatsApp`, nome do perfil do WhatsApp ou "Visitante WhatsApp", `WantsWhatsAppResponse=true`); mensagens seguintes do mesmo número anexam na mesma thread; áudio/imagem/texto vazio seguem ignorados; sem limite diário; sem migration. Entra no digest e na lista do Admin. Política de privacidade atualizada. Teste real: número que nunca usou o formulário gerou a thread com 1 mensagem. |
| PM-036 | `done` | **Incidente 2026-08-17 — `batuara.org.br` (apex) em branco** | ✅ Causa: `location` regex injetada no `nginx-proxy` compartilhado pelo CD do Allugme (`Alugue.me/deploy/nginx-allugme.locations.conf`) capturava `/static/...` (não estava na lista de exclusão) e desviava os assets do PublicWebsite para a API do Allugme (404). `www` mascarava o problema por cache antigo do Cloudflare (imutável, ~13 dias). Corrigido em produção (`/var/www/nginx/nginx.conf` na OCI): location `^~ /static/` dedicada para blindar contra regex de terceiros + split do server block em `batuara.org.br` (301 → `www`) e `www.batuara.org.br` (conteúdo). Cache do Cloudflare purgado. **Atualização 2026-08-17:** causa raiz corrigida no repositório Allugme (commit `bf907fa`, `static`/`assets`/`_next`/`dist` adicionados à exclusão da regex da vitrine) e implantada em produção via CI/CD do Allugme. A guarda `^~ /static/` foi removida da cópia de referência [`scripts/oracle/nginx-proxy.nginx.conf`](../scripts/oracle/nginx-proxy.nginx.conf) — **mas segue ativa na configuração real de produção** (`/var/www/nginx/nginx.conf` na OCI, mantida manualmente por SSH); removê-la de lá é opcional, pois é inofensiva e serve como defesa extra. |

### P1 — AdminDashboard / QA (ex-COR restantes)

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-010 | `todo` | **COR-01a — atualizar Plano de Testes** | Remover expectativa de Ativo/Inativo em Orixás, Guias, Linhas e Conteúdo Espiritual (exclusão física). Só planilha/`PlanoTestes.md`. |
| PM-011 | `todo` | **COR-04 — Visualizar detalhes** | Guias: acionar Drawer existente (`GuidesPage.tsx`). Umbanda: ação “Visualizar” sempre visível (`UmbandaLinesPage.tsx`). Reexecutar CT-GUI-008, CT-UMB-007. |
| PM-012 | `todo` | **COR-05 — Paginação** | Dashboard activity log: paginação/`GridPager`. SpiritualContent: revalidar CT-ESP-001 (possível falso-negativo). CT-DASH-003. |
| PM-013 | `todo` | **COR-06 — Lida/não lida na grade** | Ação na grade de `ContactMessagesPage.tsx` (hoje só no detalhe). CT-MSG-005/006. |
| PM-014 | `todo` | **COR-07 — Filtro período em Eventos** | `EventsPage.tsx` + API filtrando por intervalo. CT-EVT-004. |
| PM-015 | `todo` | **COR-08 — retestes de ambiente** | Reexecutar CT-ORI-007, CT-UMB-010 (exclusão física); CT-AUTH-006 é by design (refresh automático). Atualizar planilha. |
| PM-016 | `todo` | **Revalidar RBAC E2E (ex-COR-03)** | Código já com `requiredRole`; confirmar Admin/Editor/Viewer no ambiente alvo e atualizar status na planilha. |

### P2 — Plataforma e endurecimento

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-020 | `done` | **Upgrade .NET 8 → .NET 10** | ✅ Concluído em 23/out (commit `12e77c9` + ajustes de acabamento): TFM `net10.0`, EF/Npgsql/JwtBearer 10.x (patch 10.0.13, igual ao runtime de produção), Docker `sdk/aspnet:10.0`, CI `10.0.x`, `KnownIPNetworks`, `Batuara.Auth` removido. CI/CD verdes; `/health` Healthy; CORS e rotas de auth validados em produção. Logins Admin e Filho da Casa (código WhatsApp) validados em produção após o deploy (23/out). |
| PM-021 | `todo` | **Trilha de auditoria (EP-Audit)** | Registro consultável de create/update/delete e ações sensíveis; sem dados sensíveis em log. Ref.: histórias H-060/H-061 no Backlog. |
| PM-022 | `todo` | **APM / monitoring além de health** | Métricas/alertas em produção (ex.: Prometheus+Grafana ou APM equivalente no Always Free). |
| PM-023 | `todo` | **Expandir testes automatizados** | Mais unit/integration backend + testes React críticos (auth, SiteSettings, membros). |
| PM-024 | `done` | **Tokens Admin: remover legado localStorage** | ✅ Concluído em 23/out: interceptor do `api.ts` não lê mais `authToken` nem envia Bearer; sessão só por cookies httpOnly. Mantida purga única das chaves legadas no init do `AuthContext`. Bundle em produção sem leitura de `authToken`. |
| PM-025 | `doing` | **SSH hardening OCI** | **Fases 1–3 feitas em 23/out:** drop-in `/etc/ssh/sshd_config.d/50-hardening.conf` (root `no`, X11 `no`, `MaxAuthTries 3`, `LoginGraceTime 30`, `AllowUsers ubuntu`, keepalive); `fail2ban` com jail `sshd` (3 falhas/10 min → ban 1h, incremental até 1 semana; exceção para os IPs de casa); `rpcbind` desligado e regras ufw 8001–8003 removidas. Backups em `~/backup-ssh-20261023` na OCI. Levantamento: ~870 tentativas/dia de usuário inexistente, nenhuma passou; senha desligada. **Fase 4 feita em 23/out:** 10 chaves de deploy (uma por projeto: Batuara.net, pet360, bela360, Barbear.IA, allugme, guelfiness, Unisystem, DriverHub, HakoInteriores, HealthCore) + 1 chave pessoal, todas ed25519; secrets atualizados via `gh` nos 10 repositórios e validados com workflow temporário (sem deploy) — login real de cada chave visto no log do servidor; chave antiga removida do `authorized_keys`. Chaves guardadas em `~/Projetos/oci-deploy-keys` (fora do git). Achado: `fail2ban` em `mode = aggressive` bania os runners do GitHub (o `ssh-keyscan` do workflow conta como falha); corrigido para `mode = normal`. **Pendente:** (5) fechar a 22 via OCI Bastion ou runner self-hosted (deploy usa IPs variáveis do GitHub); revisar demais regras antigas do ufw (8004, 3500, 5000/5005) e portas Docker publicadas em `0.0.0.0` (hoje protegidas só pela Security List da OCI). |
| PM-045 | `done` | **Endurecer sessão do Admin (pós PM-024)** | ✅ Concluído em 23/out (commits `9f1ae0c` e SameSite): login/refresh/verify-code não devolvem mais `token`/`refreshToken` no corpo (só com `AuthCookieSettings:ReturnTokensInBody`, ligado apenas em Development); cookies de sessão com `SameSite=Strict`, `Secure`, `HttpOnly` (verificado em produção). 7 testes novos. Antiforgery/CSRF dedicado descartado por ora: com `Strict` o ganho é pequeno; reavaliar se surgir endpoint com cookie acessível cross-site. |

### P3 — Evolução de produto

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-030 | `todo` | **Inscrição pública em calendário (H-011)** | Vagas, idempotência, rate limit; escopo grande — só após P0/P1 estáveis. |
| PM-037 | `done` | **Conformidade LGPD no PublicWebsite** | Página `/politica-de-privacidade` (controlador, dados, finalidades, compartilhamento Meta/Google, retenção, direitos Art. 18), banner de consentimento de cookies (necessários x terceiros, localStorage + evento de preferências), mapa do Google só carrega após opt-in, links no rodapé e nota no formulário de contato (commit `11919b6`). ✅ Operacional concluído: URL `/politica-de-privacidade` configurada no app Meta e `META_APP_SECRET`/`ADMIN_NOTIFICATION_*` aplicados no servidor (22/out). |
| PM-038 | `done` | **Notificação WhatsApp de pendências ao admin** | Hosted service diário (19h SP) conta `ContactMessage` Nova/EmAtendimento e envia template `casa_pendencias_aviso_v3` ao número em `AdminNotification:Phone` (commit `11919b6`). Env vars aplicadas no servidor (22/out); template aprovado pela Meta; **digest validado em produção e recebimento confirmado pelo Douglas na sexta, 23/10/2026**. |
| PM-039 | `done` | **Mobile AdminDashboard — lista de mensagens compacta** | Colunas: envelope (vermelho não lida / azul lida), nome, assunto, semáforo WhatsApp (amarelo pendente / verde respondida / cinza não solicitou), data, status; clique na linha abre atendimento (commit `11919b6`). |
| PM-046 | `todo` | **Campanha WhatsApp: site liberado para os filhos** | **Só planejamento; nada será enviado até decisão.** Plano em §6.2-A. Usa `casa_aviso_filho` (Marketing). Depende de: base de opt-in (não existe hoje), tabela de entregas/idempotência, endpoint Admin com *dry-run*, teste na allowlist. |
| PM-047 | `todo` | **Envio do link do tutorial aos filhos** | Sequência da PM-046: `casa_tutorial_site` (Utilidade) com `https://www.batuara.org.br/tutorial.html`. Reaproveita a infraestrutura da PM-046. Plano em §6.2-A. Antes: linkar o tutorial no site e na tela de login dos filhos. |
| PM-048 | `blocked` | **Reativar "Minha contribuição" na tela do Filho da Casa** | **Oculta na fase 1 do site (27/out):** nesta fase o filho só completa os dados cadastrais; a declaração de valor, recorrência e autorização de lembrete por WhatsApp saiu da tela `UnifiedProfilePage` (rota `/profile`). Código preservado em `src/Frontend/AdminDashboard/src/components/member/MemberContributionSection.tsx` (autocontido, **não renderizado**). Para reativar: importar o componente na `UnifiedProfilePage` e renderizá-lo sob `memberSession`, passando `member`, `onMemberUpdated={applyMemberData}`, `onFeedback={setMemberFeedback}` e `onError={setMemberError}`. **Backend intacto** (`addMyMemberContribution`, lembretes desligados). Depende do redesenho do fluxo de controle de contribuições (PM-008/PM-004) e do opt-in de WhatsApp (PM-046). |
| PM-049 | `done` (local) | **Ajuste do digest diário das 19h (só com novidade)** | **NÃO publicado: aguardar a comanda do bingo.** O digest reenviava todo dia a mesma contagem. Regra nova (`PendingContactDigestService`, `Batuara.Infrastructure/Notifications`): `lastDigestAt` = último envio com sucesso (tabela `AdminDigestStates`, chave `pending-contacts`; sem registro = agora − 24h). **Novidade** = `ContactMessage` `New` com `ReceivedAt > lastDigestAt` OU mensagem `New`/`InProgress` com réplica do visitante (`WhatsAppMessages.IsFromMe=false`, `SentAt > lastDigestAt`); `Resolved`/`Archived` nunca contam; `WantsWhatsAppResponse=false` também entra. **Número enviado** (1 parâmetro de `casa_pendencias_aviso_v3`, sem template novo) = total `New`/`InProgress` não lidas OU com réplica nova desde `lastDigestAt`; só envia se houver novidade e total > 0. Webhooks (Meta e Evolution) chamam `MarkAsUnread()` na réplica do visitante. Falha de envio não grava o estado e gera 1 retry 1h depois no mesmo dia. `LastSentAt` = início da checagem (UTC), gravado só após sucesso. **Lembrete de deploy:** tabela nova exige a migration `20261107041925_AddAdminDigestState` (já adicionada como `apply_migration` em `scripts/ci/deploy-rolling.sh`, antes da guarda de drift); manter ao reordenar/rebasear. |
| PM-050 | `in_progress` | **Bingo / comandas digitais (evento 07/11/2026), multi-evento** | Contrato em `docs/BINGO-CONTRATO.md`. **Backend pronto:** entidades `BingoEvents` (Draft/Open/Closed, `IsTest`), cardápio, mesas, garçons, comandas e itens por evento (migration `AddBingoEvents` + `apply_migration` em `scripts/ci/deploy-rolling.sh`, seed com "Bingo 07/11/2026" e "Teste"); API pública (`/api/bingo/public`), garçom (`/api/bingo/garcom`, sem login próprio: sessão normal de filho, que dura 10 h se escalado; validação por request; `GET /garcom/me`) e admin (`/api/bingo/admin`, incl. `eventos`, histórico e resumo por evento); no máximo 1 evento aberto; "zerar dados" só em evento de teste; anonimização LGPD diária (telefone apagado e nome reduzido às iniciais 30 dias após o encerramento). Telas (PublicWebsite/Admin) em andamento. **Etapa de retirada na cozinha:** item `Pending` → `Retrieved` → `Delivered`; endpoints `retirar`/`devolver`/`entregar`, painel com `retrievedItems`/`retrievedByTable` (migration `AddBingoItemRetrieval`). **Confirmação do celular por código (`AddBingoPhoneVerification`):** o link por WhatsApp (template Marketing `casa_aviso_filho`) não foi entregue em teste real; agora a criação envia código de 6 dígitos pelo template de autenticação `casa_login_code` (sem travar a comanda), com `confirmar-celular`/`reenviar-codigo`, status de entrega vindo do webhook Meta, lembrete pós-evento de conta em aberto (Admin, evento Closed, 1 por comanda) e retenção 30 dias (pagas) / 90 dias (não pagas). **Contestação, cancelamento e formas de pagamento (`AddBingoContestationAndPaymentMethods`):** itens `Contested`/`Cancelled` com auditoria, `amountDue`/`undeliveredCount`/`contestedCount` em todos os DTOs, encerrar com itens não entregues (409 `UNDELIVERED_ITEMS`), formas de pagamento cadastráveis (`BingoPaymentMethods`), pagamento por `paymentMethodId` (bloqueado por itens pendentes/contestados), resumo por garçom/forma, `garcom/contas?todas=true`. Pendente: abrir o evento pelo Admin no dia, política de privacidade com o parágrafo do bingo, telas (confirmação do celular, status de entrega e lembretes). |
| PM-031 | `todo` | **MFA (TOTP)** | Login admin com MFA opcional/obrigatório. |
| PM-032 | `todo` | **WAF / SIEM básico** | Proteção de borda + correlação de logs. |
| PM-033 | `todo` | **Cache de endpoints públicos** | In-memory/Nginx; Redis só se volume justificar. |
| PM-034 | `todo` | **API versioning consistente** | Política única (URL ou header) documentada. |
| PM-035 | `todo` | **a11y + i18n (PublicWebsite)** | Acessibilidade e eventual internacionalização. |

---

## 4. Ordem recomendada de execução

Revisão completa realizada em **2026-10-22** após a migração Meta Cloud API. Critério: urgência ponderada por segurança primeiro, depois deadline fixo, confiabilidade operacional, qualidade e produto.

### Fila repriorizada

> Ordem aprovada em 23/out/2026 (prioridade: segurança → confiabilidade operacional → produto → qualidade).
> Reordenada em 25/10/2026: **PM-025 e PM-031 passaram ao final da fila** — as alterações implementadas desde a última ordenação melhoraram de forma significativa os itens relacionados a segurança; **PM-041 e PM-042** passaram a ser os próximos passos.

1. ~~**PM-041** — Logs da API fora do container~~ ✅
2. ~~**PM-042** — Healthchecks e `depends_on` na OCI~~ ✅
3. ~~**PM-040** — Inbox p/ mensagens WhatsApp sem thread~~ ✅
4. **PM-046 → PM-047** — Campanha de lançamento do site aos filhos e envio do tutorial *(planejar antes; envio só com aprovação explícita)*
   **PM-008 + PM-004** — Decisão dos lembretes de contribuição + E2E recorrente
5. **PM-021** — Trilha de auditoria *(base também p/ LGPD)*
6. **PM-010 → PM-016, PM-023** — Débitos do plano de testes Admin + cobertura de testes
7. **PM-022, PM-044, PM-032** — APM, Ubuntu 24.04/Node, WAF/SIEM
8. **PM-030, PM-033, PM-034, PM-035** — Evolução de produto
9. **PM-025** — SSH hardening OCI *(fases 1–4 feitas; falta fechar a 22)*
10. **PM-031** — MFA (TOTP)
11. **Melhoria futura (produto, sem PM ainda)** — Cobrança pelo celular (Pix com confirmação automática; cartão por "toque para pagar"). Pesquisa e plano em §6.1, bloco *Cobrança pelo celular*. Aguarda aprovação para começar pelo Pix.

### Encerrados / sem ação

- **PM-003** — ✅ *done* — CORS fail-closed e origins explícitas (commit `54c4cd0`)
- **PM-043** — ✅ *done* — Chaves de Data Protection persistidas em volume
- **PM-045** — ✅ *done* — Sessão do Admin endurecida (sem tokens no corpo, `SameSite=Strict`)
- **PM-024** — ✅ *done* — Legado `localStorage` removido
- **PM-005** — ✅ *done* — Migrations no deploy sem erro silencioso (commit `ec159ae`)
- **PM-020** — ✅ *done* — Upgrade .NET 8 → 10 (commit `12e77c9`)
- **PM-006** ❌ *cancelled* — Evolution fora do fluxo Batuara; reescopar se necessário
- **PM-007** — ✅ done; templates `casa_login_code`, `casa_pendencias_aviso_v3`, `casa_contact_reply` e `casa_contribution_reminder` aprovados (25/out)
- **PM-037, PM-039** — ✅ done
- **PM-038** — ✅ done; digest validado e recebimento confirmado pelo Douglas (23/10)

---

## 5. Mapa de documentação (após limpeza)

### Controle e onboarding

| Arquivo | Função |
|---------|--------|
| **`docs/PLANO-MELHORIAS.md`** | **Fila única de melhorias + handoff** |
| `agent.md` | Onboarding técnico para IA/devs |
| `ROADMAP.md` | Histórico de fases/PRs (não é tracker ativo) |
| `README.md` | Visão geral e setup |

### Estado e referência de produto

| Arquivo | Função |
|---------|--------|
| `docs/STATUS-PROJETO.md` | Status por módulo |
| `docs/Status Atual - RBAC WhatsApp e COR-09.md` | Snapshot validado RBAC/WhatsApp |
| `docs/Backlog-Executavel.md` | Histórias e critérios de aceite (detalhe) |
| `docs/EFT-especificacao-funcional-tecnica.md` | Especificação funcional/técnica |
| `docs/Resumo-Executivo.md` | Visão para stakeholders |

### Operação e QA

| Arquivo | Função |
|---------|--------|
| `docs/RUNBOOK.md` | Operação/emergência |
| `docs/Evolution API - Operacao OCI.md` | WhatsApp OCI |
| `docs/DEPLOY.md`, `ORACLE_DEPLOY_README.md`, etc. | Deploy |
| `docs/PlanoTestes.md` + planilha xlsx | Casos de teste |
| `docs/AdminDashboard-Manual-do-Administrador.md` | Manual do admin |

### Removidos (ultrapassados — conteúdo absorvido aqui ou já entregue)

- `AnaliseMelhoriasProjetoBatuara.md`
- `AnaliseProjetoBatuara.md`
- `docs/Priorizacao Consolidada.md`
- `docs/Resumo-Executivo-Testes.md`
- `docs/Plano de Correcao - AdminDashboard.md`
- `docs/Plano de Implementacao - RBAC e Login WhatsApp.md`
- `docs/TASK_HISTORY.md`
- `docs/mensagem-opencode-recorrencia-lembrete.md`
- `docs/mensagem-opencode-fix-whatsapp-response.md`

---

## 6. Handoff da sessão

> Preencher ao final de cada sessão de desenvolvimento. A próxima pessoa/agente começa por aqui.

### 6.1 Estado atual do handoff

| Campo | Valor |
|-------|-------|
| Data | 2026-10-26 (sessão atual) |
| Branch | `master`, sincronizada com o remoto; último commit: `6607f58` (tutorial publicado em `/tutorial.html`). Código de API em produção: `3f640c7` (PM-040). |
| Em andamento (`doing`) | PM-025 com fase 5 opcional pendente (item no fim da fila). **Frente nova (sem ID no plano): templates Meta de comunicação com os filhos + tutorial de acesso** (ver bloco abaixo) |
| Próximo item sugerido | **1)** Fechar as decisões abertas do §6.2-A e implementar PM-046/PM-047 (aviso de site liberado + link do tutorial). **Nada deve ser enviado aos filhos sem aprovação explícita do dono do produto.** **2)** **PM-008 + PM-004** (decidir lembretes de contribuição + E2E recorrente): decisão do dono do produto. |
| Bloqueios ativos | Nenhum. Templates Meta em uso aprovados e em categoria barata (25/out). Aviso da Meta ("4 modelos de utilidade reclassificados como marketing") **verificado em 25/out**: os 4 são `casa_teste_variavel`, `casa_teste_simples`, `casa_admin_notification` e `casa_contact_response` — todos de teste/legado, sem referência no código nem nos `.env` da OCI; sem impacto de custo. Prazo p/ pedir análise: 20–22/12/2026 (opcional; dá para excluí-los no painel). |
| Ambiente | Produção em `https://www.batuara.org.br/`; .NET 10; lembretes WhatsApp desligados; Swagger público por decisão. OCI: 2 OCPU / 12 GB / 100 GB, Ubuntu 22.04.5, 38 containers |
| Riscos | Logs da API em volume `batuara-api-logs` → `/app/logs` (PM-041, em produção); healthchecks e `depends_on: service_healthy` no api/Evolution (PM-042, em produção; o `up --no-deps` do `deploy-rolling.sh` ignora o `depends_on`, então o ganho vale para boot da máquina e `restart`, não para o deploy rolling, que já sobe o `db` antes). Chaves do Data Protection sem criptografia em repouso; teste Jest do Admin quebrado (`TextEncoder`); majors pendentes (FluentValidation 12, Swashbuckle 10, FluentAssertions 8) |

#### Frente de 26/out: templates Meta para os filhos + tutorial de acesso

- **Tutorial publicado:** `https://www.batuara.org.br/tutorial.html` (fonte: `docs/tutorial/TutorialBatuara.html`, cópia em `src/Frontend/PublicWebsite/public/tutorial.html`; commits `82b1a57` e `6607f58`). Página única, sem dependências, versões celular e computador, cobre só o login por código no WhatsApp. O desenho do WhatsApp segue a mensagem real do `casa_login_code`. **Ainda não há link para ele no site nem na tela de login dos filhos.** Ao editar, lembrar de atualizar as duas cópias.
- **Templates enviados à Meta em 26/out (WABA `1400706312217668`, pt_BR), todos "Em análise" quando esta nota foi escrita (≈13:41 BRT):**
  - `casa_aniversario` (Marketing): "Olá, {{1}}! A Casa de Caridade Caboclo Batuara deseja a você um feliz aniversário, com muita luz, saúde e paz! Axé!"
  - `casa_evento_convite` (Marketing): variáveis {{1}} nome, {{2}} evento, {{3}} data.
  - `casa_aviso_filho` (Marketing): {{1}} nome, {{2}} texto do aviso. Foi cadastrado como Utilidade e a Meta avisou que seria rejeitado; trocado para Marketing.
  - `casa_tutorial_site` (Utilidade, pode ser reclassificado): {{1}} nome, {{2}} link do tutorial.
- **Aprovados em 27/out** (WhatsApp Manager: "Ativo — Qualidade pendente"; `casa_tutorial_site` ficou em Utilidade, os outros três em Marketing). 0 envios até aqui.
- **Camada de envio implementada em 27/out (sem gatilho):** `IWhatsAppService` ganhou `SendBirthdayGreetingAsync`, `SendEventInviteAsync`, `SendMemberNoticeAsync` e `SendSiteTutorialLinkAsync`; nomes em `WhatsAppCloudApiOptions` (`BirthdayTemplateName`, `EventInviteTemplateName`, `MemberNoticeTemplateName`, `SiteTutorialTemplateName`, sobrescrevíveis por `WhatsApp__*`); Evolution com texto equivalente; 5 testes novos (52 no total). **Nenhum job, endpoint ou chamada usa esses métodos ainda** — nada é enviado. `SendMemberNoticeAsync` achata quebras de linha e espaços repetidos (a Meta rejeita isso em parâmetro de template).
- **Falta (PM-046/PM-047):** opt-in registrado, tabela de entregas, endpoint/job no Admin com *dry-run* e limite diário. Marketing é cobrado por mensagem; envio em massa só com opt-in registrado.
- **Dica de cadastro no WhatsApp Manager:** digitar `{{` no corpo cria a variável sozinho; variável não pode abrir nem fechar o texto; cada variável exige amostra (usar dado fictício). Sobre inatividade de templates: nenhuma fonte oficial da Meta confirma expiração; um fornecedor terceiro cita arquivamento após 12 meses sem uso (não confirmado).
- **Ao retomar:** ler o §6.2-A (plano da campanha) e resolver as decisões abertas antes de codar o envio.

#### 6.2-A Plano: campanha "site liberado" (PM-046) + link do tutorial (PM-047)

**Objetivo:** avisar os filhos da Casa, por WhatsApp, que o site está pronto e liberado para acesso e, na sequência, enviar o passo a passo (`/tutorial.html`). **Não enviar nada até o dono do produto aprovar texto, público e data.**

**Mensagens (dois templates já aprovados):**

| Ordem | Template | Categoria | Variáveis | Conteúdo sugerido |
|-------|----------|-----------|-----------|-------------------|
| 1 | `casa_aviso_filho` | Marketing | {{1}} primeiro nome, {{2}} aviso | Aviso: "O site da Casa já está no ar. Agora você pode acessar a sua área com um código enviado por WhatsApp, em batuara.org.br." (uma linha, sem quebra) |
| 2 | `casa_tutorial_site` | Utilidade | {{1}} primeiro nome, {{2}} link | `https://www.batuara.org.br/tutorial.html` |

Sugestão: mensagem 2 no dia seguinte (ou algumas horas depois), para quem não tiver acessado; o aviso 1 já pode citar que o passo a passo vai chegar.

**Público:** `HouseMember` ativo, com `MobilePhone` válido (normalizado por `PhoneNumberNormalizer`), **e** opt-in registrado.

**Decisões abertas (dono do produto):**
1. **Opt-in:** não existe campo de consentimento no `HouseMember` (só `AllowWhatsAppReminder` por contribuição). O aviso é Marketing e a Meta exige opt-in. Opções: (a) campo novo `WhatsAppOptIn` + data + origem no `HouseMember`, preenchido pelo Admin após confirmação da direção; (b) tratar o cadastro presencial como consentimento e registrar a data em lote. Recomendação: (a), com a origem "cadastro presencial/direção" documentada.
2. **Texto final** do aviso e se o tutorial segue no mesmo dia ou no seguinte.
3. **Quem dispara:** botão no Admin (manual, com confirmação) em vez de job automático. Recomendação: manual, uma campanha por vez.
4. **Link do tutorial** no site e na tela de login dos filhos antes do envio (hoje não existe).

**Desenho técnico proposto:**
- Tabela `WhatsAppBroadcastDelivery` (`CampaignKey`, `HouseMemberId`, `TemplateName`, `Status` Pending/Sent/Failed/Skipped, `MessageId`, `Error`, `SentAt`, índice único `CampaignKey+HouseMemberId`) para idempotência: reexecutar não duplica envio.
- Endpoint Admin `POST /api/house-members/broadcast/{campaign}` (`Admin`) com `dryRun=true` por padrão: devolve quantos receberiam, quantos ficam de fora (sem telefone, inativo, sem opt-in) e a prévia do texto, sem enviar.
- Envio real: lotes pequenos com intervalo (ex.: 20 por minuto), limite diário configurável, falha de um destinatário não interrompe os demais, tudo registrado na tabela.
- Teste primeiro só com a allowlist (`WhatsApp__AllowedRecipients`) e 1–2 números da direção; só depois liberar o público.
- Aproveitar o webhook Meta para marcar falhas de entrega (status `failed`) na tabela.
- Testes: dry-run não envia; idempotência; exclusão de sem opt-in/inativo/sem telefone; falha parcial.

**Ordem de execução:** (1) decisões acima → (2) migration + opt-in no Admin → (3) tabela de entregas + endpoint com dry-run → (4) teste na allowlist → (5) linkar tutorial no site e no login → (6) **aprovação explícita** → (7) disparo do aviso → (8) disparo do tutorial.

#### Fatos operacionais de 23/out (não deriváveis do código)

- **SSH da OCI:** `ssh -i ~/Projetos/oci-deploy-keys/oci-pessoal-20261023 ubuntu@129.153.86.168`. Só chave; senha desligada; `AllowUsers ubuntu`; root `no`; `fail2ban` (`mode = normal`, **não** usar `aggressive`: bane os runners do GitHub por causa do `ssh-keyscan`). Configs em `/etc/ssh/sshd_config.d/50-hardening.conf` e `/etc/fail2ban/jail.d/sshd-batuara.local`; backups em `~/backup-ssh-20261023` na OCI. A recuperação em caso de perda da chave é pelo Console da OCI.
- **Chaves de deploy:** uma por projeto (10) em `~/Projetos/oci-deploy-keys` (fora do git), já nos secrets dos 10 repositórios (`OCI_SSH_PRIVATE_KEY`, `OCI_SSH_KEY` ou `SSH_PRIVATE_KEY`, conforme o repo). Chaves antigas removidas do disco e da OCI.
- **Migrations em produção:** o app não migra no startup; o Step 3.5 de `scripts/ci/deploy-rolling.sh` aplica SQL idempotente em transação única e falha o deploy se uma migration do código não estiver no histórico. **Toda migration nova precisa de um `apply_migration` nesse script.**
- **Sessão do Admin:** tokens só em cookies httpOnly (`SameSite=Strict`); o corpo das respostas de login/refresh não traz token (exceto `AuthCookieSettings:ReturnTokensInBody=true`, só em Development).
- **Data Protection:** chaves no volume Docker `batuara-dataprotection-keys` (`/app/dp-keys`).
- **Backup:** `~/backups/batuara-orixas-umbanda-pre-unify-20261023.sql` na OCI (pré-`UnifyDescriptionFields`).

### Handoff — 2026-11-09 (noite: revisão de UI do Admin desktop e Resumo mobile)

- **Agente/dev:** Claude Code (Sonnet 5.5). A sessão continua no Codex.
- **Branch:** `master`. Commits da revisão de UI: `9759799` (revisão completa, **deploy ok**), `ee91b3d` (linhas das Comandas Foto), `5f8d79a` (Cardápio e Formas de pagamento compactos e sem paginação), `96dd50d` (título "Evento:"). Também enviados: `f92c2a5` (botões do link em Comandas Foto) e `0b9d4f6` (comanda sem consumo). **Todos com CI/CD verdes e health 200** (último: `e5cfa55`, pagamento dividido, com a migração `AddBingoSplitPayments` aplicada; o 1º CI falhou só no Docker Build por falha de rede ao baixar pacotes e passou na reexecução). **Pesquisa em aberto (sem implementação):** cobrança pelo celular — Pix via API de Pedidos do PagBank (QR + webhook) e cartão via PlugPag (app nativo + Bluetooth) ou SDK Smart; respostas do usuário em 10/11: a conta PagBank do Batuara recebe Pix, débito e crédito; vale para Batuara **e** ComandaFácil; modelo da maquininha a confirmar com o Douglas; CNPJ será passado depois; o usuário tem maquininha e conta PagSeguro/PagBank pessoais a reativar para testes com o celular dele. Operadoras a comparar além do PagBank: Mercado Pago/Livre (Point, Tap to Pay), Stone, PicPay e InfinitePay (todas oferecem "celular como maquininha"). Ver bloco **Cobrança pelo celular — pesquisa com operadoras** logo abaixo.
- **Itens movidos para `done`:** (só `BingoPage.tsx`, desktop, salvo onde indicado)
  - Eventos: um evento por linha, botões na mesma linha, sem largura mínima, tabela rola na horizontal abaixo de ~1100 px.
  - Painel ao vivo: informativos em caixinhas + caixa "Filtrar comandas" + "Pedir fechamento geral" + suspender/encerrar na 1ª linha.
  - Cardápio e Formas de pagamento: lápis (janela "Editar …") antes da lixeira, **sem edição por duplo clique**, `DataGrid density="compact"`, **sem paginação** (decisão final do usuário; antes tinha sido 10 por página). Texto de ajuda do Cardápio numa linha.
  - Resumo: desktop em painel (6 indicadores numa linha; duas colunas: forma de pagamento + conferência por garçom | "Por item" com rolagem interna); botões do topo com espaçamento (o `display: contents` anterior tirava o espaçamento do `Stack`). **Mobile:** grade de 2 colunas e listas recolhíveis (`Accordion`).
  - Comandas Foto: cartão de resumo numa linha, linhas baixas (~36 px), coluna "Forma de pagamento", ícone de câmera no lugar de "Ver foto" (sempre ativo; a janela informa "sem foto"), paginação de 10 em 10 (só aqui). Coluna "#" mantida.
  - Título da página: "Evento:" (antes "Bingo" no desktop).
  - **Comanda sem consumo não tem forma de pagamento** (digital e de papel): garçom/Admin veem "Encerrar sem consumo" quando o valor a pagar é R$ 0,00; `PayCoreAsync` aceita `PaymentMethodId` nulo só se nada é devido; comanda de papel sem itens é registrada com total 0 (exige o número) e fica fora de "por forma de pagamento"; listas mostram "Sem consumo". 2 testes novos (92 no total).
  - **Limite conhecido (diferença para o PRD v1.5 do ComandaFácil):** no piloto, total zero = "Sem consumo"; **não** distingue "cortesia" (itens com preço zero) de ausência de consumo, e a foto sem itens só exige confirmação humana na tela (sem tipo de encerramento gravado). Pendências de entrega continuam bloqueando o encerramento nos dois fluxos.
  - Botões "Copiar link" e "Enviar link WhatsApp" na tela Comandas Foto (também sem comandas).
  - **Pagamento dividido em mais de uma forma** (comanda digital e de papel; a soma tem que bater com o valor a pagar): `BingoPaymentSplit` (valida e distribui as partes em ordem pelas comandas), `BingoPaymentPart` (domínio), `PaymentsJson` em `BingoTabs` e `BingoPhotoTabs` (**migração `AddBingoSplitPayments` + `apply_migration` no `deploy-rolling.sh`**), API `Payments[]` em pagar (garçom/Admin) e em salvar comanda de papel, OCR devolve lista `payments` (forma + valor), resumo e conferência por garçom somam por parte. Front: `PaymentPicker` (cópias em `PublicWebsite/src/pages/comandaFoto` e `AdminDashboard/src/components/comandaFoto`) com "Dividir pagamento" sempre disponível, usado nas 4 telas de comanda de papel e na cobrança digital (garçom e Admin). 94 testes de backend. **Não validado com foto real** (caso real: "deb. 300,00" + "din. 136,00" = R$ 436,00). Sugestão S4 registrada em `ComandaFacil/SUGESTOES-PRD.md`.
- **Telas aprovadas sem mudança:** Novo evento, Mesas, Garçons.
- **Validações executadas:** `tsc --noEmit` e `eslint` (único aviso preexistente: `OPEN_STATUSES` não usado). CI do `9759799` e CD ok. **Não houve conferência visual local** (app exige login): o usuário valida em produção com Ctrl+Shift+R e manda prints.
- **Arquivos tocados:** `src/Frontend/AdminDashboard/src/pages/BingoPage.tsx` (removidos `CurrencyEditCell`, `chipFilter`, `toggleFilter`), `docs/PRD-COMANDA-DIGITAL-MULTITENANT.md` (v1.2, seção 11 de UI/UX).
- **ComandaFácil (regra desde 10/11/2026):** a documentação do ComandaFácil (`/home/guelfi/Projetos/ComandaFacil/docs/`) não é mais atualizada por este projeto. O handoff fica só aqui e no ai-memory, relacionado ao Batuara, mesmo para melhorias no controle de comandas.
- **Não commitado / cuidado:** nada pendente neste repositório. O produto derivado está em `/home/guelfi/Projetos/ComandaFacil` (PRD próprio, já na v1.3 sem referências ao Batuara; `HANDOFF.md` mantido por lá). Esperar o deploy terminar antes de novo push.
- **Próximo item sugerido:** receber os prints do usuário com os ajustes finos (Painel ao vivo na 1ª linha em notebook, altura da coluna "Por item", botões de Eventos em janela estreita). Depois: validar o OCR da forma de pagamento com foto real; RF-M6 (QR de todas as mesas no Admin); unificar o fluxo comanda-foto duplicado.
- **Bloqueios novos:** nenhum.

### Cobrança pelo celular — pesquisa com operadoras (10/11/2026, **nada implementado**)

- **Objetivo:** depois de escolher a forma, gerar a cobrança no celular: Pix com QR Code e confirmação real do banco; débito/crédito na maquininha ou no próprio celular. Vale para Batuara e ComandaFácil. Pagamento dividido (várias formas) casa com um Pix por parcela.
- **Pix (caminho mais simples, funciona em web):** PagBank API de Pedidos (QR Code com expiração, um QR por pedido, webhook de confirmação; exige chave Pix ativa; evitar `arrangements: PAGBANK`). Alternativas com Pix + webhook: Efí, Asaas, Mercado Pago. Desenho necessário: pedido por parcela, webhook com verificação de assinatura, idempotência, expiração, estorno.
- **Cartão:** PagBank PlugPag (app nativo Android/iOS fala por Bluetooth com Moderninha Pro/WiFi; sem caminho web direto confirmado) e Moderninha Smart (SDK Android próprio). "Celular como maquininha" (tap to pay) existe em Mercado Pago, Stone, PicPay e InfinitePay; precisa avaliar API/SDK aberto e se há integração com sistema próprio (muitos só funcionam no app deles, sem retorno ao sistema).
- **Pesquisa técnica de 10/11 (toque para pagar / NFC):** o celular lê o cartão pelo NFC e quem processa é o app/SDK certificado da operadora; o nosso sistema só pede a cobrança e recebe o resultado.
  - **PagBank Tap On** (`developer.pagbank.com.br/docs/tap-on`): Android 11+, NFC ativo, app **PagBank Tap On** instalado e conta PagBank do vendedor; o app de terceiros chama o Tap On por **`Intent`** (`TapOnPaymentData`) e recebe `TransactionResult` em `onActivityResult`; estorno por `TapOnVoidPaymentData`. iOS 17.4+ com framework embarcada e entitlement "Tap to Pay on iPhone". **Exige parceria aprovada** (formulário, avaliação comercial e PLD) e `appKey` de produção; taxas padrão, sem negociação; limites de valor e formas (débito/crédito/Pix) não informados na página. **Web não é suportada:** precisa de app Android nativo de apoio (casca do nosso site) para receber o resultado. PlugPag é só para maquininhas físicas por Bluetooth.
  - **Mercado Pago:** o Point Tap é produto de lojista; **não achei integração pública para apps de terceiros** (pode ser restrita; confirmar com o suporte). Existe a **API de Orders + Point** (Smart 1/2, Pro 2): o servidor cria o pedido e a maquininha Point o carrega sozinha. Funciona da web, mas exige leitor Point, não o celular.
  - **Stone, PicPay, InfinitePay:** ainda não pesquisados em detalhe.
  - **Comparativo:** PagBank Tap On = celular, só com app Android de apoio + parceria; Mercado Pago Point + Orders = leitor físico, web ok; Pix (PagBank ou outro com webhook) = celular do cliente, web ok, sem app nativo.
- **Próximos passos propostos (aguardam aprovação):** (1) Pix com PagBank em sandbox + webhook (o primeiro a fazer: dá para a web); (1b) o usuário solicita a parceria do Tap On à PagBank com a conta da Casa (a aprovação demora); (2) testar com a conta PagSeguro do usuário reativada; (3) cartão: confirmar modelo da maquininha e comparar SDKs das outras operadoras; (4) desenho técnico único para Batuara e ComandaFácil. Nenhuma credencial de operadora foi pedida ou gravada.

### Handoff — 2026-11-09 (Comanda digital + comanda de papel)

- **Agente/dev:** Claude Code (Sonnet 5.5)
- **Branch:** `master` (último commit publicado `3d8399c`; CI, CD e health ok)
- **Itens movidos para `done`:** comanda de papel por foto com OCR (3 tentativas, esqueleto, falha com "Tentar ler novamente"/"Digitar sem foto"/"Voltar"); digitação manual com cardápio, busca, paginação, item fora do cardápio; busca no cardápio do cliente; QR de mesa assinado (HMAC, `BingoMesaSignature`, cliente não troca a mesa); aba "Mesas" e aba "Ler Comanda" (antes de "Saída") no garçom; total vendido/pago unificado (Painel e Resumo; "Em aberto" só digital); cards mobile da comanda fotografada; cancelar evento inteiro (só sem lançamentos, nunca o de teste); forma de pagamento "Não identificado"; OCR tenta ler a forma de pagamento escrita no fim da comanda (`MatchPaymentMethod`) e pré-seleciona.
- **Validações executadas:** `dotnet test --filter Bingo` (90 ok), `tsc --noEmit` nos dois frontends, testes do PublicWebsite (13 ok), deploy OCI verificado.
- **Arquivos tocados:** `ComandaFoto.cs`, `ComandaFotoService.cs`, `ComandaFotoController.cs`, `BingoGarcomController.cs`, `BingoPublicController.cs`, `BingoMesaSignature.cs`, `BingoAdminService.cs`, `BingoServiceTests.cs`; PublicWebsite `pages/comandaFoto/*`, `pages/bingo/BingoCustomerPage.tsx`; AdminDashboard `components/comandaFoto/*`, `pages/BingoWaiterPage.tsx`, `pages/BingoPage.tsx`, `pages/BingoExitPage.tsx`.
- **Não commitado / cuidado:** `docs/PRD-COMANDA-DIGITAL-MULTITENANT.md` (RF-F7/F7b e "Não identificado") e esta seção. O fluxo comanda-foto está **duplicado** no Admin (`components/comandaFoto`) e no Public (`pages/comandaFoto`): corrigir nos dois. Sem migration nova (status do evento é string). Esperar o deploy terminar antes de novo push; CI pode falhar por indisponibilidade do GitHub (rodar de novo).
- **Próximo item sugerido:** validar o OCR da forma de pagamento com foto real e ajustar a regra 7 do prompt; depois RF-M6 (Admin lista/imprime QR assinado de todas as mesas) e unificar o fluxo duplicado.
- **Bloqueios novos:** nenhum. Lembretes: revogar a chave Anthropic usada antes; evento real "Bingo" (07/11/2026) está Suspenso; evento "Teste" está Aberto (usar "Zerar" antes de testes reais). Produto derivado: `/home/guelfi/Projetos/ComandaFacil` (PRD e HANDOFF); Kimi só lá, Batuara fica com Gemini.

### 6.2 Template (copiar para próxima sessão)

```markdown
### Handoff — YYYY-MM-DD

- **Agente/dev:**
- **Branch:**
- **Itens movidos para `doing` / `done`:**
- **Validações executadas:** (build, test, E2E, deploy)
- **Arquivos tocados:**
- **Não commitado / cuidado:**
- **Próximo item sugerido:**
- **Bloqueios novos:**
```

### 6.3 Checklist mínimo antes de marcar `done`

- [ ] Build/testes relevantes passando
- [ ] Validação manual ou E2E do critério de aceite
- [ ] Docs tocados atualizados (`STATUS-PROJETO` se módulo mudou)
- [ ] Este arquivo atualizado (status + changelog §7)
- [ ] Sem secrets/arquivos temporários no commit

---

## 7. Changelog deste plano

### 2026-11-10 (conferência das 82 comandas de papel contra o sistema)

- **Resultado:** as 82 fotos do evento "Bingo" (07/11/2026) estão lançadas, 82 números distintos, **82 comandas ativas, R$ 6.816,00** (antes da conferência: R$ 6.853,00). Pasta única `~/Downloads/Bingo Batuara - Comandas` (`comanda-NN.jpg`, 82 arquivos; 90 e 91 = as duas sem número). A releitura das 82 fotos pelo leitor serviu só para achar o que faltava; o leitor erra totais (ignora "Batidas" escrito à mão, confunde marcas), então a verdade é a soma das marcas da coluna QUANTIDADE.
- **Acessos usados (autorizados pelo usuário):** leitura e escrita pontual no banco de produção por SSH (`batuara-net-db`, schema `batuara`), sempre em transação e com cópia da linha antiga em arquivo local.
- **Correções no banco:** comandas "sem identificação" (Id 26 e 27) renumeradas 1→90 e 3→91 para liberar os números reais; Clecia 33→3; Roberto Longardi B1→81; Ricardo (01) e Pedro (33) lançados pelo Comanda-Foto; comanda 18 (Beti) de R$ 194 para **R$ 157** (sem Cachorro-quente, 5 Cartelas avulsas). Comandas 70 e 73 ficam como o usuário registrou (cobradas juntas; possível erro de cobrança, diferença de R$ 7 na 70).
- **Cardápio:** "Batida"/"Batidas" unificadas em "Batidas" em 23 comandas (o Resumo mostra uma linha só, 35 unidades); excluídos os itens "Batidas" duplicado (Id 35), "ITEM NÃO IDENTIFICADO" (34) e "DIFERENÇA DE COBRANÇA" (36). As linhas "ITEM NÃO IDENTIFICADO" (R$ 21, comanda 59) e Gorjeta (R$ 20, comanda 39) continuam nas comandas e entram no Resumo como itens normais (o resumo agrupa por **nome**, não por Id de cardápio).
- **Regra confirmada:** valor escrito ao lado de "Batidas" é o preço; sem marca na coluna QUANTIDADE não há consumo (comandas 40, 58 e 80 ficam em R$ 0,00). As demais comandas de R$ 0,00 também são sem consumo.
- **Botão Encerrar (evento):** bloqueia novos pedidos e o Comanda-Foto (só usa evento aberto); Resumo e Fechamento continuam; comandas digitais pagas são anonimizadas após 30 dias (não pagas, 90); reversível por "Reabrir" se não houver outro evento aberto. O evento "Teste" só suspende.
- **ComandaFácil:** a documentação do produto foi movida para `/home/guelfi/Projetos/ComandaFacil/docs/` (PRD, HANDOFF, INFRAESTRUTURA, SUGESTOES-PRD S1 a S11). Continua valendo: não editar PRD/HANDOFF por esta sessão.

### 2026-11-10 (atualização automática do Resumo e das Comandas Foto)

- `Resumo` e `Comandas Foto` (Admin, `BingoPage.tsx`) recarregam sozinhos a cada 10 s (`REFRESH_MS`) e ao voltar para a aba do navegador, sem spinner nem mensagens de erro nas atualizações automáticas (`load(silent)`). O Painel ao vivo já atualizava a cada 4 s e Garçons a cada 15 s.

### 2026-11-10 (correções do lote e da confirmação de itens)

- **HTTP 413 no lote:** o `server` de `www.batuara.org.br` no `nginx-proxy` da OCI (`/var/www/nginx/nginx.conf`, compartilhado com outros projetos) não define `client_max_body_size`, então vale o padrão de 1 MB; duas fotos de ~700 KB estouram. Mitigação no app: as fotos que vão no lote são reduzidas (lado maior 1000 px, JPEG 0,6). **Feito em 10/11 (aprovado pelo usuário):** `client_max_body_size 20m;` no `server` de `www.batuara.org.br` em `/var/www/nginx/nginx.conf` na OCI, com backup `nginx.conf.bak-20261110-batuara-body`, `nginx -t` ok e `nginx -s reload`; a mudança **não é versionada** no repositório (refazer se o arquivo for regenerado). Cabe o lote de até 10 comandas.
- **409 ao confirmar item do Cardápio:** o prompt da leitura listava o cardápio com "(confirmar)" e o modelo devolvia o nome com a marca, que era gravado na comanda (e criava "X (confirmar) (confirmar)"), travando o item como "já usado". Agora o prompt e a lista da comanda usam o nome sem a marca, `StripConfirm` remove todas as marcas, o servidor limpa o nome dos itens ao salvar e **tirar a marca é sempre permitido**. Itens duplicados com marca dupla já existentes no Cardápio podem ser excluídos à mão. 97 testes de backend.

### 2026-11-10 (cota do Gemini resolvida e diálogo de pagamento)

- **429 resolvido:** o log da produção mostrou `GenerateRequestsPerDayPerProjectPerModel-FreeTier` (cota diária do nível gratuito). O usuário ligou o faturamento no "Projeto Batuara" do AI Studio (chave `…N68g`): agora **Nível 1, pré-pago, R$ 120,00 de crédito, recarga automática desativada**. A leitura voltou a funcionar. Conferir saldo em "Gasto"/"Faturamento" antes de cada evento grande; sem saldo, a leitura por foto para.
- Diálogo de pagamento (`PaymentPicker`): total em destaque (grande) e, com mais de uma comanda, lista com o valor de cada uma antes do total.

### 2026-11-10 (429 do Gemini e fechamento de várias comandas juntas)

- **429 (quota do Gemini):** a causa foi a cota do modelo `gemini-3-flash-preview`; o usuário aumentou a cota no Google AI Studio e voltou a funcionar. **Kimi não entra** (decisão de 10/11: tentar primeiro a cota). No código: o servidor tenta de novo (até 3 chamadas, espera de 2–5 s, respeita `Retry-After`) em 429/5xx, e a mensagem distingue "limite de uso" (`ocr_quota`) de "serviço instável".
- **Várias comandas, um fechamento:** `POST /api/comanda-foto/lote` (`SaveBatchAsync`, tudo ou nada, até 10 comandas): cada comanda segue separada (número, itens, foto, total), o pagamento é único (uma ou mais formas; soma = total geral) e repartido em ordem entre elas (`BingoPaymentSplit.Allocate`); número repetido no lote ou já fechado recusa tudo. `SaveAsync` virou o caso de 1 comanda do mesmo código. Front (foto, celular e Admin): botão "+ Outra comanda no mesmo pagamento", lista "Comandas para fechar juntas" com remover, "Fechar N comandas". Fora do lote: digitação manual (`ComandaManual`) ainda fecha uma por vez. 96 testes de backend.
- **Caso real:** comanda 73 (Luana) com item de ajuste de R$ 48 estava errada; era a 70 (Prof Lu) também paga por ela. Correção: cancelar a 73 no Dashboard e relançar 73 + 70 juntas pelo lote. Conferir no Cardápio se o item de ajuste virou "(confirmar)" e excluir.

### 2026-11-10 (teste do Admin consertado e no CI)

- `EventsPage.mobile.test.tsx` não rodava: `TextEncoder` ausente no Jest do `react-scripts` 5 (x-data-grid) e módulos ES (`date-fns`, `@mui/x-*`) sem transpilar. Corrigido com polyfill em `setupTests.ts` e `jest.transformIgnorePatterns` no `package.json` do Admin; 2 testes passam. O job `build-admin-dashboard` do CI agora roda `npm test` antes do build.

### 2026-11-10 (Bingos como aba de Agenda e Eventos)

- O item **Bingo** saiu do menu lateral. `/agenda` ganhou as abas **Bingos** (`?aba=bingos`, a `BingoPage`) e **Bazares** (`?aba=bazares`, só um aviso "em breve"). `/bingo` redireciona para `/agenda?aba=bingos`. Nas duas abas o menu lateral recolhe sozinho e volta ao sair (`AdminLayout`), e o conteúdo usa a largura toda. No celular as abas rolam na horizontal. O garçom (`/bingo-garcom`) não muda. O teste preexistente `EventsPage.mobile.test.tsx` falha com `TextEncoder is not defined` (já falhava antes).

### 2026-11-10 (itens novos da comanda entram no cardápio; QR da Comanda Foto)

- Botão **QR Code** em Comandas Foto (Admin): abre o QR do link `comanda-foto?t=<token>` (o token é global e a tela grava no evento aberto).
- Ao salvar comanda de papel (foto ou manual), item fora do cardápio com valor > 0 é criado no cardápio do evento aberto com o nome **"<nome> (confirmar)"** (disponível). A comanda guarda o nome sem a marca (`StripConfirm`), então o relatório por item não se parte. Nome igual ou parecido (distância de edição ≤ 1; ≤ 2 em nomes longos) a um item existente não cria: fica "Fora do cardápio" para o usuário decidir. `ComandaFotoDto.AddedToMenu` traz o que foi criado; as 4 telas mostram um aviso. No Admin, Cardápio mostra esses itens em **vermelho com fundo amarelado** até o Admin confirmar (ícone de confirmar tira a marca, ou editar o nome). Limite: depois de confirmado/renomeado, o item fica travado por já estar usado. Sem migração. 95 testes de backend.

### 2026-11-10 (seleção de formas de pagamento por caixas)

- `PaymentPicker` (cópias Public/Admin) trocado por lista com **caixa de seleção por forma**: vêm marcadas as formas lidas pelo OCR; marcando mais de uma, cada uma ganha seu valor, a última recebe o restante e "Confirmar pagamento" só habilita com a soma exata. Substitui o botão "Dividir pagamento" (que deixou de existir no seletor). Pesquisa de cobrança pelo celular registrada em §6.1.

### 2026-11-13 (Bingo: controle de mesas: lugares, exclusiva e vagas ao vivo)

- **Dados:** `BingoTables` ganha `Capacity` (padrão 4) e `IsExclusive`; `BingoTabs` ganha `PartySize` (padrão 1). Migration `20261113014956_AddBingoTableSeating` + `apply_migration` idempotente em `scripts/ci/deploy-rolling.sh` (colunas com default: nada a migrar nas linhas existentes). "Copiar de" evento leva a configuração das mesas.
- **Cliente:** o formulário de abertura da comanda pergunta "Quantas pessoas?" (1 a 20, padrão 1) e envia `partySize`.
- **Admin (aba Mesas):** "Lugares e exclusividade" por mesa (lugares 1–50, checkbox Exclusiva, "Aplicar a todas", salvar), editável com o evento em andamento (`PUT /admin/mesas/configuracao`).
- **Garçom (aba Mesas):** grade ao vivo (atualiza a cada ~10 s) com o estado de cada mesa: **Livre**, **Com vaga** (quantos lugares livres), **Lotada** e **Exclusiva ocupada** (cadeado nas exclusivas), mais os ocupantes ao selecionar. Quando uma mesa fica livre ou abre vaga, aparece um aviso verde e a mesa pulsa por ~8 s ("Vagou!", "Abriu vaga!"). Escolher uma mesa (na grade ou na caixa de seleção) mostra só o card da mesa, o QR (usa a altura que sobra, inteiro, sem ampliar; a opção de ampliar saiu) e o botão "Voltar às mesas" embaixo; a caixa de seleção fica oculta enquanto os detalhes estão à vista (`WaiterMesasTab`). Endpoint `GET /garcom/mesas/status`.
- **Regras:** ocupação = soma das pessoas das comandas `Open`/`CloseRequested` da mesa; comanda paga libera. Mesa exclusiva com qualquer comanda aberta fica ocupada; compartilhada lota quando as pessoas igualam ou passam os lugares. **Só informa o garçom: não bloqueia o cliente** (decisão do usuário).
- Testes: 5 novos no backend (ocupação, status do garçom ao pagar, party size, configuração/validação/cópia, validadores) e 8 no Admin (`WaiterTablesStatus`), 1 no formulário do cliente. Conferido com Playwright no AdminDashboard real (393x700).

### 2026-11-12 (Comanda-Foto: topo com botões lado a lado, campos recolhidos, linhas compactas e fora do cardápio no fim)

- **Topo da tela:** "📷 - Fotografar Comanda" e "+ Outra comanda" lado a lado, antes de tudo; a linha "+ Outra comanda…" do rodapé foi removida. A linha de cima da lista de comandas ("Comandas para fechar juntas (n)", total e "Todas") também saiu: o **total das comandas** (soma da conta, com a quantidade de comandas) fica embaixo, junto de Fechar e Descartar, e o botão **"Todas"** passou para perto da busca, no card de itens.
- **Comanda e Nome:** com uma comanda só continuam visíveis para editar; com várias, ficam recolhidos depois de preenchidos (a informação fica no cartão da lista: número · nome · itens · total). Eles voltam a aparecer enquanto faltar número ou nome, se o número for repetido, ou ao tocar na linha da comanda aberta ("Editar número e nome").
- **Linhas do cardápio:** "descrição - valor × quantidade = total" (a fórmula completa só com quantidade > 0) e − / + só como ícones pequenos (`QtyIcons`), sem os círculos.
- **Itens fora do cardápio:** deixaram de ter seção própria e aparecem **depois dos itens do cardápio**, no mesmo carrossel, com "(fora do cardápio)", ícone para cadastrar no cardápio e para remover; "−" na quantidade 1 remove.
- **Garçom:** nome do evento à direita em destaque (fundo colorido e negrito).
- Versão única do componente: o garçom e a Comanda-Foto pública recebem tudo igual (o título e o subtítulo continuam só na página pública).
- Conferido com Playwright (site público 402x680 e 414x800; AdminDashboard real 393x700): sem rolagem de página, sem texto vazando, sem sobreposição.

### 2026-11-12 (Comanda-Foto: lista das comandas da conta, abrir/editar cada uma e "Todas")

- O painel de cima virou uma **lista vertical de todas as comandas que serão fechadas juntas**, incluindo a que está aberta (número · nome, quantidade de itens, total, lixeira), com o total da conta no título. A lista rola por dentro (3 linhas no modo compacto, 4 nas telas altas) e mantém à vista a linha da comanda aberta (`ComandaList`).
- **Tocar numa comanda da lista abre os itens dela no cardápio** para editar; a que estava aberta volta para a lista na mesma posição (a ordem não muda). A fila agora guarda quantidades e itens de fora do cardápio de cada comanda (`QueuedComanda`), não só as linhas prontas. Não troca de comanda enquanto a atual estiver sem número ou nome.
- **Botão "Todas"**: o card de itens passa a mostrar a **soma dos itens de todas as comandas** (só leitura, "× n"), agrupando itens de fora do cardápio por nome e preço (`aggregateDrafts`). Tocar numa comanda sai da soma.
- O fechamento em lote, o diálogo de pagamento e o detalhamento por comanda usam a ordem da lista.
- **Regressão corrigida (07db68c):** o tema aninhado substituía a sobrescrita de `MuiButton` do site público e os botões ficavam em MAIÚSCULAS e com o rótulo "FECHAR COMANDA SEM LANÇAMENTOS" vazando do botão no iPhone 17. Agora o tema aninhado **mantém** as sobrescritas do hospedeiro e só repõe altura mínima e padding; no modo compacto o rótulo é "Fechar sem lançamentos" e o botão corta com reticências em vez de vazar.
- Verificado com Playwright (site público em 402x640/402x700/414x800 e AdminDashboard real em 393x700): sem rolagem de página, sem texto vazando, `textTransform: none`, linha da comanda aberta visível.

### 2026-11-11 (noite: correções vindas dos celulares: comanda de evento fechado, fila e tema do Admin)

- **Comanda do cliente (QR da mesa):** o celular guardava a comanda de um evento já fechado e a tela ia direto para ela ("Pedidos do bingo fechados no momento", Cardápio desabilitado), mesmo com outro evento aberto. Agora, com a comanda guardada em evento fechado e outro evento aberto, ela é esquecida e o formulário cria uma comanda nova (`BingoCustomerPage`, `CustomerForm`). Sem evento aberto, continua indo para a comanda salva.
- **Fila de comandas na Comanda-Foto:** o painel tinha altura fixa e mostrava só a primeira; virou um carrossel com um cartão por comanda (número · nome, total, Remover), total da conta no título e a mais recente à vista. A lógica da fila já aceitava mais de duas (conferido com Playwright).
- **Linhas sobrepostas no garçom:** o tema do Admin dá `padding: 12` a todo `IconButton` e `minHeight: 48` / `padding: 8px 16px` a todo `Button`, inflando o componente compartilhado. `QtyControls` e as setas têm tamanho fixo (32 e 36 px) e a Comanda-Foto aplica um tema aninhado (`isolateHostTheme`) que repõe os tamanhos padrão do MUI. Lição: validar o componente compartilhado também no AdminDashboard, não só no site público.
- Conferido com Playwright rodando o AdminDashboard de verdade (login e API simulados) em 393x700 e 393x780: sem sobreposição, sem rolagem de página.

### 2026-11-11 (noite: Comanda-Foto com cartões de vários itens)

- A Comanda-Foto passa a usar o mesmo `MenuPagedCarousel` da comanda digital (cartões com vários itens, rolagem lateral entre cartões), com setas e "+ Item fora do cardápio" na mesma linha, embaixo. O carrossel de um cartão por item (`MenuCarousel`) foi removido; `QtyControls` e `CarouselControls` foram para `CarouselParts.tsx`.
- A faixa "Na comanda" deixou de existir para itens do cardápio: a leitura da foto incrementa a quantidade direto na linha do item, e as linhas com quantidade ficam destacadas. Os itens lidos ficam fixados no início da lista (só depois de uma leitura, até a próxima leitura ou até descartar), para não mudar de lugar enquanto se digita. Itens fora do cardápio ficam numa seção compacta acima da busca.
- Linhas de 40 px; o total mostra a quantidade de itens; removido o aviso "Foto anexada…" (o botão já diz "Fotografar Novamente").
- Conferido com Playwright em 393x590, 393x760 e 393x852 com leitura simulada: sem rolagem de página e "+ Item fora do cardápio" sempre acima das ações. Pendente: conferir no aparelho.

### 2026-11-11 (noite: comanda digital com cartões de vários itens)

- Na comanda digital do cliente, o cardápio deixou de ser um cartão por item: cada cartão agora é uma lista com vários itens (linhas com nome, preço e − qtd +), e o carrossel desliza entre cartões (`MenuPagedCarousel`, em `shared/comandaFoto`). Quantos itens cabem por cartão é calculado pela altura livre da tela (linhas de 48 px); o próximo cartão aparece pela borda; indicador "Itens a–b de N" e setas por cartão; busca mantida.
- A Comanda-Foto continua com um cartão por item (`MenuCarousel`). As setas viraram o componente `CarouselControls`, compartilhado.
- Conferido localmente com Playwright em 393x760, 393x852 e 360x600 (sem rolagem de página). Pendente: conferir no aparelho.

### 2026-11-11 (noite: Comanda-Foto em uma única tela, sem rolagem, também no garçom)

- Versão única do componente: ocupa exatamente a altura visível da tela (hook `useFillViewport`, com a viewport visual e o padding dos contêineres), sem rolagem de página. O carrossel mede a altura livre e escolhe de 1 a 3 linhas de cards; setas e "+ Item fora do cardápio" ficam na mesma linha, sob os cards. Em telas altas (>= 700 px) os botões de ação ficam empilhados e maiores; nas curtas, lado a lado. A faixa "Na comanda" encolhe e rola por dentro; a fila de comandas tem altura máxima.
- Garçom: nome (menor) à esquerda e evento à direita na mesma linha, sem a palavra "Garçom"; abas mais baixas e o bloco sobe (`mt: -1`). O subtítulo do evento só aparece na página pública. O `AdminLayout` passou a usar `100dvh` como altura mínima (no iPhone `100vh` é maior que a área visível e criava rolagem).
- Atalho "Não identificado" dentro do campo Nome (rótulo "Nome"); o campo Comanda não encolhe mais (`flexShrink: 0`), corrigindo o rótulo cortado.
- Verificação visual local com Playwright + Chrome (viewports 393x760, 393x590, 393x852 e emulação do garçom): `pageScroll` 0 em todos. Pendente: conferir no aparelho.

### 2026-11-11 (noite: carrossel na comanda digital do cliente)

- A lista paginada do cardápio da comanda digital (`BingoCustomerPage`) foi trocada pelo mesmo `MenuCarousel` da Comanda-Foto (`shared/comandaFoto`): cards com rolagem lateral, setas e indicador "Itens a–b de N", busca mantida. Como a tela tem altura fixa (sem rolagem vertical), o carrossel usa várias linhas de cards conforme a altura livre (de 1 a 4).
- `MenuCarousel` generalizado: ids em texto ou número, item esgotado ("Esgotado", sem controles), selo de já pedido "(n)", limite por item (20 na comanda digital) e rótulos de acessibilidade próprios ("Adicionar/Remover"). Altura mínima do card 112 px e nome em até 2 linhas.
- Sem mudança de API. Push direto na `master` (sem PR).

### 2026-11-11 (Comanda-Foto: tela única com cardápio em carrossel)

- Tela única: botão `📷 - Fotografar Comanda`, Número e Nome logo abaixo, faixa "Na comanda" (itens com quantidade) e cardápio em cards com rolagem lateral (`MenuCarousel`, em `shared/`) com busca. A leitura da foto preenche as quantidades no mesmo cardápio; item lido fora do cardápio fica em "Fora do cardápio". O fluxo separado "Digitar comanda" (`ComandaManual`) foi removido.
- Número e nome obrigatórios para fechar (foto, digitada ou sem lançamentos); atalho "Não identificado". Botão "Fechar comanda sem lançamentos" quando não há itens. Fila "Outra comanda no mesmo pagamento" mantida.
- Itens lidos pelo OCR que existem no cardápio passam a usar o preço do cardápio (antes valia o preço lido na foto).
- Fotografar de novo substitui os itens da comanda atual. A API não mudou.
- Reaproveitamento do `MenuCarousel` na comanda digital do cliente: feito na entrada seguinte.

### 2026-11-10 (Comanda-Foto: componente único e redução de superfície de ataque)

- Componente único em `src/Frontend/shared/comandaFoto/` (antes duplicado entre PublicWebsite e AdminDashboard). `shared/sync.js` copia para `src/_shared/` de cada app (gerado, no `.gitignore`) em `prestart`/`prebuild`/`pretest`; os Dockerfiles copiam `src/Frontend/shared` para `/shared`. Quem usa o componente passa `token` e `baseUrl`; ele não lê nem guarda token.
- Token da Comanda-Foto agora é assinado e expira (`{expiracao}.{assinatura}`, 12 h, `GoogleAI:TokenHours`); links antigos deixam de valer. Só vai no header `X-Comanda-Token` (o endpoint de foto deixou de aceitar `?t=`).
- Link do evento usa `#t=` (fragmento, não vai ao servidor/logs); a página guarda só em `sessionStorage`, apaga o token da barra de endereço e remove o legado do `localStorage`.
- Teto de leituras OCR por evento (`GoogleAI:MaxReadsPerEvent`, padrão 400, em memória) respondendo 429 `ocr_quota`.
- Chave do Google enviada no header `x-goog-api-key`, não mais na URL.
- Build com `INLINE_RUNTIME_CHUNK=false` e CSP do nginx sem `'unsafe-inline'` em `script-src` (conferir se o nginx de produção usa estes arquivos).
- Pendente (console do Google Cloud, manual): restringir a chave à API Generative Language e ao IP do servidor, definir cota diária e alerta de orçamento.

### 2026-11-09 (noite: revisão de UI do Admin desktop e Resumo mobile)

- Eventos, Painel ao vivo, Cardápio, Formas de pagamento, Resumo e Comandas Foto reorganizados no desktop; Resumo com grade e seções recolhíveis no mobile; título "Evento:". Detalhes no handoff de 2026-11-09 (noite), §6.1.

### 2026-11-09 (Bingo: comanda de papel, QR assinado, cancelar evento)

- Comanda de papel (foto/manual), QR de mesa assinado, abas "Mesas" e "Ler Comanda" do garçom, total pago unificado, cancelar evento, "Não identificado" e leitura da forma de pagamento pelo OCR (detalhes no handoff de 2026-11-09, §6.1). PRD atualizado para v1.1 (+ RF-F7b).

### 2026-11-07 (ajuste do digest diário, local)

- **Digest das 19h só com novidade (PM-049, NÃO publicado):** novo `PendingContactDigestService` + tabela `AdminDigestStates` (migration `AddAdminDigestState`, `apply_migration` já em `deploy-rolling.sh`), retry de 1h no mesmo dia e `MarkAsUnread()` na réplica do visitante nos dois webhooks. Aguardar a comanda do bingo para publicar.

### 2026-11-07 (Bingo: contestação, cancelamento e formas de pagamento, API)
- **PM-050:** novos status de item `Contested` e `Cancelled` (colunas de auditoria em `BingoOrderItems`), `total` (não cancelados), `amountDue` (entregues), `undeliveredCount`, `contestedCount` em todos os DTOs; `POST /public/comandas/{id}/itens/{itemId}/contestar`; `encerrar` com 409 `UNDELIVERED_ITEMS` e `cancelUndelivered`; garçom e admin cancelam item e resolvem contestação; admin entrega item. Formas de pagamento cadastráveis (`BingoPaymentMethods`, CRUD admin, lista ativa para o garçom); `pagar` passa a receber `paymentMethodId` (garçom e `POST /admin/comandas/pagar`; rota antiga removida), cobra `amountDue` e grava `AmountPaid`/`PaidByName`/`PaymentMethodName`; pendências bloqueiam com 409. Resumo com `byWaiter`, `byPaymentMethod` por rótulo, `cancelledTotal`, `contestedOpen`; painel com `contestedItems`/`cancelledItems`; `GET /admin/mesas/{mesa}/comandas`; `GET /garcom/contas?todas=true` (garçom fecha conta de comanda `Open`); lembrete usa `amountDue`. Migration `20261107082947_AddBingoContestationAndPaymentMethods` + `apply_migration` idempotente (testado em Postgres 15 descartável, duas execuções, com backfill de `DeliveredByName`/`AmountPaid`). Suíte: 139 testes.

### 2026-11-07 (Bingo / comandas digitais)

- **Limpeza de código morto nos frontends (pós-Bingo):** o item "Bingo" não aparecia no menu porque o agente alterou o `Sidebar.tsx`, que **não era usado**; o menu real é a lista `navigationItems` do `AdminLayout.tsx` (corrigido lá). Varredura por grafo de imports a partir de `src/index.tsx` removeu 22 arquivos sem uso (Admin: `Sidebar`, `LoadingCard`, `UserProfile`, `components/content/*` e `DashboardContent` da "Fase 0" com dados mockados, `FilhoCasaForm`, `mockFilhosCasa`, `useResponsiveChips`, `PlaceholderPage`, `PreferencesPage`, `ProfilePage`, `types/FilhoCasa`; Público: `ScrollToTopButton`, `SpiritualDetailModal`, `usePublicAuth`, `reportWebVitals`). Mantidos de propósito: `MemberContributionSection.tsx` (PM-048) e `jest-runtime.d.ts`.
- **Guarda permanente no CI:** `scripts/ci/find-unused-frontend.js` (job `unused-frontend-files`) falha se surgir arquivo de `src/` não alcançável a partir de `index.tsx`; exceções ficam na `ALLOWLIST` do script, com o motivo.

- **PM-050 (Bingo):** backend multi-evento implementado (entidades, migration `AddBingoEvents` com seed, SQL idempotente no `deploy-rolling.sh`, serviços, controllers público/garçom/admin, rate limit próprio, envio do link da comanda por WhatsApp fora do caminho crítico com limite de 1 envio por número a cada 3 min, anonimização diária de eventos encerrados há mais de 30 dias) e 40 testes unitários novos (suíte: 92 testes).
- **PM-050 (garçom sem login próprio):** removidos `POST /api/bingo/garcom/verify-code`, DTOs e a sobrecarga de `VerifyCodeAsync`. O garçom usa o login normal de filhos (cookie); `MemberAuthService.VerifyCodeAsync` emite token/cookie de 10 h (`Bingo:WaiterSessionHours`) quando o filho é garçom ativo do evento aberto, 60 min nos demais (o cookie expira junto com o token). Novo `GET /api/bingo/garcom/me` (`isWaiter`, `eventOpen`, `eventName`) para o AdminDashboard decidir o item de menu. Sem migration. Suíte: 106 testes.

- **PM-050 (retirada na cozinha):** novo status `Retrieved` entre `Pending` e `Delivered` (colunas `RetrievedByHouseMemberId`/`RetrievedAt`; `Status` já era string, sem check constraint). Endpoints `POST /api/bingo/garcom/itens/{id}/retirar` (409 "Item já retirado por {nome}"), `/devolver` e `/entregar` (qualquer escalado, a partir de Pending ou Retrieved). `GET /garcom/pedidos` lista Pending+Retrieved com `status`, `retrievedByName`, `retrievedByMe`; painel Admin ganha `counts.retrievedItems` e `retrievedByTable`; DTO público devolve `Retrieved`. Migration `20261107072248_AddBingoItemRetrieval` + `apply_migration` idempotente no `deploy-rolling.sh` (testado em Postgres 15 descartável, duas execuções). Suíte: 108 testes.

- **PM-050 (código por WhatsApp, lembrete e retenção):** `IWhatsAppService.SendAuthCodeAsync`/`SendMemberNoticeAsync` passam a devolver `Task<string>` (id da mensagem). Criação de comanda envia o código (hash, 30 min, `CodeMessageId`) em segundo plano e sem bloquear; removidos o envio do link, `reenviar-link`, `IBingoLinkDispatcher` e `Bingo:PublicBaseUrl`. Novos `POST /public/comandas/{id}/confirmar-celular` (400/429 após 5 erros) e `/reenviar-codigo` (1/60 s por comanda, 3/h por celular), `phoneVerified` no GET público, `Bingo:RequirePhoneVerificationToClose` (padrão false; 409 ao encerrar). Painel/histórico admin com `phoneVerified`, `codeDeliveryStatus/Error` e contagens. Webhook Meta processa `statuses[]` (sent/delivered/read/failed) e atualiza as comandas (sem telefone nos logs). Lembrete pós-evento: `GET .../eventos/{id}/lembretes/previa` e `POST .../lembretes/enviar` `{confirmar:true}` (`casa_aviso_filho`, 1 por comanda, ~300 ms entre envios). Retenção: pagas 30 dias, não pagas 90 dias (`Bingo:PaidRetentionDays`/`UnpaidRetentionDays`). Migration `20261107073455_AddBingoPhoneVerification` + `apply_migration` idempotente (testado em Postgres 15 descartável, duas execuções). Suíte: 123 testes.

### 2026-10-27 (templates aprovados e camada de envio)

- **"Minha contribuição" oculta na tela do filho (fase 1 = só dados cadastrais):** seção removida da `UnifiedProfilePage` e preservada em `components/member/MemberContributionSection.tsx` (não renderizada). Reativação registrada como **PM-048**.
- **`pages/MemberProfilePage.tsx` removido:** versão antiga da tela do filho, sem rota nem import (substituída pela `UnifiedProfilePage`); só aparecia numa lista de arquivos do doc de status.

- **Templates aprovados na Meta:** `casa_aniversario`, `casa_evento_convite`, `casa_aviso_filho` (Marketing) e `casa_tutorial_site` (Utilidade) estão "Ativo — Qualidade pendente".
- **Camada de envio implementada, sem gatilho:** 4 métodos novos em `IWhatsAppService`/`WhatsAppCloudApiService`/Evolution, nomes de template em `WhatsAppCloudApiOptions`, 5 testes novos (52 no total). Nada envia mensagem ainda.
- **Itens novos PM-046 e PM-047** (campanha "site liberado" e link do tutorial), só planejados no §6.2-A; envio depende de decisões do dono do produto e de opt-in.

### 2026-10-26 (tutorial dos filhos e templates Meta)

- **Tutorial de acesso dos filhos publicado** em `/tutorial.html` (`82b1a57`, `6607f58`), com textos revisados e desenho do WhatsApp alinhado à mensagem real.
- **4 templates enviados à Meta** (`casa_aniversario`, `casa_evento_convite`, `casa_aviso_filho`, `casa_tutorial_site`); aprovados em 27/out, detalhes no §6.1.

### 2026-10-25 (reordenação de fila e PM-041/PM-042/PM-040)

- **PM-040 concluído (em produção, `3f640c7`):** webhook Meta abre `ContactMessage` para mensagem de visitante sem thread (decisão: opção A, sem limite diário, mídia fora do escopo, frase na política de privacidade). 4 testes novos (47 no total); `InternalsVisibleTo` p/ `Batuara.Infrastructure.Tests`. Validado com mensagem real.
- **Fila reordenada (§4):** PM-025 e PM-031 passaram ao final da fila ativa — as alterações implementadas desde a última ordenação (endurecimento de segurança) melhoraram de forma significativa os itens relacionados a segurança; PM-041 e PM-042 passaram a ser os próximos passos.
- **PM-041 concluído (em produção, `3946662`):** logs da API persistidos em volume Docker (`batuara-api-logs` → `/app/logs`; sink Serilog File já configurado com rolling daily) — antes viviam no FS efêmero do container e se perdiam a cada deploy/recreate.
- **PM-042 concluído (em produção, `3946662`; Evolution recriada na OCI com `docker compose -f docker-compose.whatsapp.yml up -d`, volumes intactos — 37 tabelas, 3 instâncias):** `api` sobe com `depends_on: db: condition: service_healthy`; Evolution API com healthcheck (Node fetch `/health`) e dependências `service_healthy`; Evolution Redis com healthcheck (`redis-cli ping`); Evolution Postgres mantém `pg_isready`. **Correção na revisão:** o healthcheck da Evolution usava `/health`, que devolve 404 na imagem em produção (testado na OCI); passou a usar `/` (200). Na OCI, 28 de 38 containers têm healthcheck; dos 10 sem, só `batuara-evolution-api` e `batuara-evolution-redis` são do Batuara (cobertos aqui); os demais são de outros projetos (guelfiness, unisystem, driverhub, hako, pet360, nginx-proxy, allugme-redis, barbear-ia-redis), fora do escopo deste repositório. Observação: `bela360` e `pet360` (Evolution) nunca foram pareados e ficam em `connecting` aguardando QR; não é regressão. O compose da Evolution é aplicado à mão na OCI (não passa pelo `deploy-rolling.sh`); rodar o `up` sem env exportado mostra avisos de `POSTGRES_*` em branco, mas o Postgres sobe normalmente porque o volume já está inicializado.
- **PM-007 e PM-038 → `done`:** digest de pendências validado em produção; o Douglas confirmou o recebimento na sexta, 23/10/2026. Aprovação dos templates conferida no WhatsApp Manager (WABA `1400706312217668`) em 25/out: `casa_login_code`, `casa_pendencias_aviso_v3`, `casa_contact_reply` e `casa_contribution_reminder` aprovados. Aviso da Meta sobre reclassificação para marketing conferido: afeta só 4 templates de teste/legado, sem uso (ver §6.1).

### 2026-10-23 (infra OCI, AutoMapper e logs)

- **PM-025 fase 4:** chaves SSH separadas por projeto (10 repositórios) + chave pessoal nova; chave antiga revogada. Regressão corrigida no caminho: `fail2ban` aggressive banindo runners do GitHub → `normal`. Validação por workflow temporário em cada repo (branch `ssh-key-check`, removida depois).

- **PM-025 → `doing` (fases 1–3):** `sshd` endurecido, `fail2ban` ativo (3 IPs banidos logo no início), `rpcbind` desligado, regras ufw 8001–8003 removidas. 38/38 containers e domínios seguem no ar; login SSH conferido em nova sessão antes de fechar a anterior.

- **PM-043 → `done`:** chaves do Data Protection persistem em volume Docker; sobrevivem a deploy/restart. Antiforgery/CSRF dedicado continua adiado (ver PM-045).

- **PM-045 → `done`:** tokens fora do corpo das respostas de login/refresh/verify-code em produção e cookies `SameSite=Strict`. Logins Admin e Filho validados em produção após o primeiro deploy.

- **PM-024 → `done`:** removido o fallback de token em `localStorage` do Admin; sessão só por cookies httpOnly. Obs.: a única suíte do Admin (`EventsPage.mobile.test.tsx`) já falhava antes por `TextEncoder is not defined` no Jest — dívida de testes (PM-023).

- **PM-005 → `done`** (commit `ec159ae`): deploy de migrations falha ruidosamente e com transação; guarda de drift código × histórico. Aplicou em produção a `UnifyDescriptionFields` (pendente desde junho): 12 Orixás e Linhas de Umbanda com textos unificados em `Description`, colunas antigas removidas.

- **AutoMapper removido** (commit `b5fa2ac`): `User → UserDto` agora é `ToDto()` manual (`UserMappingExtensions`) com 2 testes; `MappingProfile` e o pacote saíram; aviso de licença comercial eliminado. 35 testes passam. Logins Admin e Filho da Casa (OTP WhatsApp) validados em produção.
- **Log de refresh token corrigido:** `AuthService.GetUserByRefreshTokenAsync` não grava mais o valor do token no aviso "Refresh token not found or not active".
- **OCI redimensionada (Always Free):** 2 OCPU / 12 GB RAM / boot volume 100 GB (limite do edit-in-place; máx. Free Tier 4 OCPU/24 GB e 200 GB). Disco em 14% de uso (85 GB livres) após limpeza de imagens antigas, CLIs antigos (Claude/Codex), `.nvm` e `node-gyp`.
- **Higiene do Ubuntu 22.04.5:** pacotes atualizados e reboot; 38/38 containers voltaram. `allugme-api` e `barbear-ia-api` ficaram `unhealthy` por corrida com o banco no boot (reiniciados). Backup das fontes apt em `~/backup-apt-sources-20261023` no servidor.
- **Digest de pendências:** `casa_pendencias_aviso_v3` aprovado e digest validado (recebimento confirmado pelo Douglas em 23/10); todos os templates em uso aprovados. Fluxo de resposta do Admin ao contato validado.

**Novos itens derivados (não iniciados):**

| ID | Status | Item | Notas |
|----|--------|------|-------|
| PM-041 | `done` | **Logs da API fora do container** | Logs somem a cada deploy. **Código pronto (25/out):** volume `batuara-api-logs` → `/app/logs` (retenção já limitada no Serilog: 30/60/90 arquivos). **Em produção e validado (25/out, `3946662`):** volume `batuara-api-logs` montado, `batuara-YYYYMMDD.log` e `security-*.log` gravados no volume (lidos por um container descartável). |
| PM-042 | `done` | **Healthchecks e `depends_on` na OCI** | 10 containers sem healthcheck (incl. Evolution API); compose de `allugme`/`barbear-ia` com `depends_on: service_healthy` no banco. **Código pronto (25/out):** api (`db` healthy), Evolution API (healthcheck em `/`) e Evolution Redis. Os outros containers sem healthcheck são de outros projetos. **Em produção e validado (25/out):** api, Evolution API e Evolution Redis `healthy`; nenhum container `unhealthy`. |
| PM-043 | `done` | **Persistir chaves de Data Protection** | ✅ Concluído em 23/out (commit `f47a387`): `AddBatuaraDataProtection` com `DataProtection:KeysPath`; compose de produção monta o volume `batuara-dataprotection-keys` em `/app/dp-keys`. Verificado na OCI: chave gravada no volume e mantida após restart do container. Residual: chaves em repouso sem criptografia (aviso "No XML encryptor"; volume acessível só ao root) — avaliar certificado se passar a proteger dados sensíveis. |
| PM-044 | `todo` | **Ubuntu 24.04 / Pro e Node 18 NodeSource** | Exige backup do boot volume; trocar Node 18; atualizar Gemini CLI. |

### 2026-10-23

- **PM-020 → `done`:** migração para .NET 10 em produção (runtime 10.0.13 na OCI). CI/CD verdes, `/health` Healthy, CORS e rotas de auth conferidos. Acabamento: pacotes `Microsoft.*` em 10.0.13, aviso CS0105 e NU1510 eliminados, `gitleaks-action@v3` (Node 24, `GITLEAKS_CONFIG`) e `ubuntu-24.04` fixado nos workflows.
- **PM-003 → `done`:** CORS fail-closed fora de Development (sem fallback `AllowAnyOrigin()`), origins de produção em `appsettings.json` e lista local em `appsettings.Development.json` (commit `54c4cd0`). Corrige também a aceitação indevida de origins `localhost`/LAN em produção (antes herdadas do `appsettings.json` base).

### 2026-08-17

- **PM-036 → `done`:** corrigido incidente de produção em que `https://batuara.org.br` (sem `www`) carregava tela em branco — causa raiz era uma regra de roteamento de outro projeto (Allugme) compartilhando o mesmo `nginx-proxy` na OCI. Ver detalhes na linha PM-036 da §3 e no arquivo atualizado `scripts/oracle/nginx-proxy.nginx.conf`.

### 2026-08-03

- Criado como documento único de melhorias e handoff.
- Absorvidas pendências de: análises na raiz, ROADMAP (5.3 / 6.3–6.4), STATUS/TASK_HISTORY, plano COR Admin, Resumo de testes, priorização consolidada, e item .NET 10 da discussão atual.
- Removidos documentos ultrapassados listados na §5.
- **PM-001 → `done`:** domínio/HTTPS já operacionais em `https://www.batuara.org.br/` (docs antigos ainda falavam em “aguardando domínio”).
- **PM-002 → `cancelled`:** Swagger não será fechado em produção (decisão de produto).

---

## 8. Itens concluídos (arquivo curto)

| ID | Concluído em | Notas |
|----|--------------|-------|
| PM-001 | 2026-08-03 (reconhecido) | `https://www.batuara.org.br/` com TLS/HSTS; health API Healthy |
| PM-002 | 2026-08-03 (cancelled) | Swagger permanece aberto em produção — decisão de produto |
| PM-003 | 2026-10-23 | CORS fail-closed fora de Development; origins de produção explícitas (commit `54c4cd0`) |
| PM-043 | 2026-10-23 | Chaves de Data Protection persistidas em volume (commit `f47a387`) |
| PM-045 | 2026-10-23 | Sessão do Admin: sem tokens no corpo + `SameSite=Strict` |
| PM-024 | 2026-10-23 | Legado `localStorage` de tokens removido do Admin |
| PM-005 | 2026-10-23 | Migrations do deploy sem erro silencioso + guarda de drift (commit `ec159ae`) |
| PM-020 | 2026-10-23 | Upgrade .NET 8 → 10 em produção (commit `12e77c9` + acabamento) |
