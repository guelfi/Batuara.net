# Runbook de Operações — Batuara.net

> Manual de referência rápida para operação e manutenção do sistema.
> Última atualização: Março/2026

---

## 1. Acesso ao Servidor

### SSH
```bash
ssh ubuntu@<OCI_HOST>
```

### Verificar Status dos Containers
```bash
docker ps
docker-compose -f /opt/batuara/docker-compose.production.yml ps
```

---

## 2. URLs de Produção

| Serviço | URL |
|---------|-----|
| Public Website | `http://<OCI_HOST>/batuara-public/` |
| Admin Dashboard | `http://<OCI_HOST>/batuara-admin/` |
| API Swagger | `http://<OCI_HOST>/batuara-api/swagger/index.html` |
| API Health | `http://<OCI_HOST>/batuara-api/health` |

---

## 3. Verificação de Saúde

### Health Check da API
```bash
curl http://<OCI_HOST>/batuara-api/health
```

Resposta esperada:
```json
{"status":"Healthy","totalDuration":"..."}
```

### Verificar Logs da API
```bash
docker logs batuara-api --tail 100 -f
```

### Verificar Logs do Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Verificar Uso de Recursos
```bash
docker stats
df -h
free -h
```

---

## 4. Deploy Manual (Sem CI/CD)

### Fazer deploy manualmente em produção:

```bash
cd /opt/batuara

# Parar containers atuais
docker-compose -f docker-compose.production.yml down

# Pull da imagem mais recente
docker-compose -f docker-compose.production.yml pull

# Subir containers
docker-compose -f docker-compose.production.yml up -d

# Verificar status
docker-compose -f docker-compose.production.yml ps

# Verificar health
curl http://localhost:8080/batuar_/_health
```

### Deploy Rolling (Zero-Downtime)
```bash
cd /opt/batuara
./scripts/ci/deploy-rolling.sh
```

---

## 5. Rollback para Versão Anterior

### Identificar versão atual:
```bash
docker images | grep batuara
```

### Rollback manual:
```bash
cd /opt/batuara

# Exemplo: voltar para tag específica
docker stop batuara-api batuara-public batuara-admin

# Se existir imagem anterior
docker tag batuara-api:<tag-anterior> batuara-api:latest
docker tag batuara-public:<tag-anterior> batuara-public:latest
docker tag batuara-admin:<tag-anterior> batuara-admin:latest

# Subir novamente
docker-compose -f docker-compose.production.yml up -d
```

### Via Git (reverter alterações):
```bash
git checkout <commit-anterior>
git push origin master
# CI/CD vai fazer deploy automaticamente
```

---

## 6. Troubleshooting

### API não responde

1. Verificar se container está rodando:
```bash
docker ps | grep batuara-api
```

2. Ver logs:
```bash
docker logs batuara-api --tail 200
```

3. Verificar variáveis de ambiente:
```bash
docker exec batuara-api env | grep -E "ConnectionStrings|JWT|Database"
```

4. Verificar conexão com banco:
```bash
docker exec batuara-api dotnet /app/Batuara.API.dll exec-api-command check-db
```

### Frontend carrega em branco

1. Verificar se Nginx está servindo arquivos:
```bash
curl -I http://<OCI_HOST>/batuara-admin/index.html
```

2. Verificar logs do Nginx:
```bash
tail -50 /var/log/nginx/error.log
```

3. Verificar se arquivos existem:
```bash
docker exec batuara-nginx ls -la /usr/share/nginx/html/batuara-admin/
```

### Banco de dados não conecta

1. Verificar se PostgreSQL está rodando:
```bash
docker ps | grep postgres
```

2. Testar conexão:
```bash
docker exec batuara-postgres pg_isready -U postgres
```

3. Verificar logs:
```bash
docker logs batuara-postgres --tail 100
```

4. Testar conexão da API:
```bash
docker exec batuara-api dotnet /app/Batuara.API.dll exec-api-command check-db
```

---

## 7. Backup e Restauração

### Verificar Backups
```bash
ls -lh /var/backups/batuara/
```

### Executar Backup Manual
```bash
/opt/batuara/scripts/backup/backup-postgres.sh
```

### Restaurar Backup
```bash
/opt/batuara/scripts/backup/restore-postgres.sh /var/backups/batuara/batuar_YYYYMMDD_HHMMSS.sql.gz
```

### Verificar Logs de Backup
```bash
tail -f /var/log/batuara-backup.log
```

---

## 8. Rotação de Secrets

### JWT Secret
```bash
# Gerar novo secret
openssl rand -base64 64

# Atualizar no .env
nano /opt/batuara/.env

# Reiniciar API
docker-compose -f /opt/batuara/docker-compose.production.yml restart batuara-api
```

### Senha do Banco
```bash
# Atualizar no .env
nano /opt/batuara/.env

# Atualizar no PostgreSQL (se necessário)
docker exec batuara-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'nova_senha';"

# Reiniciar API
docker-compose -f /opt/batuara/docker-compose.production.yml restart batuara-api
```

---

## 9. Monitoramento

### Verificar Uso de Disco
```bash
df -h
docker system df
```

### Limpar Imagens/Volumes Não Utilizados
```bash
docker system prune -a
docker volume prune
```

### Verificar Logs por Período
```bash
# Últimas 24h
journalctl --since "24 hours ago" | grep batuara

# Intervalo específico
journalctl --since "2026-03-24 00:00" --until "2026-03-24 12:00"
```

---

## 10. Procedimento de Emergência

### Se todo o sistema está down:

1. **Verificar status dos containers:**
```bash
docker ps -a
```

2. **Se containers parados:**
```bash
cd /opt/batuara
docker-compose -f docker-compose.production.yml restart
```

3. **Se não iniciar, verificar logs:**
```bash
docker-compose -f docker-compose.production.yml logs
```

4. **Verificar recursos:**
```bash
docker stats
df -h
free -h
```

5. **Verificar portas:**
```bash
netstat -tlnp | grep -E '80|443|5432|8080'
```

6. **Reiniciar tudo do zero:**
```bash
cd /opt/batuara
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

---

## 11. Contatos de Emergência

| Situação | Ação |
|----------|------|
| API down | Verificar health check e logs |
| Banco down | Verificar container PostgreSQL |
| Frontend blank | Verificar Nginx e arquivos estáticos |
| Deploy falhou | Verificar CI/CD e GitHub Actions |

---

## 12. Links Úteis

- **GitHub Repo:** https://github.com/guelfi/Batuara.net
- **Swagger API:** http://<OCI_HOST>/batuara-api/swagger/
- **Health Check:** http://<OCI_HOST>/batuara-api/health

---

*Para dúvidas ou problemas não cobertos neste runbook, consulte o ROADMAP.md ou abra uma issue no GitHub.*
