# Batuara.net - Registro de Correções, Melhorias e Roadmap

> Documento de referência para desenvolvedores e ferramentas de assistência por IA (Devin, Codex, Claude, Gemini, Warp Terminal, Opencode, Antigravity, Trae, Qoder e outras).
> Última atualização: Abril/2026

---

## Visão Geral

Este documento registra as correções e melhorias já aplicadas ao projeto Batuara.net, organizadas por fases de execução. A partir de Março/2026 ele também passa a funcionar como roadmap principal de produto e plataforma, consolidando:

- histórico de entregas já concluídas
- hardening e infraestrutura ainda pendentes
- evolução funcional da API RESTful e do CMS administrativo
- referência cruzada com os documentos de planejamento detalhado

### Documentos Complementares

- `docs/EFT-especificacao-funcional-tecnica.md` — arquitetura, contratos, SLAs, segurança e governança
- `docs/Resumo-Executivo.md` — objetivos, escopo, riscos, cronograma macro e benefícios
- `docs/Backlog-Executavel.md` — épicos, histórias, dependências e priorização por rota/domínio

**Repositório:** [github.com/guelfi/Batuara.net](https://github.com/guelfi/Batuara.net)
**Branch principal:** `master`

---

## Fase 1 — Emergência de Segurança

**Status:** Concluída  
**PR:** [#1](https://github.com/guelfi/Batuara.net/pull/1)  
**Objetivo:** Remover credenciais expostas e aplicar hardening básico de segurança.

### Correções Aplicadas

| Item | Descrição | Arquivos Afetados |
|------|-----------|-------------------|
| Remoção de chave SSH privada | Chave SSH privada estava commitada no repositório. Removida e adicionada ao `.gitignore` | `.gitignore`, remoção do arquivo de chave |
| Remoção de senhas hardcoded | Senhas de banco de dados estavam em texto plano nos arquivos de configuração. Substituídas por variáveis de ambiente | `appsettings.json`, `appsettings.Development.json`, `docker-compose.production.yml` |
| Restrição de CORS | CORS estava configurado para aceitar qualquer origem (`*`). Restrito para origens específicas | `Program.cs` |
| Atualização do .gitignore | Adicionadas regras para ignorar arquivos sensíveis (`.env`, chaves SSH, certificados) | `.gitignore` |

### Decisões Registradas

- **Chave SSH não revogada:** O proprietário optou por manter a chave SSH existente, aceitando o risco, para preservar configurações de deploy manual já em uso.

---

## Fase 2 — Estabilidade da API e Infraestrutura

**Status:** Concluída  
**PR:** [#2](https://github.com/guelfi/Batuara.net/pull/2)  
**Objetivo:** Corrigir problemas de infraestrutura e adicionar monitoramento real da API.

### Correções Aplicadas

| Item | Descrição | Arquivos Afetados |
|------|-----------|-------------------|
| Health check real | Substituído endpoint estático `/health` por ASP.NET Core Health Checks com verificação de conectividade ao PostgreSQL | `Program.cs`, `Batuara.API.csproj` |
| Entity Framework Core | Migração do acesso a dados para EF Core com `BatuaraDbContext` | `BatuaraDbContext.cs`, `Batuara.Infrastructure.csproj` |
| Docker Compose de produção | Corrigido `docker-compose.production.yml` com configurações de rede, volumes e health checks | `docker-compose.production.yml` |
| Arquivo .env.example | Criado template de variáveis de ambiente para facilitar setup | `.env.example`, `.env.production.example` |

---

## Fase 2.1 — Validação de JWT Secret

**Status:** Concluída  
**PR:** [#3](https://github.com/guelfi/Batuara.net/pull/3)  
**Objetivo:** Garantir que a API não inicie em produção com um JWT Secret inseguro.

### Correções Aplicadas

| Item | Descrição | Arquivos Afetados |
|------|-----------|-------------------|
| Validação de JWT Secret | API recusa iniciar se o secret for um placeholder (`CHANGE_ME`, `your-256-bit-secret`). Em desenvolvimento, gera um secret aleatório automaticamente | `Program.cs` |

### Como Gerar um JWT Secret Seguro

```bash
openssl rand -base64 64
```

---

## Fase 3 — Limpeza Arquitetural e Unificação de Auth

**Status:** Concluída  
**PR:** [#4](https://github.com/guelfi/Batuara.net/pull/4)  
**Objetivo:** Unificar os dois projetos de autenticação e melhorar a arquitetura.

### Correções Aplicadas

| Item | Descrição | Arquivos Afetados |
|------|-----------|-------------------|
| Unificação de Auth | Migrada toda a lógica de autenticação do `Batuara.Auth` para `Batuara.API`, eliminando duplicação | `AuthController.cs`, `AuthService.cs`, `IAuthService.cs` |
| SecurityHeadersMiddleware | Migrado middleware de segurança (X-Frame-Options, CSP, HSTS, X-Content-Type-Options) para o projeto principal | `SecurityHeadersMiddleware.cs`, `Program.cs` |
| Gestão de Usuários | Adicionado `UsersController` com endpoints para CRUD de usuários | `UsersController.cs` |
| Models de Request | Criados models tipados para requisições de autenticação | `AdminUpdateUserRequest.cs`, `ChangePasswordRequest.cs`, `UpdateUserRequest.cs` |

### Nota Importante

O projeto `Batuara.Auth` ainda existe no repositório mas está deprecado. Toda a lógica de autenticação agora vive em `Batuara.API`.

---

## Fase 4 — CI/CD e Deploy Automatizado

**Status:** Concluída  
**PRs:** [#5](https://github.com/guelfi/Batuara.net/pull/5), [#6](https://github.com/guelfi/Batuara.net/pull/6), [#7](https://github.com/guelfi/Batuara.net/pull/7), [#8](https://github.com/guelfi/Batuara.net/pull/8), [#9](https://github.com/guelfi/Batuara.net/pull/9), [#10](https://github.com/guelfi/Batuara.net/pull/10)  
**Objetivo:** Implementar CI/CD com GitHub Actions e deploy automatizado na Oracle Cloud Infrastructure (OCI).

### Correções Aplicadas

| Item | Descrição | Arquivos Afetados |
|------|-----------|-------------------|
| CI Workflow | GitHub Actions para build e validação: .NET API, Public Website, Admin Dashboard, Docker Build | `.github/workflows/ci.yml` |
| CD Workflow | Deploy automatizado na OCI, disparado após CI passar no `master` | `.github/workflows/deploy-oci.yml` |
| Deploy Rolling | Script de deploy com zero-downtime: para containers antigos, sobe novos, valida health check | `scripts/ci/deploy-rolling.sh` |
| SSH Agent | Integração com `webfactory/ssh-agent` para autenticação SSH segura no deploy | `.github/workflows/deploy-oci.yml` |
| Nginx Config | Configuração de reverse proxy para servir API, Public Website e Admin Dashboard | `nginx/batuara.conf` |

### Fluxo de CI/CD

```
Push para master → CI (build + validação) → CI passa → CD dispara → SSH para OCI → Deploy rolling
```

### GitHub Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `OCI_SSH_PRIVATE_KEY` | Chave SSH privada para acessar o servidor OCI |
| `OCI_HOST` | Endereço IP do servidor OCI (ex: `129.153.86.168`) |
| `OCI_USER` | Usuário SSH (ex: `ubuntu`) |
| `DB_PASSWORD` | Senha do banco de dados PostgreSQL |
| `JWT_SECRET` | Secret para assinatura de tokens JWT |

### Problemas Resolvidos Durante a Fase 4

1. **Formato da chave SSH** — Chave com line endings Windows (`\r\n`) causava erro `error in libcrypto`. Resolvido com `webfactory/ssh-agent` (PR #9).
2. **Nome do secret incorreto** — Workflow referenciava `OCI_SSH_KEY` mas o secret no GitHub era `OCI_SSH_PRIVATE_KEY` (PR #10).
3. **Health check do deploy** — Script usava porta interna do container ao invés da porta mapeada no host (PR #6).
4. **CD disparava em paralelo com CI** — Alterado para `workflow_run` para que CD só execute após CI passar (PR #5 atualizado).

---

## Correções Pós-Deploy — Admin Dashboard

**Status:** Concluída  
**PRs:** [#11](https://github.com/guelfi/Batuara.net/pull/11), [#12](https://github.com/guelfi/Batuara.net/pull/12)  
**Objetivo:** Corrigir o Admin Dashboard que ficava travado em um spinner infinito.

### Problema

O Admin Dashboard ficava permanentemente travado em um spinner de carregamento ao acessar `http://<host>/batuara-admin/`. A tela de login nunca aparecia.

### Causa Raiz

Deadlock no interceptor do axios:

1. `initializeAuth()` chama `/auth/verify` → resposta 401 (sem sessão válida)
2. Interceptor do axios detecta 401, seta `isRefreshing=true`, chama `/auth/refresh`
3. `/auth/refresh` também retorna 401
4. Interceptor vê `isRefreshing=true`, enfileira a requisição em `failedQueue`
5. A Promise do refresh nunca resolve (esperando na fila por si mesma)
6. `initializeAuth()` trava indefinidamente → `isLoading=true` para sempre → spinner infinito

### Solução

Adicionado método `isAuthEndpoint()` no `ApiService` que exclui `/auth/refresh` e `/auth/login` do interceptor de 401. Quando essas rotas retornam 401, o erro propaga diretamente para o código chamador (`AuthContext.initializeAuth`), que já trata a falha corretamente.

**Nota:** `/auth/verify` NÃO foi excluída do interceptor (PR #12) para preservar o mecanismo de silent token refresh — quando o access token expira mas o refresh token ainda é válido, o interceptor renova silenciosamente.

### Arquivo Modificado

- `src/Frontend/AdminDashboard/src/services/api.ts` — Método `isAuthEndpoint()` e condição no interceptor de 401

---

## Fase 5 — Hardening e Melhorias de Segurança (Em Progresso)

**Status:** Em Progresso  
**Objetivo:** Fortalecer a segurança, observabilidade e resiliência do sistema em produção.

> Itens ordenados por facilidade de implementação + criticidade. Itens mais rápidos e de maior impacto primeiro.

---

## Plano de Execução da Fase 5

### Instruções de Uso

Este plano deve ser utilizado como ponto de partida em cada sessão de trabalho:

1. **Início de sessão:** Consultar esta seção para saber o próximo item a trabalhar
2. **Durante a execução:** Marcar tarefas como `[ ]` (pendente) → `[x]` (concluído)
3. **Final de sessão:** Atualizar data de conclusão, links de PR, e observações
4. **Após cada PR mergeado:** Atualizar o status do item correspondente

### Checklist de Execução

| # | Item | Status | Prioridade | Estimativa | Data Conclusão | PR |
|---|------|--------|------------|------------|----------------|-----|
| 5.1 | Secret Scanning no CI | [x] | Alta | 2h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.2 | Audit de Dependências | [x] | Alta | 2-3h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.4 | CSP Mais Restritivo | [x] | Média | 2-3h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.5 | Logging Centralizado | [x] | Alta | 3-5h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.6 | Backup PostgreSQL | [x] | Alta | 3-4h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.7 | Runbook de Operações | [x] | Média | 3-4h | 24/03/2026 | [#17](https://github.com/guelfi/Batuara.net/pull/17) |
| 5.3 | HTTPS com Let's Encrypt | [⏳] | Crítica | 2-3h | - | Bloqueado — aguardando domínio |

> ⚠️ **Item 5.3 por último:** HTTPS com Let's Encrypt aguarda domínio válido. Continuar com os outros itens primeiro.

### Histórico de Execução

```
| Data       | Item  | Ação Realizada | Observações |
|------------|-------|----------------|-------------|
| 24/03/2026 | 5.1   | Implementado gitleaks no CI | Job secret-scanning adicionado, .gitleaks.toml criado com regras customizadas |
| 24/03/2026 | 5.2   | Implementado audit de dependências | Job audit-dependencies adicionado, .github/dependabot.yml criado |
| 24/03/2026 | 5.3   | Avaliação realizada | Let's Encrypt exige domínio. Opções: DuckDNS, registrar domínio, Cloudflare, ou self-signed |
| 24/03/2026 | 5.7   | Runbook de Operações criado | docs/RUNBOOK.md com procedimentos de deploy, rollback, troubleshooting, backup e emergência |
```

---

## Detalhamento das Tarefas

### 5.1 — Secret Scanning no CI

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Alta  
**Facilidade:** muito fácil  
**Estimativa:** 2 horas

**Implementação:**
- Adicionado job `secret-scanning` no workflow CI que roda antes dos builds
- Criado arquivo `.gitleaks.toml` com regras customizadas para detectar:
  - AWS/GCP/Azure/Google API keys
  - GitHub tokens (PAT, OAuth, App)
  - AWS Secret Keys
  - PostgreSQL/MySQL/MongoDB/Redis connection strings
  - SSH private keys
  - JWT tokens
  - Stripe/Twilio/SendGrid/Slack tokens
  - Generic secrets e passwords
- Configurado `fetch-depth: 0` para escanear todo o histórico git
- Job `docker-build` agora depende de `secret-scanning` para fail-fast

**Arquivos modificados:**
- `.github/workflows/ci.yml` — Job secret-scanning adicionado
- `.gitleaks.toml` (novo) — Configuração de regras customizadas

**Referência:**
```yaml
- name: Secret Scanning
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### 5.2 — Audit de Dependências Vulneráveis

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Alta  
**Facilidade:** Fácil  
**Estimativa:** 2-3 horas

**Implementação:**
- Adicionado job `audit-dependencies` no workflow CI que executa em paralelo com os builds
- Audit de .NET: `dotnet list package --vulnerable --include-transitive` com fail em vulnerabilidades
- Audit de npm: `npm audit --audit-level=high` para ambos os frontends
- Configurado Dependabot para atualizações automáticas:
  - npm (PublicWebsite e AdminDashboard) - semanalmente
  - NuGet (Batuara.API) - semanalmente
  - Docker - semanalmente
  - GitHub Actions - semanalmente
- PRs agrupados por tipo (production/development) com limite de 3 PRs simultâneos

**Arquivos modificados:**
- `.github/workflows/ci.yml` — Job audit-dependencies adicionado
- `.github/dependabot.yml` (novo) — Configuração do Dependabot

---

### 5.3 — HTTPS com Let's Encrypt

**Status:** `[⏳]` Bloqueado - Aguardando domínio  
**PR:** —  
**Prioridade:** Crítica  
**Facilidade:** Média  
**Estimativa:** 2-3 horas

**⚠️ Bloqueio:** Let's Encrypt exige domínio válido (não funciona com IP público puro).

**Opções disponíveis (escolher uma):**

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| **DuckDNS** | Domínio gratuito (ex: `batuara.duckdns.org`) | Gratuito, implementação rápida | URL não profissional |
| **Registrar domínio** | Registrar `batuara.net` (R$30-50/ano) | URL profissional, Let's Encrypt | Custo adicional |
| **Cloudflare** | SSL gratuito mesmo para IP | SSL gratuito, CDN, proteção extra | Requer mudar DNS |
| **Self-signed** | Certificado autoassinado | Implementação imediata | Aviso no navegador |

**Configuração atual do Nginx:**
- `server_name`: `batuara.net`, `www.batuara.net`, `admin.batuara.net`, `api.batuara.net`
- Porta: `listen 80` (HTTP)
- HTTPS blocks já existem no código (comentados) em `nginx/batuara.conf`

**Quando obter domínio:** Descomentar blocks HTTPS e executar:
```bash
sudo certbot --nginx -d batuara.net -d www.batuara.net -d admin.batuara.net -d api.batuara.net
```

**Arquivos preparados para modificação:**
- `nginx/batuara.conf` — Blocks HTTPS já existem (comentados)
- `scripts/ci/deploy-rolling.sh` — Ajustar health check quando HTTPS estiver ativo

---

### 5.4 — Content Security Policy Mais Restritivo

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Média  
**Facilidade:** Média  
**Estimativa:** 2-3 horas

**Implementação:**
- Removido `unsafe-eval` do CSP (risco de XSS)
- Removido `unsafe-inline` de script-src (mantido apenas para estilos MUI que exigem)
- Adicionado `Permissions-Policy` completo para bloquear APIs sensíveis
- Configurado `connect-src` para permitir conexões com API e frontends
- Adicionado `base-uri` e `form-action` para proteção adicional
- CSP implementado em todos os servers Nginx (não só admin)
- API com CSP mais restritivo (`default-src 'none'`)

**Arquivos modificados:**
- `src/Backend/Batuara.API/Middleware/SecurityHeadersMiddleware.cs` — CSP dinâmico com IConfiguration
- `nginx/batuara.conf` — Headers de segurança em todos os servers

**CSP Implementado (Backend/API):**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.batuara.net https://batuara.net https://admin.batuara.net; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**CSP Implementado (API-only):**
```
Content-Security-Policy: default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
```

---

### 5.5 — Logging Centralizado (Serilog)

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Alta  
**Facilidade:** Média  
**Estimativa:** 3-5 horas

**Implementação:**
- Configurado Serilog com output JSON estruturado no console
- Adicionado `RequestEnricher.cs` customizado com RequestId, UserId, ClientIP, UserAgent
- Configurado overrides para Microsoft.AspNetCore (Warning) e Microsoft.EntityFrameworkCore (Warning)
- Logs de Batuara em Information level
- Rotação por tamanho (10MB) e retenção de 30 dias para logs gerais
- Retenção de 90 dias para logs de segurança (`logs/security-`)
- Enriquecimento com Application, Environment, MachineName, ProcessId

**Problemas resolvidos:**
- `Serilog.Enrichers.Environment` v4.0.0 não existe — enriqucimento feito via `.Enrich.WithProperty()` nativo
- Namespace conflict com Serilog.Events resolvido

**Arquivos modificados:**
- `src/Backend/Batuara.API/Program.cs` — Configuração completa do Serilog
- `src/Backend/Batuara.API/appsettings.json` — Configuração de logging estruturado
- `src/Backend/Batuara.API/Batuara.API.csproj` — Packages Serilog (parcialmente revertido)
- `src/Backend/Batuara.API/Middleware/RequestEnricher.cs` (novo) — Enricher customizado

---

### 5.6 — Backup Automatizado do PostgreSQL

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Alta  
**Facilidade:** Média  
**Estimativa:** 3-4 horas

**Implementação:**
- Script de backup com `pg_dump` via Docker exec
- Compressão gzip com timestamp no nome do arquivo
- Verificação de integridade do backup
- Rotação automática (mantém últimos 7 dias por padrão)
- Suporte opcional para upload para S3 (AWS CLI)
- Script de restore com confirmação antes de sobrescrever
- Criação de backup de segurança antes do restore
- Script de setup-cron para agendar backups diários (03:00)

**Variáveis de ambiente:**
- `BACKUP_DIR` — diretório de backups (padrão: `/var/backups/batuara`)
- `DB_NAME` — nome do banco (padrão: `batuara`)
- `DB_USER` — usuário do banco (padrão: `postgres`)
- `DB_CONTAINER` — nome do container Docker (padrão: `batuara-postgres`)
- `RETENTION_DAYS` — dias de retenção (padrão: 7)
- `S3_BUCKET` — bucket S3 para upload opcional

**Arquivos criados:**
- `scripts/backup/backup-postgres.sh` — Script principal de backup
- `scripts/backup/restore-postgres.sh` — Script de restauração
- `scripts/backup/setup-cron.sh` — Configuração do cron

**Uso:**
```bash
# Executar backup manualmente
./scripts/backup/backup-postgres.sh

# Listar backups
ls -lh /var/backups/batuara/

# Restaurar backup
./scripts/backup/restore-postgres.sh /var/backups/batuara/batuar_20260324_030000.sql.gz

# Configurar cron (executa backup diário às 03:00)
./scripts/backup/setup-cron.sh
```

---

### 5.7 — Runbook de Operações

**Status:** `[x]` Concluído  
**PR:** [#17](https://github.com/guelfi/Batuara.net/pull/17)  
**Prioridade:** Média  
**Facilidade:** Fácil (documentação pura)  
**Estimativa:** 3-4 horas

**Implementação:**
- Documentação completa em `docs/RUNBOOK.md`
- Comandos copy-paste prontos para uso
- Seções cobrindo: acesso SSH, health check, deploy manual, rollback, troubleshooting, backup/restore, rotação de secrets, monitoramento, procedimento de emergência

**Arquivo criado:**
- `docs/RUNBOOK.md` — Manual de operações completo

---

### Melhorias Futuras (Opcionais)

Itens identificados durante análise dos arquivos PROJETO.md e STATUS.md. Não são críticos no momento atual mas podem ser implementados conforme o projeto cresce:

- **docker-compose.local.yml** — Docker Compose dedicado para ambiente de desenvolvimento completo (já existe `docker-compose.db.yml` para PostgreSQL e os frontends rodam com `npm start`)
- **Script dev.sh** — Script para subir todo o ambiente de desenvolvimento com um único comando (os passos já estão documentados no README.md)

---

## Fase 6 — Plataforma de APIs RESTful e CMS Operacional

**Status:** Planejada  
**Objetivo:** Transformar o Batuara.net em uma plataforma orientada a APIs, com PublicWebsite consumindo dados dinâmicos e AdminDashboard operando como painel completo de gestão de conteúdo, agenda, segurança e observabilidade.

### Referências Obrigatórias da Fase 6

- `docs/EFT-especificacao-funcional-tecnica.md`
- `docs/Resumo-Executivo.md`
- `docs/Backlog-Executavel.md`
- `prompt-security.md`

### Diretrizes da Fase 6

- Todas as APIs devem permanecer sob o prefixo `/batuara-api`
- Separação clara entre rotas públicas (`/api/public/...`) e administrativas (`/api/...`)
- CRUD completo somente no AdminDashboard
- PublicWebsite com leitura e ações públicas específicas e controladas
- Segurança em profundidade em todas as camadas, sem confiar no frontend
- Observabilidade e auditoria como parte do entregável, não como pós-processo

### Estrutura Macro de Execução

| Bloco | Status | Foco | Saídas principais |
|------|--------|------|-------------------|
| 6.0 | Planejado | Fundação técnica | contratos, DTOs, validações, políticas, OpenAPI, revisão Swagger em produção |
| 6.1 | Planejado | Núcleo operacional | Events, Calendar, ContactMessages, SiteSettings |
| 6.2 | Planejado | Conteúdo institucional e espiritual | Orixas, UmbandaLines, SpiritualContents |
| 6.3 | Planejado | Operação e governança | Dashboard stats, activity logs, trilha de auditoria |
| 6.4 | Planejado | Hardening avançado | MFA, RBAC granular, WAF, SIEM, pentests contínuos |

### 6.0 — Fundação Técnica e Contratos

**Objetivo:** preparar a base para implementação sem divergência entre frontend, backend e infraestrutura.

#### Entregas

- Consolidar contratos OpenAPI 3.0 por domínio
- Padronizar envelopes JSON, paginação, filtros e ordenação
- Garantir serialização consistente de enums como string
- Definir DTOs de listagem e detalhe por domínio
- Revisar exposição do Swagger em produção e restringir acesso administrativo
- Configurar políticas de rate limiting distintas para público, admin e auth

#### Critérios de saída

- Contratos revisados contra `docs/Backlog-Executavel.md`
- Sem dependência de dados mockados para os domínios prioritários da Fase 6.1
- OpenAPI apto para uso pelo AdminDashboard e pelo PublicWebsite

### 6.1 — Núcleo Operacional

**Objetivo:** substituir os principais dados mockados do PublicWebsite e habilitar operação real pelo AdminDashboard.

#### Épicos priorizados

| Epic | Rotas | Prioridade | Dependências |
|------|-------|------------|--------------|
| EP-Events | `/api/events`, `/api/public/events` | P0 | Fundação técnica, DTOs, regras de domínio |
| EP-Calendar | `/api/calendar/attendances`, `/api/public/calendar/attendances` | P1 | Fundação técnica, capacidade/transações (movido para posição 8 na execução por alta complexidade — 13 pts) |
| EP-SiteSettings | `/api/site-settings`, `/api/public/site-settings` | P0 | modelagem de conteúdo institucional |
| EP-Contact | `/api/public/contact-messages` | P0 | validação, anti-spam, auditoria |

#### Resultados esperados

- PublicWebsite deixa de depender de mocks para eventos, contato e doações/localização institucionais
- AdminDashboard passa a operar CRUD real para eventos e site settings
- Contato público com processamento controlado, auditável e protegido por rate limiting
- Calendar (P1) será implementado após validar padrões nos domínios mais simples

### 6.2 — Conteúdo Institucional e Espiritual

**Objetivo:** tornar dinâmicas as seções educativas e institucionais do site público.

#### Épicos priorizados

| Epic | Rotas | Prioridade | Dependências |
|------|-------|------------|--------------|
| EP-Orixas | `/api/orixas`, `/api/public/orixas` | P1 | fundação técnica, DTOs, ordenação |
| EP-UmbandaLines | `/api/umbanda-lines`, `/api/public/umbanda-lines` | P1 | fundação técnica |
| EP-SpiritualContents | `/api/spiritual-contents`, `/api/public/spiritual-contents` | P1 | sanitização, busca, categorização |

#### Resultados esperados

- Orixás, Linhas da Umbanda e Orações passam a ser gerenciados via AdminDashboard
- PublicWebsite consome conteúdo versionado, auditável e com cache adequado

### 6.3 — Operação, Dashboard e Auditoria

**Objetivo:** dar visibilidade operacional e governança ao painel administrativo.

#### Épicos priorizados

| Epic | Rotas | Prioridade | Dependências |
|------|-------|------------|--------------|
| EP-Dashboard | `/api/dashboard/stats`, `/api/dashboard/activity-logs` | P1 | logs estruturados, auditoria persistente |
| EP-Audit | transversal | P1 | Serilog, storage/indexação de logs, retenção e correlação com SIEM |

#### Resultados esperados

- Métricas administrativas reais
- Trilhas de auditoria por usuário, entidade e ação
- Base para relatórios futuros e troubleshooting rápido
- Cobertura explícita da trilha de auditoria no backlog e no dashboard administrativo

### 6.4 — Segurança Avançada e Hardening Contínuo

**Objetivo:** fechar lacunas remanescentes da Fase 5 e elevar o nível de segurança para operação contínua em produção.

#### Itens principais

- MFA para Admin (TOTP com fallback SMS e suporte futuro a WebAuthn/biometria)
- RBAC granular por endpoint e operação
- Rate limiting por IP e por token conforme diretrizes do planejamento
- Validações alinhadas a OWASP Top 10, com sanitização e encoding
- Integração WAF + SIEM + alertas
- Pentest automatizado no pipeline CI/CD
- Conclusão do HTTPS com domínio válido e certificados gerenciados

#### Relação com a Fase 5

- A Fase 5 continua sendo o registro histórico do hardening já executado
- A Fase 6.4 absorve a continuidade operacional e os novos requisitos de segurança exigidos pela API pública e pelo CMS

### Cronograma Consolidado da Fase 6

| Janela | Marco | Gate |
|--------|-------|------|
| D0–D2 | Contratos, segurança base, OpenAPI, políticas de acesso | Gate 1: contratos e segurança aprovados |
| D3 | Revisão parcial com stakeholders e pares | Seguimento autorizado |
| D4–D6 | Events, Calendar, ContactMessages, SiteSettings | Gate 2: núcleo operacional aprovado |
| D6 | Smoke tests de SLA e segurança em staging | Seguimento autorizado |
| D7–D9 | Orixas, UmbandaLines, SpiritualContents, Dashboard/Audit | Gate 3: conteúdo e governança aprovados |
| D10 | Revisão final, readiness operacional e go/no-go | Aprovação final |

### Critérios de Pronto da Fase 6

- Endpoint implementado com validação, autenticação/autorização e auditoria quando aplicável
- Documentado em OpenAPI e refletido no `docs/Backlog-Executavel.md`
- Testes unitários e de integração adicionados conforme criticidade
- Sem mocks remanescentes nos domínios já migrados
- Compatível com o path base `/batuara-api`
- Logs estruturados e métricas mínimas disponíveis
- Épicos transversais de contato, auditoria e documentação devidamente rastreados entre roadmap e backlog

### Ordem Recomendada de Execução (por facilidade + criticidade)

> Ordem otimizada considerando dependências técnicas, complexidade de implementação e valor entregue por ciclo.
> Cada item deve gerar um PR independente para facilitar review e reduzir risco.

| # | Item | Bloco | Pontos | Justificativa da ordem |
|---|------|-------|--------|------------------------|
| 1 | Fundação técnica e contratos | 6.0 | — | Pré-requisito de tudo: DTOs, envelopes, OpenAPI, rate limiting, Swagger restrito |
| 2 | EP-SiteSettings (público + admin) | 6.1 | 5 | Mais simples dos CRUDs; valida a fundação técnica end-to-end sem regras de domínio complexas |
| 3 | EP-Events (público + admin) | 6.1 | 5+8+5+3+3 | CRUD completo com regras de domínio (conflito, datas), filtros, paginação, soft delete e listagem admin |
| 4 | EP-Contact (público) | 6.1 | 5 | Endpoint único (POST) com validação, rate limit e anti-spam — rápido de implementar |
| 5 | EP-Orixas (público + admin) | 6.2 | 3+8 | CRUD com ordenação e arrays (cores, elementos) — reutiliza padrões do EP-Events |
| 6 | EP-UmbandaLines (público + admin) | 6.2 | 8 | Mesma estrutura de EP-Orixas, com entities e workingDays |
| 7 | EP-SpiritualContents (público + admin) | 6.2 | 8 | CRUD com busca textual, categorização e sanitização XSS |
| 8 | EP-Calendar (público + admin + inscrições) | 6.1 | 5+13+8+8 | Mais complexo: concorrência, capacidade, idempotência, transações atômicas + CRUD admin completo |
| 9 | EP-Dashboard (H-060) | 6.3 | 8 | Depende de todos os domínios anteriores para ter dados reais e logs acumulados |
| 10 | EP-Audit (H-061) | 6.3 | 8 | Trilha de auditoria transversal — retenção, indexação e correlação com SIEM |
| 11 | MFA, RBAC granular, WAF/SIEM, HTTPS | 6.4 | 13+ | Hardening avançado — executável após toda a API estar funcional |

**Nota sobre EP-Calendar:** Movido para posição 8 (antes era 3) porque a H-011 (inscrição com controle de capacidade e idempotência) é a história mais complexa do backlog (13 pontos). É melhor validar os padrões em domínios mais simples antes.

---

## Resumo de PRs

| PR | Fase | Descrição | Status |
|----|------|-----------|--------|
| [#1](https://github.com/guelfi/Batuara.net/pull/1) | Fase 1 | Remover credenciais expostas e hardening de segurança | Merged |
| [#2](https://github.com/guelfi/Batuara.net/pull/2) | Fase 2 | Estabilidade da API e melhorias de infraestrutura | Merged |
| [#3](https://github.com/guelfi/Batuara.net/pull/3) | Fase 2.1 | Validação de JWT Secret | Merged |
| [#4](https://github.com/guelfi/Batuara.net/pull/4) | Fase 3 | Limpeza Arquitetural e Unificação de Auth | Merged |
| [#5](https://github.com/guelfi/Batuara.net/pull/5) | Fase 4 | CI/CD com GitHub Actions e deploy na OCI | Merged |
| [#6](https://github.com/guelfi/Batuara.net/pull/6) | Fase 4 | Correções críticas no deploy script | Merged |
| [#7](https://github.com/guelfi/Batuara.net/pull/7) | Fase 4 | Suporte a chave SSH base64 no deploy | Merged |
| [#8](https://github.com/guelfi/Batuara.net/pull/8) | Fase 4 | Corrigir line endings Windows na chave SSH | Merged |
| [#9](https://github.com/guelfi/Batuara.net/pull/9) | Fase 4 | Usar webfactory/ssh-agent para SSH | Merged |
| [#10](https://github.com/guelfi/Batuara.net/pull/10) | Fase 4 | Corrigir nome do secret SSH | Merged |
| [#11](https://github.com/guelfi/Batuara.net/pull/11) | Pós-Deploy | Fix deadlock no interceptor de auth | Merged |
| [#12](https://github.com/guelfi/Batuara.net/pull/12) | Pós-Deploy | Preservar silent token refresh | Merged |
| [#14](https://github.com/guelfi/Batuara.net/pull/14) | Docs | Criar Correcoes.md e atualizar README.md | Merged |
| [#15](https://github.com/guelfi/Batuara.net/pull/15) | Docs | Remover PROJETO.md/STATUS.md, criar ROADMAP.md | Merged |
| [#16](https://github.com/guelfi/Batuara.net/pull/16) | Docs | Reorganizar Fase 5 por facilidade+criticidade | Merged |
| [#17](https://github.com/guelfi/Batuara.net/pull/17) | Fase 5 | Hardening: secret scanning, audit, CSP, logging, backup, runbook | Merged |
| [#18](https://github.com/guelfi/Batuara.net/pull/18) | Fase 5 | Correções de CI/build da Fase 5 | Merged |
| #19–#31 | Dependabot | Atualizações automáticas de dependências (React 19, MUI 7, .NET packages) | Merged |
| [#32](https://github.com/guelfi/Batuara.net/pull/32) | Fix | Downgrade Swashbuckle, fix MUI Grid v7, web-vitals v4, React 19 compat, Dockerfiles | Merged |
| [#33](https://github.com/guelfi/Batuara.net/pull/33) | Fix | Corrigir Docker Build Test (npm ci + remover App.test.tsx boilerplate) | Merged |

---

## Contexto para Ferramentas de IA

### Estrutura do Projeto

```
Batuara.net/
├── src/
│   ├── Backend/
│   │   ├── Batuara.API/            # API principal (.NET 8, ASP.NET Core)
│   │   ├── Batuara.Application/    # Camada de aplicação (interfaces, models, DTOs)
│   │   ├── Batuara.Domain/         # Camada de domínio (entidades)
│   │   ├── Batuara.Infrastructure/ # Infraestrutura (EF Core, DbContext, serviços)
│   │   └── Batuara.Auth/           # [DEPRECADO] Migrado para Batuara.API
│   └── Frontend/
│       ├── PublicWebsite/          # Website público (React 19 + TypeScript + MUI 7)
│       └── AdminDashboard/         # Dashboard admin (React 19 + TypeScript + MUI 7)
├── .github/workflows/
│   ├── ci.yml                      # CI: build .NET, frontends, Docker
│   └── deploy-oci.yml              # CD: deploy rolling na OCI
├── scripts/
│   ├── ci/deploy-rolling.sh        # Script de deploy com zero-downtime
│   └── backup/                     # [FASE 5] Scripts de backup
├── nginx/batuara.conf              # Configuração do reverse proxy
├── docker-compose.production.yml   # Orquestração de produção
├── Dockerfile.api                  # Build da API .NET
├── Dockerfile.frontend             # Build do Public Website
├── Dockerfile.admin                # Build do Admin Dashboard
└── ROADMAP.md                      # Este documento
```

### Stack Tecnológica

- **Backend:** .NET 8 / ASP.NET Core / Entity Framework Core / PostgreSQL
- **Frontend:** React 19 / TypeScript / Material-UI (MUI 7) / React Router v6
- **Infraestrutura:** Docker / Docker Compose / Nginx / GitHub Actions
- **Servidor:** Oracle Cloud Infrastructure (OCI) — Ubuntu

### Convenções do Projeto

- Branch principal: `master` (não `main`)
- Prefixo de branches: `devin/<timestamp>-<descrição>` ou `feature/<descrição>`
- Commits em português ou inglês, preferencialmente com prefixo semântico (`fix:`, `feat:`, `docs:`, `security:`, `infra:`, `arch:`)
- PRs sempre direcionados para `master`
- CI obrigatório antes de merge
- Deploy automático após merge no `master`

### Credenciais de Desenvolvimento

- Login do Admin Dashboard: `<email-admin>` / `<senha-admin>`
- Defina as credenciais localmente (não inclua senhas reais no repositório)

### URLs de Produção

- **Public Website:** `http://<OCI_HOST>/batuara-public/`
- **Admin Dashboard:** `http://<OCI_HOST>/batuara-admin/`
- **API Swagger:** `http://<OCI_HOST>/batuara-api/swagger/index.html`
- **API Health Check:** `http://<OCI_HOST>/batuara-api/health`

---

## Guia de Início de Sessão

### Para Ferramentas de IA

Ao iniciar uma nova sessão de trabalho com este projeto:

1. **Primeiro passo:** Ler este arquivo (`ROADMAP.md`) para entender o histórico e a fase ativa
2. **Segundo passo:** Ler `docs/EFT-especificacao-funcional-tecnica.md` para arquitetura, segurança e contratos
3. **Terceiro passo:** Ler `docs/Backlog-Executavel.md` para prioridade, dependências e histórias
4. **Verificar fase ativa:**
   - Se o tema for hardening/infra, usar a Fase 5
   - Se o tema for API/CMS/rotas do AdminDashboard/PublicWebsite, usar a Fase 6
5. **Durante a execução:**
   - Ao iniciar um item: mudar `[ ]` para `[→]` (em andamento)
   - Ao completar: mudar para `[x]` (concluído)
   - Ao abrir PR: atualizar coluna "PR" com link
6. **Final de sessão:**
   - Atualizar data de conclusão na tabela
   - Adicionar entrada no "Histórico de Execução"
   - Atualizar o `ROADMAP.md` e, se necessário, os documentos em `docs/`

### Prioridade de Execução

Ordem recomendada a partir do estado atual do projeto (otimizada por facilidade + criticidade):

1. **Fase 6.0** — Fundação técnica e contratos (pré-requisito de tudo)
2. **Fase 6.1 / EP-SiteSettings** — CRUD mais simples, valida a fundação end-to-end (5 pts)
3. **Fase 6.1 / EP-Events** — CRUD completo: listar, criar, editar, excluir, listagem admin (5+8+5+3+3 = 24 pts)
4. **Fase 6.1 / EP-Contact** — Endpoint único, rápido de implementar (5 pts)
5. **Fase 6.2 / EP-Orixas** — Reutiliza padrões do EP-Events (3+8 = 11 pts)
6. **Fase 6.2 / EP-UmbandaLines** — Mesma estrutura de EP-Orixas (8 pts)
7. **Fase 6.2 / EP-SpiritualContents** — CRUD com busca e sanitização XSS (8 pts)
8. **Fase 6.1 / EP-Calendar** — Mais complexo: público, inscrições e CRUD admin (5+13+8+8 = 34 pts)
9. **Fase 6.3 / EP-Dashboard** — Métricas e atividade administrativa (8 pts)
10. **Fase 6.3 / EP-Audit** — Trilha de auditoria transversal (8 pts)
11. **Fase 6.4** — MFA, WAF/SIEM e fechamento do HTTPS (13+ pts; item 5.3 continua dependente de domínio válido)

> **Total estimado:** 124 story points (19 histórias)

### Atalhos de Comando

```bash
# Verificar estado atual do projeto
git log --oneline -10

# Verificar branch atual
git branch --show-current

# Verificar status dos containers em produção
ssh ubuntu@<OCI_HOST> "docker ps"

# Health check da API
curl http://<OCI_HOST>/batuara-api/health
```
