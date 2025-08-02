# 🚀 Guia de Configuração de Infraestrutura VPS - Batuara.net

Este guia contém todas as instruções para configurar um servidor VPS (Hostinger, DigitalOcean, AWS, etc.) para hospedar o projeto Batuara.net.

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou Debian 11+
- Acesso root ou sudo
- Pelo menos 2GB RAM e 20GB de armazenamento
- Conexão SSH configurada

## 🔧 1. Configuração Inicial do Servidor

### 1.1 Atualizar o Sistema

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Atualizar pacotes
apt update && apt upgrade -y

# Instalar utilitários essenciais
apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.2 Configurar Usuário (Opcional mas Recomendado)

```bash
# Criar usuário para deploy
adduser batuara
usermod -aG sudo batuara

# Configurar SSH para o novo usuário
mkdir -p /home/batuara/.ssh
cp ~/.ssh/authorized_keys /home/batuara/.ssh/
chown -R batuara:batuara /home/batuara/.ssh
chmod 700 /home/batuara/.ssh
chmod 600 /home/batuara/.ssh/authorized_keys
```

### 1.3 Configurar Firewall

```bash
# Configurar UFW
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # PublicWebsite
ufw allow 3001/tcp  # AdminDashboard
ufw --force enable

# Verificar status
ufw status
```

## 🐳 2. Instalação do Docker

### 2.1 Instalar Docker Engine

```bash
# Remover versões antigas
apt remove -y docker docker-engine docker.io containerd runc

# Adicionar repositório oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

### 2.2 Configurar Docker

```bash
# Adicionar usuário ao grupo docker
usermod -aG docker $USER
usermod -aG docker batuara  # se criou usuário específico

# Configurar Docker para iniciar automaticamente
systemctl enable docker
systemctl start docker

# Testar Docker
docker run hello-world
```

## 🌐 3. Configuração de Domínio (Opcional)

### 3.1 Configurar DNS

Se você tem um domínio, configure os registros DNS:

```
Tipo: A
Nome: @
Valor: SEU_IP_VPS

Tipo: A  
Nome: www
Valor: SEU_IP_VPS

Tipo: A
Nome: admin
Valor: SEU_IP_VPS
```

### 3.2 Instalar Nginx (Para Proxy Reverso)

```bash
# Instalar Nginx
apt install -y nginx

# Configurar para iniciar automaticamente
systemctl enable nginx
systemctl start nginx
```

## 📁 4. Preparar Diretório do Projeto

```bash
# Criar diretório para projetos
mkdir -p /var/www
cd /var/www

# Definir permissões
chown -R batuara:batuara /var/www  # se criou usuário específico
chmod -R 755 /var/www
```

## 🔒 5. Configurações de Segurança

### 5.1 Configurar SSH (Recomendado)

```bash
# Fazer backup da configuração atual
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Editar configuração SSH
nano /etc/ssh/sshd_config

# Configurações recomendadas (descomente e ajuste):
# Port 2222                    # Mudar porta padrão (opcional)
# PermitRootLogin no          # Desabilitar login root
# PasswordAuthentication no   # Usar apenas chaves SSH
# PubkeyAuthentication yes    # Habilitar autenticação por chave

# Reiniciar SSH
systemctl restart sshd

# Se mudou a porta, atualizar firewall
# ufw allow 2222/tcp
# ufw delete allow OpenSSH
```

### 5.2 Instalar Fail2Ban (Proteção contra ataques)

```bash
# Instalar Fail2Ban
apt install -y fail2ban

# Configurar
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração básica
nano /etc/fail2ban/jail.local

# Configurações importantes:
# [DEFAULT]
# bantime = 3600        # 1 hora de ban
# findtime = 600        # Janela de tempo para detectar ataques
# maxretry = 3          # Máximo de tentativas

# [sshd]
# enabled = true
# port = ssh            # ou 2222 se mudou a porta

# Iniciar serviço
systemctl enable fail2ban
systemctl start fail2ban

# Verificar status
fail2ban-client status
```

## 📊 6. Ferramentas de Monitoramento (Opcional)

### 6.1 Instalar Portainer (Interface Docker)

```bash
# Criar volume para Portainer
docker volume create portainer_data

# Executar Portainer
docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Acesso: https://SEU_IP_VPS:9443
# Primeira vez: criar usuário admin
```

### 6.2 Configurar Logs do Sistema

```bash
# Configurar logrotate para Docker
cat > /etc/logrotate.d/docker << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

# Configurar logrotate para logs do projeto
cat > /etc/logrotate.d/batuara << 'EOF'
/var/log/batuara-*.log {
    rotate 30
    daily
    compress
    missingok
    delaycompress
    copytruncate
    create 644 ubuntu ubuntu
}
EOF
```

## 🌐 7. Configuração SSL/HTTPS (Para Domínios)

### 7.1 Instalar Certbot

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
certbot --nginx -d seudominio.com -d www.seudominio.com -d admin.seudominio.com

# Configurar renovação automática
crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7.2 Configurar Nginx para Proxy Reverso

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

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

## ✅ 8. Verificação Final

```bash
# Verificar todos os serviços
systemctl status docker
systemctl status nginx
systemctl status fail2ban

# Verificar portas abertas
netstat -tlnp | grep -E ':(80|443|3000|3001|8000|9443)'

# Verificar Docker
docker --version
docker compose version
docker ps

# Verificar recursos do sistema
df -h
free -h
htop  # Ctrl+C para sair

# Verificar firewall
ufw status

# Verificar logs importantes
tail -f /var/log/auth.log  # Ctrl+C para sair
```

## 🚨 9. Troubleshooting

### Problema: Docker não inicia
```bash
systemctl status docker
journalctl -u docker.service
```

### Problema: Portas não acessíveis
```bash
ufw status
netstat -tlnp
iptables -L
```

### Problema: Sem espaço em disco
```bash
# Limpar Docker
docker system prune -a
docker volume prune

# Limpar logs
journalctl --vacuum-time=7d
```

### Problema: SSH não conecta
```bash
# Verificar se SSH está rodando
systemctl status sshd

# Verificar configuração
sshd -T | grep -E "(port|permitrootlogin|passwordauthentication)"

# Ver logs de tentativas de conexão
tail -f /var/log/auth.log
```

## 📝 10. Checklist de Segurança

Antes de colocar em produção, verifique:

- [ ] Firewall configurado (UFW)
- [ ] SSH configurado com chaves (sem senha)
- [ ] Fail2Ban instalado e configurado
- [ ] Usuário não-root criado
- [ ] Docker configurado para usuário não-root
- [ ] Logs configurados com rotação
- [ ] Backup automático configurado (se necessário)
- [ ] Monitoramento configurado
- [ ] SSL/HTTPS configurado (se usando domínio)

## 📞 11. Recursos Úteis

### Comandos de Monitoramento
```bash
# Ver uso de recursos
htop
iotop
nethogs

# Ver logs em tempo real
journalctl -f
tail -f /var/log/syslog

# Ver conexões de rede
ss -tulpn
netstat -tulpn
```

### Documentação Oficial
- **Docker**: https://docs.docker.com/
- **Nginx**: https://nginx.org/en/docs/
- **Ubuntu Server**: https://ubuntu.com/server/docs
- **UFW**: https://help.ubuntu.com/community/UFW
- **Fail2Ban**: https://github.com/fail2ban/fail2ban

---

**Próximo passo**: [Guia de Deploy das Aplicações](./VPS_APPLICATION_DEPLOY.md)