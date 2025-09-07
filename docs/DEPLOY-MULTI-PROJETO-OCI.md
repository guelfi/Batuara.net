# Deploy Multi-Projeto na OCI

## Visão Geral

Este documento descreve as estratégias implementadas para permitir que múltiplos projetos (Batuara.net, MobileMed, etc.) coexistam na mesma instância OCI sem interferências mútuas.

## Projetos Atualmente Rodando

- **Batuara.net**: Porta 3000 (website público)
- **MobileMed API**: Porta 5000
- **MobileMed Frontend**: Porta 5005

## Estratégias de Isolamento

### 1. Isolamento de Containers Docker

#### Prefixos Únicos
Cada projeto utiliza prefixos únicos para evitar conflitos:

```yaml
# Batuara.net
container_name: batuara-publicwebsite
container_name: batuara-admindashboard
container_name: batuara-api
container_name: batuara-db

# MobileMed (exemplo)
container_name: mobilemed-api
container_name: mobilemed-frontend
container_name: mobilemed-db
```

#### Redes Docker Separadas

```yaml
# Batuara.net
networks:
  batuara-network:
    driver: bridge
    name: batuara-net

# MobileMed (exemplo)
networks:
  mobilemed-network:
    driver: bridge
    name: mobilemed-net
```

#### Volumes Isolados

```yaml
# Batuara.net
volumes:
  batuara-db-data:
    name: batuara-db-data
  batuara-uploads:
    name: batuara-uploads

# MobileMed (exemplo)
volumes:
  mobilemed-db-data:
    name: mobilemed-db-data
```

### 2. Gerenciamento de Portas

#### Mapeamento de Portas por Projeto

| Projeto | Serviço | Porta Host | Porta Container |
|---------|---------|------------|----------------|
| Batuara.net | Website Público | 3000 | 3000 |
| Batuara.net | Admin Dashboard | 3001 | 3000 |
| Batuara.net | API | 8080 | 8080 |
| Batuara.net | Database | 5432 | 5432 |
| MobileMed | API | 5000 | 5000 |
| MobileMed | Frontend | 5005 | 3000 |
| MobileMed | Database | 3306 | 3306 |
| Nginx | Proxy | 80, 443 | 80, 443 |

#### Script de Gerenciamento de Portas

Utilize o script `scripts/oracle/port-manager.sh` para:

```bash
# Verificar conflitos de porta
./scripts/oracle/port-manager.sh check batuara
./scripts/oracle/port-manager.sh check-all

# Listar portas em uso
./scripts/oracle/port-manager.sh list

# Sugerir portas alternativas
./scripts/oracle/port-manager.sh suggest mobilemed

# Parar processos em portas específicas
./scripts/oracle/port-manager.sh stop 3000,3001
```

### 3. Configuração Nginx Multi-Projeto

#### Roteamento Isolado

O Nginx foi configurado para rotear cada projeto de forma isolada:

```nginx
# Batuara.net
server {
    listen 80;
    server_name batuara.net www.batuara.net;
    add_header X-Project "batuara" always;
    # ...
}

# MobileMed
server {
    listen 80;
    server_name mobilemed.local www.mobilemed.local;
    add_header X-Project "mobilemed-frontend" always;
    # ...
}
```

#### Rate Limiting por Projeto

```nginx
# Rate limiting específico por projeto
limit_req_zone $binary_remote_addr zone=batuara_api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=batuara_web:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=mobilemed_api:10m rate=15r/s;
limit_req_zone $binary_remote_addr zone=mobilemed_web:10m rate=25r/s;
```

### 4. Workflow CI/CD Isolado

#### Verificações de Isolamento

O workflow `deploy-oci.yml` inclui verificações para garantir isolamento:

```yaml
- name: Verificar conflitos de porta
  run: |
    echo "Verificando se as portas do Batuara estão disponíveis..."
    for port in 3000 3001 8080 5432; do
      if netstat -tuln | grep -q ":$port "; then
        echo "⚠️ Porta $port em uso - verificando se é do Batuara..."
        # Lógica para verificar se é do próprio projeto
      else
        echo "✅ Porta $port disponível"
      fi
    done
```

#### Backup e Rollback Seguro

```yaml
- name: Backup de configurações
  run: |
    # Backup apenas dos arquivos do Batuara
    sudo cp docker-compose.production.yml docker-compose.production.yml.backup
    sudo cp .env .env.backup

- name: Rollback em caso de falha
  if: failure()
  run: |
    echo "Realizando rollback do Batuara sem afetar outros projetos..."
    sudo mv docker-compose.production.yml.backup docker-compose.production.yml
    sudo mv .env.backup .env
    sudo docker-compose -f docker-compose.production.yml up -d
```

## Scripts de Gerenciamento

### 1. Multi-Project Manager (`scripts/oracle/multi-project-manager.sh`)

```bash
# Verificar status de todos os projetos
./scripts/oracle/multi-project-manager.sh status

# Listar projetos ativos
./scripts/oracle/multi-project-manager.sh list-projects

# Verificar recursos do sistema
./scripts/oracle/multi-project-manager.sh check-resources

# Limpar recursos órfãos
./scripts/oracle/multi-project-manager.sh cleanup

# Parar projeto específico
./scripts/oracle/multi-project-manager.sh stop batuara

# Health check de todos os projetos
./scripts/oracle/multi-project-manager.sh health-check
```

### 2. Port Manager (`scripts/oracle/port-manager.sh`)

```bash
# Verificar conflitos por projeto
./scripts/oracle/port-manager.sh check batuara
./scripts/oracle/port-manager.sh check mobilemed

# Verificar todos os projetos
./scripts/oracle/port-manager.sh check-all

# Reservar portas para deploy
./scripts/oracle/port-manager.sh reserve batuara

# Liberar reservas após deploy
./scripts/oracle/port-manager.sh release batuara
```

## Processo de Deploy Seguro

### 1. Pré-Deploy

```bash
# 1. Verificar conflitos de porta
./scripts/oracle/port-manager.sh check batuara

# 2. Verificar recursos do sistema
./scripts/oracle/multi-project-manager.sh check-resources

# 3. Reservar portas
./scripts/oracle/port-manager.sh reserve batuara

# 4. Backup das configurações atuais
sudo cp docker-compose.production.yml docker-compose.production.yml.backup
```

### 2. Deploy

```bash
# 1. Parar apenas os containers do Batuara
sudo docker-compose -f docker-compose.production.yml down

# 2. Atualizar código
git pull origin main

# 3. Rebuild e restart
sudo docker-compose -f docker-compose.production.yml up -d --build

# 4. Verificar health
./scripts/oracle/multi-project-manager.sh health-check
```

### 3. Pós-Deploy

```bash
# 1. Verificar se todos os projetos estão funcionando
./scripts/oracle/multi-project-manager.sh status

# 2. Liberar reservas de porta
./scripts/oracle/port-manager.sh release batuara

# 3. Limpar backups antigos (se tudo estiver OK)
rm -f docker-compose.production.yml.backup
```

## Monitoramento e Health Checks

### Health Check Endpoints

- **Batuara Website**: `http://batuara.net/health`
- **Batuara Admin**: `http://admin.batuara.net/health`
- **Batuara API**: `http://api.batuara.net/health`
- **MobileMed API**: `http://mobilemed-api.local/health`
- **MobileMed Frontend**: `http://mobilemed.local/health`

### Logs Separados

```bash
# Logs específicos por projeto
sudo docker-compose -f docker-compose.production.yml logs batuara-publicwebsite
sudo docker-compose -f docker-compose.production.yml logs batuara-api

# Logs do Nginx com identificação de projeto
sudo tail -f /var/log/nginx/access.log | grep "X-Project"
```

## Troubleshooting

### Problemas Comuns

#### 1. Conflito de Portas

```bash
# Identificar processo usando a porta
sudo lsof -i :3000

# Parar processo específico
./scripts/oracle/port-manager.sh stop 3000

# Sugerir porta alternativa
./scripts/oracle/port-manager.sh suggest batuara
```

#### 2. Containers com Nomes Conflitantes

```bash
# Listar containers com prefixos
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Remover containers órfãos
./scripts/oracle/multi-project-manager.sh cleanup
```

#### 3. Redes Docker Conflitantes

```bash
# Listar redes
sudo docker network ls

# Remover redes não utilizadas
sudo docker network prune

# Recriar rede específica
sudo docker network create batuara-net
```

#### 4. Volumes Conflitantes

```bash
# Listar volumes
sudo docker volume ls

# Backup de volume antes de remover
sudo docker run --rm -v batuara-db-data:/data -v $(pwd):/backup alpine tar czf /backup/batuara-db-backup.tar.gz /data
```

## Configurações de Segurança

### 1. Isolamento de Rede

- Cada projeto possui sua própria rede Docker
- Comunicação entre projetos apenas via Nginx proxy
- Firewall configurado para permitir apenas portas necessárias

### 2. Variáveis de Ambiente

```bash
# Variáveis específicas por projeto
PROJECT_NAME=batuara
CONTAINER_PREFIX=batuara
NETWORK_NAME=batuara-net
DB_NAME=batuara_db
```

### 3. Backup Isolado

```bash
# Backup apenas do projeto específico
./scripts/oracle/backup-project.sh batuara
./scripts/oracle/backup-project.sh mobilemed
```

## Escalabilidade

### Adicionando Novos Projetos

1. **Definir portas únicas** no `port-manager.sh`
2. **Criar rede Docker específica**
3. **Configurar upstream no Nginx**
4. **Adicionar ao multi-project-manager.sh**
5. **Criar workflow CI/CD específico**

### Exemplo para Novo Projeto

```bash
# 1. Adicionar ao port-manager.sh
PROJECT_PORTS["novoprojeto"]="4000,4001,4080,4432"

# 2. Configurar Nginx
upstream novoprojeto_web {
    server localhost:4000 max_fails=3 fail_timeout=30s;
}

# 3. Adicionar ao multi-project-manager.sh
PROJECTS["novoprojeto"]="4000,4001"
```

## Configuração SSH para OCI

### 1. Chave SSH Existente

```bash
# Usar chave SSH existente
chmod 600 ssh-key-2025-08-28.key

# Testar conexão SSH
ssh -i ssh-key-2025-08-28.key ubuntu@129.153.86.168

# Configurar SSH config (opcional)
echo "Host oci-batuara
  HostName 129.153.86.168
  User ubuntu
  IdentityFile $(pwd)/ssh-key-2025-08-28.key" >> ~/.ssh/config
```

### 2. GitHub Secrets

Configurar no GitHub (Settings > Secrets and variables > Actions):

```
OCI_SSH_PRIVATE_KEY=<conteúdo do arquivo ssh-key-2025-08-28.key>
DOCKER_HUB_USERNAME=<seu-username>
DOCKER_HUB_TOKEN=<seu-token>
```

**Nota:** O IP (129.153.86.168) e usuário (ubuntu) já estão configurados nos workflows.

## 🚀 Processo de Deploy

### 1. Deploy Manual

```bash
# Conectar ao servidor OCI
ssh -i ssh-key-2025-08-28.key ubuntu@129.153.86.168

# Clonar/atualizar repositório
git clone https://github.com/seu-usuario/Batuara.net.git
cd Batuara.net

# Executar verificações
./scripts/oracle/multi-project-manager.sh check-conflicts

# Deploy isolado
COMPOSE_PROJECT_NAME=batuara docker-compose -f scripts/docker/docker-compose.production.yml up -d
```

## Conclusão

Esta arquitetura garante que:

- ✅ Múltiplos projetos podem coexistir na mesma instância OCI
- ✅ Deploy de um projeto não afeta os outros
- ✅ Recursos são isolados e gerenciados independentemente
- ✅ Monitoramento e troubleshooting são simplificados
- ✅ Escalabilidade para novos projetos é facilitada

## Próximos Passos

1. **Implementar monitoramento automatizado** com alertas
2. **Configurar backup automatizado** por projeto
3. **Implementar auto-scaling** baseado em métricas
4. **Adicionar testes de integração** entre projetos
5. **Configurar SSL/TLS** com certificados por domínio