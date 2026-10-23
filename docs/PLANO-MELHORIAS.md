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
| PM-005 | `todo` | **Validar migrations no deploy OCI** | Step 3.5 do `deploy-rolling.sh` aplica SQL ad-hoc **com erros suprimidos** (`> /dev/null 2>&1`) — falha de migration passa invisível e corrompe deploy. Revisar para falhar ruidosamente e confirmar migrations aplicadas. |
| PM-006 | `cancelled` | ~~**Revisar logs Evolution API**~~ | ❌ Reescopo (22/out): `batuara-casa` desconectada e Batuara 100% na Meta Cloud API — Evolution só serve outros projetos. Se necessário, reabrir como "revisão de PII nos logs da API Batuara". |
| PM-007 | `doing` | **Canal WhatsApp oficial da Casa (Meta Cloud API)** | **EM PRODUÇÃO**: OTP de login sai do número oficial `+55 11 94067-7714` via Meta Cloud API (validado E2E, commit `1becc37`). Empresa verificada; `casa_login_code` (AUTHENTICATION) aprovado; app Meta publicado. Evolution `batuara-casa` desconectada — número pessoal liberado (Evolution segue na OCI para outros projetos). Webhook Meta deployado (`/api/webhooks/whatsapp-meta`, commit `7faff76`), verificado, campo `messages` assinado, app inscrito na WABA e PMA `1400706312217668` — mensagens reais de visitantes entregues e processadas (validado 22/out). **Fluxo de contato bidirecional validado E2E em produção (22/out)**: visitante envia formulário com opt-in WhatsApp → admin responde no AdminDashboard → texto livre entregue na janela 24h (grátis, sem template, commit `8efbf09`) → réplica do visitante anexada na thread via webhook e exibida no dashboard. Webhook agora valida `X-Hub-Signature-256` quando `WhatsApp:AppSecret` configurado (commit `11919b6`). Digest diário 19h (SP) notifica admin via WhatsApp c/ contagem de pendências (`casa_pendencias_aviso_v3`, commit `11919b6`). `casa_contribution_reminder` (UTILITY) **APROVADO**; pendente: `casa_contact_reply` e `casa_pendencias_aviso_v3` (ambos em revisão) p/ envios fora da janela 24h. |
| PM-008 | `todo` | **Decidir ativação dos lembretes de contribuição** | `ContributionReminders.Enabled=false` em prod até OK explícito do dono do produto. **Destravado**: template `casa_contribution_reminder` (UTILITY) aprovado pela Meta e send-time 10h00 SP configurável — basta setar `CONTRIBUTION_REMINDERS_ENABLED=true` no `.env.whatsapp` e redeploy. (Controle operacional — decisão, não implementação.) |
| PM-040 | `todo` | **Inbox p/ WhatsApp de visitante sem thread** | Mensagens recebidas no número oficial sem `ContactMessage` ativa são descartadas após log ("nenhuma mensagem de contato ativa") — visitante fala e ninguém vê. Opções: notificar Douglas dessas soltas (incluir no digest) ou listar numa inbox do Admin. |
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
| PM-020 | `doing` | **Upgrade .NET 8 → .NET 10** | TFM `net10.0`, pacotes EF/Npgsql/JWT alinhados 10.x, Docker `sdk/aspnet:10.0`, CI `10.0.x`, fix `KnownNetworks`→`KnownIPNetworks`. EOS .NET 8: 2026-11-10. |
| PM-021 | `todo` | **Trilha de auditoria (EP-Audit)** | Registro consultável de create/update/delete e ações sensíveis; sem dados sensíveis em log. Ref.: histórias H-060/H-061 no Backlog. |
| PM-022 | `todo` | **APM / monitoring além de health** | Métricas/alertas em produção (ex.: Prometheus+Grafana ou APM equivalente no Always Free). |
| PM-023 | `todo` | **Expandir testes automatizados** | Mais unit/integration backend + testes React críticos (auth, SiteSettings, membros). |
| PM-024 | `todo` | **Tokens Admin: remover legado localStorage** | HttpOnly cookie já é o caminho primário (refresh + access em cookie). Falta remover o fallback legado `localStorage`/`access_token` marcado como transicional no `authService.ts` — redução de superfície XSS, quase pronto. |
| PM-025 | `todo` | **SSH hardening OCI** | Avaliar Bastion/VPN; hoje `22` público por falta de IP fixo. |

### P3 — Evolução de produto

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-030 | `todo` | **Inscrição pública em calendário (H-011)** | Vagas, idempotência, rate limit; escopo grande — só após P0/P1 estáveis. |
| PM-037 | `done` | **Conformidade LGPD no PublicWebsite** | Página `/politica-de-privacidade` (controlador, dados, finalidades, compartilhamento Meta/Google, retenção, direitos Art. 18), banner de consentimento de cookies (necessários x terceiros, localStorage + evento de preferências), mapa do Google só carrega após opt-in, links no rodapé e nota no formulário de contato (commit `11919b6`). ✅ Operacional concluído: URL `/politica-de-privacidade` configurada no app Meta e `META_APP_SECRET`/`ADMIN_NOTIFICATION_*` aplicados no servidor (22/out). |
| PM-038 | `doing` | **Notificação WhatsApp de pendências ao admin** | Hosted service diário (19h SP) conta `ContactMessage` Nova/EmAtendimento e envia template `casa_pendencias_aviso_v3` ao número em `AdminNotification:Phone` (commit `11919b6`). Env vars aplicadas no servidor (22/out); **aguarda só a aprovação do template na Meta**. |
| PM-039 | `done` | **Mobile AdminDashboard — lista de mensagens compacta** | Colunas: envelope (vermelho não lida / azul lida), nome, assunto, semáforo WhatsApp (amarelo pendente / verde respondida / cinza não solicitou), data, status; clique na linha abre atendimento (commit `11919b6`). |
| PM-031 | `todo` | **MFA (TOTP)** | Login admin com MFA opcional/obrigatório. |
| PM-032 | `todo` | **WAF / SIEM básico** | Proteção de borda + correlação de logs. |
| PM-033 | `todo` | **Cache de endpoints públicos** | In-memory/Nginx; Redis só se volume justificar. |
| PM-034 | `todo` | **API versioning consistente** | Política única (URL ou header) documentada. |
| PM-035 | `todo` | **a11y + i18n (PublicWebsite)** | Acessibilidade e eventual internacionalização. |

---

## 4. Ordem recomendada de execução

Revisão completa realizada em **2026-10-22** após a migração Meta Cloud API. Critério: urgência ponderada por segurança primeiro, depois deadline fixo, confiabilidade operacional, qualidade e produto.

### Fila repriorizada

1. **PM-020** — Upgrade .NET 8 → .NET 10 *(deadline fixo: EOS 10/nov/2026)*
2. **PM-005** — Migrations no deploy sem erro silencioso *(confiabilidade: falha hoje passa invisível)*
3. **PM-024** — Remover auth legado `localStorage` *(segurança; httpOnly cookie já é primário — só cleanup)*
4. **PM-040** — Inbox p/ mensagens WhatsApp sem thread *(gap de produto: mensagens de visitantes se perdem)*
5. **PM-008** — Decisão: ativar lembretes de contribuição *(destravado — template `casa_contribution_reminder` aprovado)*
6. **PM-004** — E2E contribuição recorrente *(fazer junto da decisão PM-008)*
7. **PM-021** — Trilha de auditoria *(base também p/ LGPD)*
8. **PM-010 → PM-016** — Lote de débitos do plano de testes Admin *(qualidade)*
9. **PM-022, PM-025, PM-023** — APM, SSH hardening, cobertura de testes
10. **PM-030 → PM-035** — Evolução de produto (inscrição calendário, MFA, WAF, cache, a11y/i18n)

### Encerrados / sem ação

- **PM-003** — ✅ *done* — CORS fail-closed e origins explícitas (commit `54c4cd0`)
- **PM-006** ❌ *cancelled* — Evolution fora do fluxo Batuara; reescopar se necessário
- **PM-007** — Concluído operacionalmente; residual = aprovação de `casa_contact_reply` e `casa_pendencias_aviso_v3` (Meta, automático via webhook `message_template_status`)
- **PM-037, PM-039** — ✅ done
- **PM-038** — Implementado; residual = mesma aprovação do `casa_pendencias_aviso_v3`

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
| Data | 2026-10-23 |
| Branch | `master` (PM-003 concluído no commit `54c4cd0`; deploy/validação acompanhados na entrega) |
| Em andamento (`doing`) | — |
| Próximo item sugerido | **PM-020** (.NET 10, EOS 10/nov) |
| Bloqueios ativos | — |
| Ambiente | Produção em `https://www.batuara.org.br/`; lembretes WhatsApp desligados; Swagger permanece público por decisão |
| Riscos | EOS .NET 8 em 2026-11-10 |

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

### 2026-10-23

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
