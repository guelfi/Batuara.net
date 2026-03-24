# Batuara.net - Registro de Correções, Melhorias e Roadmap

> Documento de referência para desenvolvedores e ferramentas de assistência por IA (Devin, Codex, Claude, Gemini, Warp Terminal, Opencode, Antigravity, Trae, Qoder e outras).
> Última atualização: Março/2026

---

## Visão Geral

Este documento registra todas as correções e melhorias aplicadas ao projeto Batuara.net, organizadas por fases de execução. Também descreve o que ainda precisa ser implementado na Fase 5 (Hardening), servindo como guia para continuidade do trabalho.

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

## Fase 5 — Hardening e Melhorias de Segurança (Pendente)

**Status:** Pendente  
**Objetivo:** Fortalecer a segurança, observabilidade e resiliência do sistema em produção.

> Itens ordenados por facilidade de implementação + criticidade. Itens mais rápidos e de maior impacto primeiro.

### 5.1 — Secret Scanning no CI

**Prioridade:** Alta  
**Facilidade:** Muito fácil  
**Estimativa:** 2 horas

**O que fazer:**
- Adicionar [gitleaks](https://github.com/gitleaks/gitleaks) como step no workflow de CI (`.github/workflows/ci.yml`)
- Configurar para escanear commits em PRs e no branch `master`
- Criar arquivo `.gitleaks.toml` com regras customizadas se necessário
- Bloquear merge de PRs que contenham credenciais detectadas

**Arquivos a modificar:**
- `.github/workflows/ci.yml` — Adicionar job de secret scanning
- `.gitleaks.toml` (novo) — Configuração de regras

**Referência:**
```yaml
- name: Secret Scanning
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5.2 — Audit de Dependências Vulneráveis

**Prioridade:** Alta  
**Facilidade:** Fácil  
**Estimativa:** 2-3 horas

**O que fazer:**
- Adicionar `npm audit` e `dotnet list package --vulnerable` no workflow de CI
- O CI já detectou vulnerabilidade no `AutoMapper 15.0.1` — avaliar atualização
- Configurar para falhar o CI em vulnerabilidades de severidade alta/crítica
- Avaliar uso de `Dependabot` ou `Renovate` para atualização automática de dependências

**Arquivos a modificar:**
- `.github/workflows/ci.yml` — Adicionar steps de audit
- `.github/dependabot.yml` (novo) — Configuração do Dependabot

**Exemplo de configuração do Dependabot:**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/src/Frontend/PublicWebsite"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/src/Frontend/AdminDashboard"
    schedule:
      interval: "weekly"
  - package-ecosystem: "nuget"
    directory: "/src/Backend/Batuara.API"
    schedule:
      interval: "weekly"
```

### 5.3 — HTTPS com Let's Encrypt

**Prioridade:** Crítica  
**Facilidade:** Média  
**Estimativa:** 2-3 horas

**O que fazer:**
- Instalar Certbot no servidor OCI
- Obter certificado SSL para o domínio/IP
- Configurar Nginx para servir HTTPS (porta 443) e redirecionar HTTP (80) para HTTPS
- Configurar renovação automática do certificado (cron)
- Atualizar URLs de produção nos frontends se necessário

**Por que é crítico:**
- Produção atualmente roda em HTTP — credenciais de login e tokens JWT trafegam em texto plano
- Vulnerável a ataques man-in-the-middle
- Navegadores modernos marcam sites HTTP como "Não Seguro"

**Arquivos a modificar:**
- `nginx/batuara.conf` — Adicionar bloco server HTTPS, redirecionar HTTP para HTTPS
- `scripts/ci/deploy-rolling.sh` — Ajustar health check se URLs mudarem para HTTPS

**Nota:** Let's Encrypt não emite certificados para endereços IP puros. Se o servidor usar apenas IP (sem domínio), será necessário configurar um domínio apontando para o IP, ou usar um certificado self-signed como alternativa temporária.

**Referência:**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d batuara.net -d www.batuara.net

# Renovação automática (já configurado pelo Certbot)
sudo certbot renew --dry-run
```

### 5.4 — Content Security Policy Mais Restritivo

**Prioridade:** Média  
**Facilidade:** Média  
**Estimativa:** 2-3 horas

**O que fazer:**
- Expandir os headers CSP no `SecurityHeadersMiddleware.cs` para bloquear inline scripts
- Configurar CSP no Nginx (`nginx/batuara.conf`) como camada adicional
- Adicionar `nonce` ou `hash` para scripts inline necessários
- Testar que as aplicações frontend continuam funcionando após a restrição

**Arquivos a modificar:**
- `src/Backend/Batuara.API/Middleware/SecurityHeadersMiddleware.cs`
- `nginx/batuara.conf`

**Estado atual do CSP:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

**CSP recomendado:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' <API_URL>; frame-ancestors 'none';
```

### 5.5 — Logging Centralizado (Serilog)

**Prioridade:** Alta  
**Facilidade:** Média  
**Estimativa:** 3-5 horas

**O que fazer:**
- O Serilog já está instalado (`Serilog.AspNetCore` e `Serilog.Sinks.File` no `.csproj`)
- Configurar output estruturado (JSON) para facilitar parsing
- Adicionar rotação de arquivos de log (por tamanho e data)
- Configurar níveis de log por namespace (ex: `Warning` para Microsoft, `Information` para Batuara)
- Adicionar enriquecimento de logs (request ID, user ID, IP)

**Arquivos a modificar:**
- `src/Backend/Batuara.API/Program.cs` — Configuração do Serilog
- `appsettings.json` — Seção de configuração de logging

**Exemplo de configuração:**
```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File("logs/batuara-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        formatter: new JsonFormatter())
    .CreateLogger();
```

### 5.6 — Backup Automatizado do PostgreSQL

**Prioridade:** Alta  
**Facilidade:** Média  
**Estimativa:** 3-4 horas

**O que fazer:**
- Criar script de backup usando `pg_dump` dentro do container PostgreSQL
- Implementar rotação de backups (manter últimos 7 diários e 4 semanais)
- Configurar agendamento via cron no servidor OCI
- Documentar processo de restauração
- Opcionalmente, enviar backups para storage externo (OCI Object Storage)

**Arquivos a criar:**
- `scripts/backup/backup-postgres.sh` — Script de backup
- `scripts/backup/restore-postgres.sh` — Script de restauração
- `scripts/backup/setup-cron.sh` — Configuração do cron

**Exemplo de script de backup:**
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/batuara"
mkdir -p $BACKUP_DIR

docker exec batuara-postgres pg_dump -U postgres batuara > "$BACKUP_DIR/batuara_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/batuara_$TIMESTAMP.sql"

# Rotação: manter últimos 7 dias
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 5.7 — Runbook de Operações

**Prioridade:** Média  
**Facilidade:** Fácil (documentação pura)  
**Estimativa:** 3-4 horas

**O que fazer:**
- Documentar procedimentos operacionais para manutenção do sistema
- Incluir: deploy manual, rollback, troubleshooting, restauração de backup
- Formato: Markdown com comandos copy-paste prontos para uso
- Depende dos itens anteriores para documentar procedimentos completos

**Arquivo a criar:**
- `docs/RUNBOOK.md`

**Seções recomendadas:**
1. Acesso ao servidor (SSH)
2. Verificação de status dos serviços
3. Deploy manual (sem CI/CD)
4. Rollback para versão anterior
5. Troubleshooting da API (logs, health check, DB)
6. Backup e restauração do banco
7. Rotação de secrets (JWT, DB password)
8. Monitoramento e alertas
9. Procedimento de emergência (serviço down)

---

### Melhorias Futuras (Opcionais)

Itens identificados durante análise dos arquivos PROJETO.md e STATUS.md. Não são críticos no momento atual mas podem ser implementados conforme o projeto cresce:

- **docker-compose.local.yml** — Docker Compose dedicado para ambiente de desenvolvimento completo (já existe `docker-compose.db.yml` para PostgreSQL e os frontends rodam com `npm start`)
- **Script dev.sh** — Script para subir todo o ambiente de desenvolvimento com um único comando (os passos já estão documentados no README.md)

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
│       ├── PublicWebsite/          # Website público (React 18 + TypeScript + MUI)
│       └── AdminDashboard/         # Dashboard admin (React 18 + TypeScript + MUI)
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
- **Frontend:** React 18 / TypeScript / Material-UI (MUI) / React Router v6
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

- Login do Admin Dashboard: `admin@casabatuara.org.br` / `admin123`
- Essas credenciais são apenas para ambiente de desenvolvimento

### URLs de Produção

- **Public Website:** `http://<OCI_HOST>/batuara-public/`
- **Admin Dashboard:** `http://<OCI_HOST>/batuara-admin/`
- **API Swagger:** `http://<OCI_HOST>/batuara-api/swagger/index.html`
- **API Health Check:** `http://<OCI_HOST>/batuara-api/health`
