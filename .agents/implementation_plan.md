# Plano de Implementação Consolidado — Batuara.net

> Cruza o plano de sessão (testes E2E de 19/04/2026) com o ROADMAP.md oficial do projeto.
> Atualizar este arquivo e o `.agents/session.md` ao final de cada sessão.

---

## ✅ Fases Concluídas (histórico do ROADMAP)

| Fase | Descrição | Status |
|:-----|:----------|:-------|
| 1 | Emergência de Segurança (credenciais, CORS, .gitignore) | ✅ Concluída |
| 2 | Estabilidade da API e infraestrutura (health checks, EF Core) | ✅ Concluída |
| 2.1 | Validação de JWT Secret | ✅ Concluída |
| 3 | Limpeza arquitetural e unificação de Auth | ✅ Concluída |
| 4 | CI/CD e deploy automático na OCI | ✅ Concluída |
| Pós-Deploy | Fix deadlock no interceptor de auth (spinner infinito) | ✅ Concluída |
| 5 | Hardening: secret scanning, dependabot, CSP, Serilog, backup, runbook | ✅ Concluída (exceto 5.3) |

> **Fase 5.3 — HTTPS com Let's Encrypt:** ⏳ Bloqueado — aguarda domínio válido (`batuara.net`). Quando disponível: `sudo certbot --nginx -d batuara.net -d www.batuara.net ...`

---

---

## ✅ Fase Imediata A — Correção de CRUD (Backend)
> **Status:** Concluída

## ✅ Fase Imediata B — Responsividade Mobile (iPhone 16)
> **Status:** Concluída

## ✅ Fase Imediata C — Dashboard com Dados Reais
> **Status:** Concluída

## ✅ Fase Imediata D — Navegação de Eventos por Mês (PublicWebsite)
> **Status:** Concluída

## ✅ Fase Extra — Calendário Unificado e Navegação Mensal
- Implementada navegação mensal no Calendário Público.
- Unificada exibição de Eventos e Atendimentos no Calendário.
- Sincronização dinâmica via API com filtros de mês/ano.

---

## 🗺️ Backlog Estratégico — Fase 6 do ROADMAP

> Itens do ROADMAP.md já planejados, mas **ainda não iniciados**.  
> A execução das Fases A–D acima é pré-requisito para iniciar a Fase 6.

### 6.0 — Fundação Técnica (pré-requisito da Fase 6)
- Consolidar contratos OpenAPI 3.0
- Padronizar envelopes JSON, paginação e filtros
- Garantir serialização de enums como string (já parcialmente feito)
- Restringir acesso ao Swagger em produção
- Revisar políticas de rate limiting: auth (5/min), público (100/h), admin (1000/h)

### 6.1 — Núcleo Operacional
| Epic | Prioridade | Notas |
|:-----|:-----------|:------|
| EP-SiteSettings (admin + público) | P0 | Mais simples; valida fundação |
| EP-Events (admin + público) | P0 | Parcialmente implementado; revisar filtros e paginação |
| EP-Contact (público) | P0 | POST único; rate limit anti-spam |
| EP-Calendar (admin + público + inscrições) | P1 | Mais complexo (capacidade, idempotência, transações) |

### 6.2 — Conteúdo Espiritual
| Epic | Prioridade |
|:-----|:-----------|
| EP-Orixas | P1 |
| EP-UmbandaLines | P1 |
| EP-SpiritualContents | P1 (busca textual + sanitização XSS) |

### 6.3 — Operação e Auditoria
| Epic | Notas |
|:-----|:------|
| EP-Dashboard | Fase Imediata C cobre parcialmente; Fase 6.3 adiciona `activity-logs` e auditoria persistente |
| EP-Audit | Trilha de auditoria por usuário/entidade/ação; retenção e correlação com SIEM |

### 6.4 — Segurança Avançada
- MFA para Admin (TOTP)
- RBAC granular por endpoint
- WAF + SIEM + alertas
- Pentest automatizado no CI/CD
- HTTPS (depende do domínio `batuara.net` — item 5.3 ainda pendente)

---

## Resumo de Todos os Arquivos — Fases Imediatas

| # | Arquivo | Tipo | Fase |
|:--|:--------|:-----|:-----|
| 1 | `CalendarDomainService.cs` | Backend | A |
| 2 | `CalendarAttendanceService.cs` | Backend | A |
| 3 | `EventDomainService.cs` | Backend | A |
| 4 | `EventService.cs` | Backend | A |
| 5 | `CalendarPage.tsx` | AdminDashboard | B |
| 6 | `EventsPage.tsx` | AdminDashboard | B |
| 7 | `OrixasPage.tsx` | AdminDashboard | B |
| 8 | `MembersPage.tsx` | AdminDashboard | B |
| 9 | `GuidesPage.tsx` | AdminDashboard | B |
| 10 | `UmbandaLinesPage.tsx` | AdminDashboard | B |
| 11 | `SpiritualContentPage.tsx` | AdminDashboard | B |
| 12 | `DonationsContactPage.tsx` | AdminDashboard | B |
| 13 | `DashboardController.cs` | Backend (NEW) | C |
| 14 | `IDashboardService.cs` | Backend (NEW) | C |
| 15 | `DashboardService.cs` | Backend (NEW) | C |
| 16 | `Program.cs` | Backend | C |
| 17 | `DashboardPage.tsx` | AdminDashboard | C |
| 18 | `api.ts` | AdminDashboard | C |
| 19 | `PublicEventsController.cs` | Backend | D |
| 20 | Página de Eventos | PublicWebsite | D |

> **Total imediato:** 20 arquivos  
> **Ordem de execução:** A → rebuild API → B → rebuild AdminDashboard → C → rebuild API + AdminDashboard → D → rebuild API + PublicWebsite
