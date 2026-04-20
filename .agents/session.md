# Batuara.net — Contexto de Sessão de Trabalho da IA
# Batuara.net — Contexto de Sessão de Trabalho da IA
# Batuara.net — Contexto de Sessão de Trabalho da IA

# Batuara.net — Contexto de Sessão de Trabalho da IA

> **INSTRUÇÃO PARA A IA:** Leia este arquivo **integralmente** ao iniciar qualquer sessão.
> Ao encerrar, siga o ritual da seção "Encerramento de Sessão" e atualize este arquivo **e** o `implementation_plan.md`.

---

## 🗂️ Hierarquia de Documentos

| Prioridade | Arquivo | Papel |
|:----------:|:--------|:------|
| **1ª** | `.agents/implementation_plan.md` | **Fonte principal de tarefas.** Gerado a partir de testes E2E reais via browser. Contém bugs confirmados e fases de execução priorizadas. Prevalece sobre o ROADMAP. |
| **2ª** | `.agents/session.md` (este arquivo) | Estado atual, credenciais, histórico e rituais de sessão. Lido pelo usuário ao iniciar cada sessão. |
| **3ª** | `ROADMAP.md` (raiz do projeto) | Backlog estratégico de médio/longo prazo (Fases 6.x). Consultar após concluir todas as fases do `implementation_plan.md`. |
| Referência | `agent.md` (raiz do projeto) | Arquitetura, stack, convenções e endpoints. Consultar quando precisar de contexto técnico geral. |

---

## 📋 Ritual de Início de Sessão

Executar **nesta ordem** ao iniciar qualquer sessão de trabalho:

1. **Ler este arquivo** (`.agents/session.md`) — estado atual e contexto
2. **Ler `.agents/implementation_plan.md`** — próxima fase a executar (prioridade máxima)
3. **Subir o ambiente local** (se necessário):
   ```powershell
   docker compose -p batuara-net-local -f docker-compose.local.yml up -d
   docker ps --filter name=batuara-net-local
   # Esperar: db, api, admindashboard, publicwebsite, nginx — tudo "Up"
   ```
4. **Verificar saúde da API:**
   ```powershell
   curl http://localhost/batuara-api/health
   ```
5. **Identificar a próxima tarefa** na seção "Plano de Execução" abaixo
6. **Iniciar pelo item marcado como ← INICIAR AQUI**

---

## 📋 Ritual de Encerramento de Sessão

Executar **ao finalizar** cada sessão de trabalho:

1. **Atualizar `.agents/implementation_plan.md`** — marcar fases concluídas (`[x]`), ajustar o próximo `← INICIAR AQUI`
2. **Atualizar a seção "Estado Atual"** neste arquivo — refletir o que passou a funcionar e bugs ainda abertos
3. **Atualizar a seção "Plano de Execução"** neste arquivo — marcar fases concluídas
4. **Registrar no "Histórico de Sessões"** — data, duração, realizações, bloqueadores, próximo passo
5. **Commitar as alterações de código** com prefixo semântico:
   ```powershell
   git add .
   git commit -m "fix: [descrição da correção]"
   # NÃO fazer push automático — aguardar revisão do usuário
   ```
6. **Atualizar `ROADMAP.md`** se algum item de backlog estratégico foi concluído ou iniciado

---

## Projeto

| Campo | Valor |
|:------|:------|
| Nome | Batuara.net |
| Cliente | Casa de Caridade Caboclo Batuara |
| Repositório local | `c:\Users\MarcoGuelfi\Projetos\Batuara.net` |
| Branch principal | `master` |
| Arquitetura completa | `agent.md` (raiz do repositório) |
| Roadmap estratégico | `ROADMAP.md` (raiz do repositório) |

---

## Acesso e Credenciais Locais

| Serviço | URL | Credencial |
|:--------|:----|:-----------|
| AdminDashboard | `http://localhost/batuara-admin/` | `admin@batuara.org.br` / `Admin123!` |
| PublicWebsite | `http://localhost/batuara-public/` | — |
| Swagger API | `http://localhost/batuara-api/swagger` | Bearer JWT |
| Health API | `http://localhost/batuara-api/health` | — |
| PostgreSQL local | container `batuara-net-local-db` | user: `batuara_user` / db: `batuara_db` |

### Comandos úteis de troubleshooting

```powershell
# Nginx com 502 — recriar
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --force-recreate nginx

# Rate limit de login bloqueou (429)
docker restart batuara-net-local-api

# Ver logs de erro da API
docker logs batuara-net-local-api --tail 50

# Inspecionar banco
docker exec batuara-net-local-db psql -U batuara_user -d batuara_db -c "SELECT id, email FROM batuara.users;"
```

---

## Estado Atual do Projeto

**Última atualização:** 2026-04-19

### ✅ Funcionando
- Stack local (Docker): API, AdminDashboard, PublicWebsite, Nginx, PostgreSQL — todos `Up`
- Login: `admin@batuara.org.br` / `Admin123!` ✅
- Banco de dados local sincronizado com produção OCI ✅
- Listagem em todas as telas CRUD: Orixás, Guias, Linhas da Umbanda, Conteúdo Espiritual, Filhos da Casa ✅
- Navegação mensal dinâmica em Eventos e Calendário Público ✅
- Calendário unificado exibindo Eventos e Atendimentos ✅
- Dashboard Administrativo com estatísticas reais do banco de dados ✅
- Responsividade mobile (iPhone 16) em todas as telas do AdminDashboard ✅

### ⚠️ Bugs Conhecidos (pendentes de correção)

| # | Bug | Causa | Fase que corrige |
|:--|:----|:------|:----------------|
| 1 | Rate limit de login bloqueia após 5 tentativas/minuto | Configuração `FixedWindowRateLimiter` no `Program.cs` | Workaround: `docker restart batuara-net-local-api` |

### 📱 Problemas de Mobile (viewport 393×852 / iPhone 16)
- Colunas do DataGrid cortadas fora do viewport em todas as páginas do AdminDashboard
- Subtítulos descritivos truncados com reticências em todas as páginas
- Sidebar colapsa para hamburger — comportamento esperado ✅

---

## Plano de Execução Pendente

> **Status:** Aprovado pelo usuário em 2026-04-19. Pronto para execução.  
> Detalhamento completo: `ROADMAP.md` → Fase 6 (raiz do projeto)

### [x] Fase A — Correção de CRUD Backend

**Objetivo:** Permitir editar registros com data no passado sem erro de validação.

| Arquivo | Mudança |
|:--------|:--------|
| `src/Backend/Batuara.Domain/Services/CalendarDomainService.cs` | Adicionar `bool isUpdate = false` em `ValidateAttendanceBusinessRules`; pular validação de data no passado quando `isUpdate = true` |
| `src/Backend/Batuara.Application/Calendar/Services/CalendarAttendanceService.cs` | Passar `isUpdate: true` no fluxo de `UpdateAsync` |
| `src/Backend/Batuara.Domain/Services/EventDomainService.cs` | Adicionar `bool isUpdate = false` em `ValidateEventBusinessRules`; pular validação de data no passado quando `isUpdate = true` |
| `src/Backend/Batuara.Application/Events/Services/EventService.cs` | Passar `isUpdate: true` no fluxo de `UpdateAsync` |

**Após:** `docker compose -p batuara-net-local -f docker-compose.local.yml up -d --build api`

---

### [x] Fase B — Responsividade Mobile AdminDashboard

**Objetivo:** Colunas DataGrid responsivas + subtítulos sem corte em viewport 393px.

| Arquivo | Mudança |
|:--------|:--------|
| `src/Frontend/AdminDashboard/src/pages/CalendarPage.tsx` | Ocultar colunas Descrição/Inscrição em `xs`; subtítulo `whiteSpace: 'normal'`; scroll horizontal |
| `src/Frontend/AdminDashboard/src/pages/EventsPage.tsx` | Ocultar colunas secundárias em `xs`; subtítulo word-break |
| `src/Frontend/AdminDashboard/src/pages/OrixasPage.tsx` | Ocultar colunas Elementos/Ordem em `xs` |
| `src/Frontend/AdminDashboard/src/pages/MembersPage.tsx` | Ocultar colunas Cidade/UF em `xs` |
| `src/Frontend/AdminDashboard/src/pages/GuidesPage.tsx` | Subtítulo word-break + colunas responsivas |
| `src/Frontend/AdminDashboard/src/pages/UmbandaLinesPage.tsx` | Subtítulo word-break + colunas responsivas |
| `src/Frontend/AdminDashboard/src/pages/SpiritualContentPage.tsx` | Subtítulo word-break + colunas responsivas |
| `src/Frontend/AdminDashboard/src/pages/DonationsContactPage.tsx` | Subtítulo word-break |

**Após:** `docker compose -p batuara-net-local -f docker-compose.local.yml up -d --build admindashboard`

---

### [x] Fase C — Dashboard com Dados Reais (ROADMAP 6.3 / EP-Dashboard)
> **Status:** Concluída

### [x] Fase D — Navegação de Eventos por Mês (PublicWebsite)
> **Status:** Concluída

### [x] Fase Extra — Calendário Unificado e Navegação Mensal
> **Status:** Concluída

---

### [ ] Backlog Estratégico — ROADMAP Fase 6

Após concluir as Fases A–D, seguir o `ROADMAP.md` nesta ordem:

```
6.0 Fundação técnica (contratos OpenAPI, paginação, envelopes JSON)
  ↓
6.1 EP-SiteSettings → EP-Events → EP-Contact → EP-Calendar
  ↓
6.2 EP-Orixas → EP-UmbandaLines → EP-SpiritualContents
  ↓
6.3 EP-Dashboard (activity-logs + auditoria persistente) → EP-Audit
  ↓
6.4 MFA → WAF/SIEM → HTTPS (aguarda domínio batuara.net)
```

---

## Histórico de Sessões

### Sessão 2026-04-20

**Duração:** ~3h  
**Realizações:**
- Conclusão das Fases A, B, C e D.
- Implementada navegação mensal dinâmica em `EventsSection` e `CalendarSection`.
- Unificado o Calendário Público para exibir tanto Eventos quanto Atendimentos.
- Corrigida integração Nginx para resolver corretamente o hostname `api` (DNS cache issue).
- Atualizado Dashboard Administrativo para consumir dados reais da API.
- Refatorada tipagem e imports para garantir build limpo no Docker.

**Bloqueadores resolvidos:**
- 502 Bad Gateway no Swagger/Dashboard → Resolvido com `docker compose down` e `up --force-recreate` para limpar cache de rede interna.
- Erros de compilação no frontend devido a propriedades de tipos mistos no calendário unificado.

**Próxima sessão:** Iniciar Fase 6.0 do ROADMAP (Consolidação de Contratos OpenAPI e Padronização).

### Sessão 2026-04-19

**Duração:** ~4h  
**Realizações:**
- Sincronizou banco de dados local com produção OCI via SSH
- Diagnosticou e corrigiu problema de autenticação BCrypt (`$2b$` vs `$2a$`)
- Senha do admin resetada com hash `$2a$` compatível com `BCrypt.Net-Next 4.1.0`
- Login funcionando: `admin@batuara.org.br` / `Admin123!`
- Testes E2E completos em desktop e mobile (iPhone 16 — 393×852px)
- Identificou todos os bugs de CRUD e responsividade
- Criou estrutura `.agents/session.md` para gestão de sessões
- Moveu arquivos de banco/backup da raiz para pasta `database/`
- Removeu arquivo de patch descartável da raiz
- Consolidou plano de execução (Fases A–D) cruzado com `ROADMAP.md`

**Bloqueadores resolvidos:**
- `BCrypt.Net.SaltParseException` — hash `$2b$` incompatível com `BCrypt.Net` do C# → resolvido gerando hash com script C# local (`HashGen/`)
- Rate Limit 429 durante debug do login → resolvido via `docker restart batuara-net-local-api`

**Próxima sessão:** Iniciar pela **Fase A** — Correção de CRUD Backend

---

## Observações Permanentes para a IA

1. **Nunca recriar o banco do zero.** Usar `scripts/sync-db-from-oci.ps1` para sincronizar com produção OCI.
2. **Pasta `database/`** — todos os backups e scripts SQL avulsos ficam aqui. Nunca deixar na raiz.
3. **Rate Limit de login** — máximo 5 tentativas/minuto. Se bloquear: `docker restart batuara-net-local-api`.
4. **Variáveis de ambiente** — estão no `.env` da raiz. Nunca expor valores em código ou commits.
5. **Nginx** — após rebuilds completos pode precisar de `--force-recreate` para resolver upstream antigos.
6. **BCrypt** — projeto usa `BCrypt.Net-Next 4.1.0`. Hashes válidos têm prefixo `$2a$`. Para gerar manualmente, usar o projeto `HashGen/` na raiz.
7. **Idioma** — sempre responder e documentar em **pt-BR**.
8. **Branch** — branch principal é `master` (não `main`). Nunca fazer push sem revisão do usuário.
