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

## 🔧 Fase Imediata A — Correção de CRUD (Backend)

> **Prioridade: CRÍTICA** — Bloqueia uso real do AdminDashboard  
> Requer rebuild do container `api` após as alterações.

### Problema
Qualquer `PUT /api/calendar/attendances/{id}` ou `PUT /api/events/{id}` em registro com data anterior a hoje retorna **HTTP 422** com `"Atendimentos/Eventos não podem ser agendados no passado"`. Causa: os Domain Services não distinguem INSERT de UPDATE.

### Arquivos a modificar

| # | Arquivo | Mudança |
|:--|:--------|:--------|
| 1 | `CalendarDomainService.cs` | Adicionar `bool isUpdate = false` em `ValidateAttendanceBusinessRules`; pular validação de data no passado quando `isUpdate = true` |
| 2 | `CalendarAttendanceService.cs` | Passar `isUpdate: true` no fluxo de `UpdateAsync` |
| 3 | `EventDomainService.cs` | Adicionar `bool isUpdate = false` em `ValidateEventBusinessRules`; pular validação de data no passado quando `isUpdate = true` |
| 4 | `EventService.cs` | Passar `isUpdate: true` no fluxo de `UpdateAsync` |

---

## 📱 Fase Imediata B — Responsividade Mobile (iPhone 16 — 393×852px)

> Requer rebuild do container `admindashboard`.

### Problemas identificados (viewport 393px)

| Tela | Problema |
|:-----|:---------|
| Calendário | Coluna "Descrição" cortada; "Inscrição/Status/Ações" fora do viewport |
| Eventos | Título truncado; coluna "Tipo" fora do viewport |
| Orixás | Coluna "Elementos" exibe só a primeira letra |
| Filhos da Casa | Coluna "Cidade" cortada |
| Todas as páginas | Subtítulo descritivo truncado com reticências |

### Arquivos a modificar

| # | Arquivo | Mudança |
|:--|:--------|:--------|
| 5 | `CalendarPage.tsx` | Ocultar colunas Descrição/Inscrição em `xs`; subtítulo `whiteSpace: 'normal'`; scroll horizontal na DataGrid |
| 6 | `EventsPage.tsx` | Ocultar colunas secundárias em `xs`; subtítulo word-break |
| 7 | `OrixasPage.tsx` | Ocultar colunas Elementos/Ordem em `xs` |
| 8 | `MembersPage.tsx` | Ocultar colunas Cidade/UF em `xs` |
| 9 | `GuidesPage.tsx` | Subtítulo word-break + colunas responsivas |
| 10 | `UmbandaLinesPage.tsx` | Subtítulo word-break + colunas responsivas |
| 11 | `SpiritualContentPage.tsx` | Subtítulo word-break + colunas responsivas |
| 12 | `DonationsContactPage.tsx` | Subtítulo word-break |

---

## 📊 Fase Imediata C — Dashboard com Dados Reais

> Alinhado com **ROADMAP Fase 6.3 / EP-Dashboard**  
> Requer rebuild dos containers `api` e `admindashboard`.

### Problema
`DashboardPage.tsx` exibe valores hardcoded (`15 Eventos`, `42 Atendimentos`, `5 Usuários`). Não existe endpoint `GET /api/dashboard/stats` na API.

### Arquivos a criar/modificar

| # | Arquivo | Ação |
|:--|:--------|:-----|
| 13 | `DashboardController.cs` | NOVO — `GET /api/dashboard/stats` com `[Authorize]` |
| 14 | `IDashboardService.cs` | NOVO — interface com `GetStatsAsync()` |
| 15 | `DashboardService.cs` | NOVO — queries reais ao `BatuaraDbContext` (contar Eventos, Atendimentos do mês, Usuários Admin, próximo Evento, próximo Atendimento) |
| 16 | `Program.cs` | MODIFY — registrar `IDashboardService` / `DashboardService` no DI |
| 17 | `DashboardPage.tsx` | MODIFY — remover `mockStats`, chamar `apiService.getDashboardStats()` |
| 18 | `api.ts` | MODIFY — adicionar método `getDashboardStats()` |

---

## 📅 Fase Imediata D — Navegação de Eventos por Mês (PublicWebsite)

> Novo requisito identificado em sessão 19/04/2026  
> Requer rebuild dos containers `api` e `publicwebsite`.

### Requisito
- Página pública de eventos inicia **no mês atual**
- Botões **◀ Mês Anterior** e **Mês Seguinte ▶** com label `"Abril 2026"` em pt-BR
- Sem eventos no mês → mensagem `"Nenhum evento programado para [mês/ano]"`
- Limite sugerido: ±12 meses a partir do mês atual

### Arquivos a modificar

| # | Arquivo | Mudança |
|:--|:--------|:--------|
| 19 | `PublicEventsController.cs` | Adicionar query params `?month=&year=` no `GET /api/public/events`; filtrar por mês/ano quando fornecidos; default = mês atual |
| 20 | Página de Eventos (PublicWebsite) | State `currentMonth/Year`; botões prev/next; reload via API a cada navegação; loading indicator |

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
