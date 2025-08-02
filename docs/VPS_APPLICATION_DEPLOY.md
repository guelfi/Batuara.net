# 🚀 Guia de Deploy das Aplicações - Batuara.net

Este guia contém o passo a passo para fazer deploy das aplicações Batuara.net em um VPS já configurado.

## 📋 Pré-requisitos

- VPS configurado conforme [Guia de Infraestrutura](./VPS_INFRASTRUCTURE_SETUP.md)
- Docker e Docker Compose instalados
- Acesso SSH ao servidor
- Git configurado

## 🔄 1. Preparação do Ambiente

### 1.1 Conectar ao Servidor

```bash
# Conectar via SSH
ssh batuara@SEU_IP_VPS
# ou
ssh root@SEU_IP_VPS
```

### 1.2 Navegar para Diretório de Projetos

```bash
cd /var/www
```

## 📥 2. Clonar o Repositório

### 2.1 Clonar do GitHub

```bash
# Clonar repositório
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net

# Verificar branch
git branch -a
git status
```

### 2.2 Verificar Estrutura do Projeto

```bash
# Verificar arquivos essenciais
ls -la

# Verificar Dockerfiles
ls -la Dockerfile*

# Verificar assets
ls -la src/Frontend/PublicWebsite/public/
ls -la src/Frontend/AdminDashboard/public/
```

## ⚙️ 3. Configuração do Ambiente

### 3.1 Criar Arquivo de Configuração

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

### 3.2 Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```bash
# Configuração de Portas
PUBLIC_WEBSITE_PORT=3000
ADMIN_DASHBOARD_PORT=3001
API_PORT=8080

# Configuração da API
REACT_APP_API_URL=http://SEU_IP_VPS:8080

# Database (quando necessário)
DB_PASSWORD=sua_senha_segura_aqui

# Ambiente
ENVIRONMENT=production

# Configurações opcionais
COMPOSE_PROJECT_NAME=batuara
```

## 🐳 4. Build e Deploy das Aplicações

### 4.1 Verificar Docker Compose

```bash
# Verificar configuração
docker compose -f docker-compose.production.yml config

# Verificar se não há erros de sintaxe
echo $?  # Deve retornar 0
```

### 4.2 Build das Imagens

```bash
# Build das aplicações (pode demorar 5-10 minutos)
docker compose -f docker-compose.production.yml build --no-cache

# Verificar se as imagens foram criadas
docker images | grep batuara
```

### 4.3 Iniciar os Serviços

```bash
# Iniciar aplicações
docker compose -f docker-compose.production.yml up -d

# Verificar status dos containers
docker compose -f docker-compose.production.yml ps
```

## 🔍 5. Verificação e Testes

### 5.1 Verificar Containers

```bash
# Status dos containers
docker ps

# Logs das aplicações
docker compose -f docker-compose.production.yml logs -f publicwebsite
docker compose -f docker-compose.production.yml logs -f admindashboard
```

### 5.2 Testar Aplicações Localmente

```bash
# Testar PublicWebsite
curl -I http://localhost:3000

# Testar AdminDashboard
curl -I http://localhost:3001

# Testar assets específicos
curl -I http://localhost:3000/favicon.ico
curl -I http://localhost:3000/batuara_logo.png
curl -I http://localhost:3001/favicon.ico
curl -I http://localhost:3001/batuara_logo.png
```

### 5.3 Testar Acesso Externo

```bash
# Do seu computador local, teste:
# PublicWebsite: http://SEU_IP_VPS:3000
# AdminDashboard: http://SEU_IP_VPS:3001/dashboard
```

## 🌐 6. Configuração de Proxy Reverso (Opcional)

### 6.1 Configurar Nginx para Domínio

Se você tem um domínio, crie configurações do Nginx:

```bash
# Criar configuração para PublicWebsite
cat > /etc/nginx/sites-available/batuara-public << 'EOF'
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Criar configuração para AdminDashboard
cat > /etc/nginx/sites-available/batuara-admin << 'EOF'
server {
    listen 80;
    server_name admin.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sites
ln -s /etc/nginx/sites-available/batuara-public /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/batuara-admin /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

## 🔄 7. Scripts de Manutenção

### 7.1 Criar Script de Atualização

```bash
# Criar script de atualização
cat > /var/www/Batuara.net/update-batuara.sh << 'EOF'
#!/bin/bash

echo "=== ATUALIZANDO BATUARA.NET ==="
cd /var/www/Batuara.net

# Parar aplicações
docker compose -f docker-compose.production.yml down

# Atualizar código
git pull origin master

# Rebuild e reiniciar
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Verificar status
docker compose -f docker-compose.production.yml ps

echo "=== ATUALIZAÇÃO CONCLUÍDA ==="
EOF

# Dar permissão de execução
chmod +x /var/www/Batuara.net/update-batuara.sh
```

### 7.2 Criar Script de Monitoramento

```bash
# Criar script de monitoramento
cat > /var/www/Batuara.net/monitor-batuara.sh << 'EOF'
#!/bin/bash

echo "=== MONITORAMENTO BATUARA.NET ==="
echo "Data: $(date)"
echo ""

cd /var/www/Batuara.net

# Status dos containers
echo "=== STATUS DOS CONTAINERS ==="
docker compose -f docker-compose.production.yml ps

echo ""

# Teste de conectividade
echo "=== TESTE DE CONECTIVIDADE ==="
echo "PublicWebsite:"
curl -s -o /dev/null -w "Status: %{http_code} - Tempo: %{time_total}s\n" http://localhost:3000

echo "AdminDashboard:"
curl -s -o /dev/null -w "Status: %{http_code} - Tempo: %{time_total}s\n" http://localhost:3001

echo ""

# Uso de recursos
echo "=== USO DE RECURSOS ==="
echo "Memória:"
free -h

echo ""
echo "Disco:"
df -h /var/www

echo ""
echo "Containers Docker:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "=== FIM DO MONITORAMENTO ==="
EOF

# Dar permissão de execução
chmod +x /var/www/Batuara.net/monitor-batuara.sh
```

### 7.3 Configurar Cron para Monitoramento

```bash
# Adicionar ao crontab
crontab -e

# Adicionar linha para monitoramento a cada 30 minutos:
# */30 * * * * /var/www/Batuara.net/monitor-batuara.sh >> /var/log/batuara-monitor.log 2>&1
```

## 🚨 8. Troubleshooting

### 8.1 Container não inicia

```bash
# Verificar logs
docker compose -f docker-compose.production.yml logs publicwebsite
docker compose -f docker-compose.production.yml logs admindashboard

# Verificar recursos
free -h
df -h

# Reiniciar container específico
docker compose -f docker-compose.production.yml restart publicwebsite
```

### 8.2 Assets não carregam

```bash
# Verificar se assets estão no container
docker exec batuara-public-website ls -la /usr/share/nginx/html/
docker exec batuara-admin-dashboard ls -la /usr/share/nginx/html/

# Testar acesso direto
curl -I http://localhost:3000/favicon.ico
curl -I http://localhost:3001/favicon.ico
```

### 8.3 Aplicação não responde

```bash
# Verificar portas
netstat -tlnp | grep -E ':(3000|3001)'

# Verificar firewall
ufw status

# Reiniciar todos os serviços
docker compose -f docker-compose.production.yml restart
```

## 🔄 9. Comandos Úteis

### 9.1 Gerenciamento de Containers

```bash
# Ver logs em tempo real
docker compose -f docker-compose.production.yml logs -f

# Parar aplicações
docker compose -f docker-compose.production.yml down

# Iniciar aplicações
docker compose -f docker-compose.production.yml up -d

# Reiniciar aplicações
docker compose -f docker-compose.production.yml restart

# Rebuild completo
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
```

### 9.2 Limpeza do Sistema

```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não utilizadas
docker image prune -f

# Limpeza completa (cuidado!)
docker system prune -a -f
```

## ✅ 10. Verificação Final

Após completar o deploy, verifique:

- [ ] PublicWebsite acessível em `http://SEU_IP_VPS:3000`
- [ ] AdminDashboard acessível em `http://SEU_IP_VPS:3001/dashboard`
- [ ] Favicon aparece em ambas as aplicações
- [ ] Logo carrega corretamente
- [ ] Containers estão com status "Up"
- [ ] Logs não mostram erros críticos

## 📞 Suporte

### Logs Importantes

```bash
# Logs das aplicações
docker compose -f docker-compose.production.yml logs

# Logs do sistema
journalctl -u docker.service

# Logs do Nginx (se configurado)
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

**Criado para**: Projeto Batuara.net  
**Compatível com**: Docker Compose v2+  
**Última atualização**: Agosto 2025