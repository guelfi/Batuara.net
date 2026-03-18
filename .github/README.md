# CI/CD - GitHub Actions para Batuara.net

## Workflows

### 1. `ci.yml` - Integracao Continua
**Trigger**: Push e Pull Request para `master`

**Jobs**:
1. **build-api** - Restore, build e publish do .NET 8 API
2. **build-public-website** - npm ci + build do React (PublicWebsite)
3. **build-admin-dashboard** - npm ci + build do React (AdminDashboard)
4. **docker-build** - Valida que as 3 imagens Docker constroem corretamente

### 2. `deploy-oci.yml` - Deploy para Oracle Cloud
**Trigger**: Push para `master` (merge de PRs) ou dispatch manual

**Etapas**:
1. Configura chave SSH para acesso ao servidor OCI
2. Envia script de deploy rolling para o servidor
3. Executa deploy com rolling update (um container por vez)
4. Verifica health checks apos deploy
5. Limpa chave SSH

**Protecoes**:
- Concurrency lock: apenas um deploy por vez
- Database NUNCA e tocado/reconstruido
- Rolling update: containers sao atualizados individualmente
- Rollback automatico se API falhar health check
- Health check com timeout de 120s para cada servico

## Secrets Obrigatorios

Configure em: **Settings > Secrets and variables > Actions**

| Secret | Descricao | Exemplo |
|--------|-----------|---------|
| `OCI_SSH_PRIVATE_KEY` | Chave SSH privada (texto plano, incluindo BEGIN/END) | Conteudo completo do arquivo `.key` |
| `OCI_HOST` | IP publico do servidor Oracle Cloud | `129.153.86.168` |
| `OCI_USER` | Usuario SSH do servidor | `ubuntu` ou `opc` |
| `DB_PASSWORD` | Senha do PostgreSQL em producao | Gerar com `openssl rand -base64 32` |
| `JWT_SECRET` | Secret para assinatura JWT (min 32 chars) | Gerar com `openssl rand -base64 64` |

## Como Configurar

1. Acesse o repositorio no GitHub
2. Va em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret da tabela acima
5. Opcional: crie um Environment chamado `production` para protecao extra

### OCI_SSH_PRIVATE_KEY - Como Configurar

Cole o conteudo completo da chave SSH privada, incluindo as linhas
`-----BEGIN ... PRIVATE KEY-----` e `-----END ... PRIVATE KEY-----`.

O workflow usa `webfactory/ssh-agent` que gerencia a chave automaticamente
(sem problemas de formatacao com newlines).

## Estrutura do Deploy Rolling

```
1. git pull (atualiza codigo no servidor)
2. Verifica se PostgreSQL esta rodando (NAO reconstroi)
3. Reconstroi e reinicia API -> espera health check OK
4. Reconstroi e reinicia PublicWebsite -> espera health check OK
5. Reconstroi e reinicia AdminDashboard -> espera health check OK
6. Limpeza de imagens Docker antigas
```

Se a API falhar o health check, o deploy faz rollback automatico para o commit anterior.

## Deploy Manual

Para triggerar um deploy manualmente:
1. Va em **Actions** > **CD - Deploy to OCI**
2. Clique em **Run workflow**
3. Selecione a branch `master`

## Troubleshooting

### Verificar status no servidor
```bash
ssh usuario@servidor
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep batuara
curl -sf http://localhost:3003/health
```

### Health check completo
```bash
cd /var/www/batuara_net/Batuara.net
./scripts/oracle/health-check.sh full
```

### Rollback manual
```bash
cd /var/www/batuara_net/Batuara.net
git log --oneline -5  # encontrar commit anterior
git checkout <commit-anterior> -- .
docker compose -f scripts/docker/docker-compose.production.yml up -d --build --no-deps api publicwebsite admindashboard
```
