# 🚀 Deploy Batuara.net na OCI

Este guia explica como fazer o deploy da aplicação Batuara.net na Oracle Cloud Infrastructure (OCI).

## 📋 Pré-requisitos

### Na sua máquina local:
- Git
- Docker e Docker Compose
- Acesso SSH à instância OCI

### Na instância OCI:
- Ubuntu/CentOS com Docker instalado
- Portas abertas: 3000, 3001, 8080, 5432
- Pelo menos 2GB RAM e 20GB storage

## 🔧 Configuração da Instância OCI

### 1. Instalar Docker na instância OCI:

```bash
# Ubuntu
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Configurar Security List (Firewall):

No painel da OCI, configure as seguintes regras de ingress:

- **Porta 3000**: HTTP (Site Público)
- **Porta 3001**: HTTP (Dashboard Admin)  
- **Porta 8080**: HTTP (API)
- **Porta 22**: SSH (Administração)

## 🚀 Deploy

### 1. Clonar o repositório na instância OCI:

```bash
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net
git checkout feature/ui-ux-finalizacao
```

### 2. Configurar ambiente de produção:

```bash
# Copiar arquivo de configuração
cp .env.prod.example .env.prod

# Editar configurações
nano .env.prod
```

Configure no `.env.prod`:
```bash
# Database
DB_PASSWORD=sua_senha_muito_segura_aqui

# URLs da API (substitua pelo IP público da sua instância OCI)
PUBLIC_API_URL=http://129.159.XXX.XXX:8080
ADMIN_API_URL=http://129.159.XXX.XXX:8080

# Projeto
COMPOSE_PROJECT_NAME=batuara-prod
ENVIRONMENT=production
```

### 3. Executar o deploy:

```bash
./deploy-oci.sh
```

## 📊 Monitoramento

### Verificar status dos containers:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
```

### Ver logs:
```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Serviço específico
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f api
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f public-website
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f admin-dashboard
```

### Reiniciar serviços:
```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml --env-file .env.prod restart

# Serviço específico
docker-compose -f docker-compose.prod.yml --env-file .env.prod restart api
```

## 🔧 Manutenção

### Atualizar aplicação:
```bash
git pull origin feature/ui-ux-finalizacao
./deploy-oci.sh
```

### Backup do banco de dados:
```bash
docker exec batuara-db-prod pg_dump -U batuara_user batuara_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup:
```bash
docker exec -i batuara-db-prod psql -U batuara_user batuara_db < backup_file.sql
```

## 🌐 Acesso às Aplicações

Após o deploy bem-sucedido, acesse:

- **🌐 Site Público**: http://SEU-IP-OCI:3000
- **🔧 Dashboard Admin**: http://SEU-IP-OCI:3001
  - Email: <email-admin>
  - Senha: <senha-admin>
- **🚀 API**: http://SEU-IP-OCI:8080
- **📋 Swagger**: http://SEU-IP-OCI:8080/swagger

## 🆘 Troubleshooting

### Container não inicia:
1. Verificar logs: `docker-compose logs [serviço]`
2. Verificar recursos: `docker stats`
3. Verificar portas: `netstat -tulpn`

### Problemas de conectividade:
1. Verificar Security List da OCI
2. Verificar firewall da instância: `sudo ufw status`
3. Testar conectividade: `telnet SEU-IP-OCI PORTA`

### Problemas de banco de dados:
1. Verificar se o container do PostgreSQL está rodando
2. Verificar logs do banco: `docker-compose logs db`
3. Conectar manualmente: `docker exec -it batuara-db-prod psql -U batuara_user batuara_db`

## 📞 Suporte

Para problemas específicos, verifique:
1. Logs dos containers
2. Recursos da instância (CPU, RAM, Disk)
3. Conectividade de rede
4. Configurações do .env.prod
