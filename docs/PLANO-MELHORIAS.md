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
| PM-003 | `todo` | **CORS estrito em produção** | Sem fallback `AllowAnyOrigin()` quando `CorsSettings:AllowedOrigins` estiver vazio em Production; Development com origins locais explícitas. |
| PM-004 | `todo` | **E2E manual — contribuição recorrente** | No Admin: criar contribuição recorrente → marcar paga → confirmar geração do mês seguinte; documentar resultado na planilha/PlanoTestes. |
| PM-005 | `todo` | **Validar migrations no deploy OCI** | Confirmar Step 3.5 do `deploy-rolling.sh` aplica migrations (ex.: `AddMemberLoginCodes`, `AddRecurringContributionAndWhatsAppContact`) sem erro silencioso. |
| PM-006 | `todo` | **Revisar logs Evolution API** | Sem PII/segredos em logs; config pronta antes de ativar lembretes. |
| PM-007 | `blocked` | **Chip WhatsApp dedicado da Casa** | Substituir número temporário `5511975747470`. **Bloqueio:** aguarda chip/dispositivo da Casa. |
| PM-008 | `todo` | **Manter lembretes desligados até decisão** | `ContributionReminders.Enabled=false` em prod até OK explícito do dono do produto. (Controle operacional — não “implementar”, e sim **não ativar**.) |

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
| PM-020 | `todo` | **Upgrade .NET 8 → .NET 10** | TFM `net10.0`, pacotes EF/Npgsql/JWT alinhados 10.x, Docker `sdk/aspnet:10.0`, CI `10.0.x`, fix `KnownNetworks`→`KnownIPNetworks`. EOS .NET 8: 2026-11-10. |
| PM-021 | `todo` | **Trilha de auditoria (EP-Audit)** | Registro consultável de create/update/delete e ações sensíveis; sem dados sensíveis em log. Ref.: histórias H-060/H-061 no Backlog. |
| PM-022 | `todo` | **APM / monitoring além de health** | Métricas/alertas em produção (ex.: Prometheus+Grafana ou APM equivalente no Always Free). |
| PM-023 | `todo` | **Expandir testes automatizados** | Mais unit/integration backend + testes React críticos (auth, SiteSettings, membros). |
| PM-024 | `todo` | **Tokens Admin: reduzir risco XSS** | Avaliar HttpOnly cookie para access token (hoje localStorage). Decisão de produto + implementação. |
| PM-025 | `todo` | **SSH hardening OCI** | Avaliar Bastion/VPN; hoje `22` público por falta de IP fixo. |

### P3 — Evolução de produto

| ID | Status | Item | Critério de aceite / notas |
|----|--------|------|----------------------------|
| PM-030 | `todo` | **Inscrição pública em calendário (H-011)** | Vagas, idempotência, rate limit; escopo grande — só após P0/P1 estáveis. |
| PM-031 | `todo` | **MFA (TOTP)** | Login admin com MFA opcional/obrigatório. |
| PM-032 | `todo` | **WAF / SIEM básico** | Proteção de borda + correlação de logs. |
| PM-033 | `todo` | **Cache de endpoints públicos** | In-memory/Nginx; Redis só se volume justificar. |
| PM-034 | `todo` | **API versioning consistente** | Política única (URL ou header) documentada. |
| PM-035 | `todo` | **a11y + i18n (PublicWebsite)** | Acessibilidade e eventual internacionalização. |

---

## 4. Ordem recomendada de execução

Trabalhar **de cima para baixo**, respeitando bloqueios:

1. **PM-003** — CORS estrito em produção (quick win)
2. **PM-004, PM-005, PM-006** — fechar confiança operacional WhatsApp/contribuições
3. **PM-010 → PM-016** — fechar plano de testes Admin
4. **PM-020** — upgrade .NET 10 (janela até EOS nov/2026)
5. **PM-007** — quando o chip WhatsApp da Casa estiver disponível
6. **PM-021+** — governança e produto

Não ativar lembretes automáticos (PM-008) sem decisão explícita.

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
| Data | 2026-08-03 |
| Branch | `master` (plano criado; sem implementação de PM-xxx nesta sessão) |
| Em andamento (`doing`) | — |
| Próximo item sugerido | **PM-003** (CORS estrito) |
| Bloqueios ativos | PM-007 (chip WhatsApp) |
| Ambiente | Produção em `https://www.batuara.org.br/`; lembretes WhatsApp desligados; Swagger permanece público por decisão |
| Riscos | CORS/CSP com origins antigas possíveis; EOS .NET 8 em 2026-11-10 |

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
