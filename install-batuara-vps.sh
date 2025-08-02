#!/bin/bash

# Script de Instalação Automatizada - Batuara.net VPS
# Instala e configura automaticamente o projeto em um VPS limpo

set -e  # Parar em caso de erro

echo "🚀 INSTALAÇÃO AUTOMATIZADA - BATUARA.NET VPS"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_warning "Este script está rodando como root. Recomendamos criar um usuário não-root."
   read -p "Deseja continuar mesmo assim? (y/N): " continue_as_root
   if [[ ! $continue_as_root =~ ^[Yy]$ ]]; then
       log_info "Criando usuário 'batuara'..."
       adduser batuara
       usermod -aG sudo batuara
       log_success "Usuário 'batuara' criado. Execute este script como esse usuário."
       exit 0
   fi
fi

# Detectar sistema operacional
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    log_error "Não foi possível detectar o sistema operacional"
    exit 1
fi

log_info "Sistema detectado: $OS $VER"

# Verificar se é Ubuntu/Debian
if [[ ! "$OS" =~ (Ubuntu|Debian) ]]; then
    log_error "Este script suporta apenas Ubuntu e Debian"
    exit 1
fi

# Configurações
REPO_URL="https://github.com/guelfi/Batuara.net.git"
PROJECT_DIR="/var/www/Batuara.net"
PUBLIC_PORT=3000
ADMIN_PORT=3001

echo ""
log_info "Configurações:"
echo "  Repositório: $REPO_URL"
echo "  Diretório: $PROJECT_DIR"
echo "  Porta PublicWebsite: $PUBLIC_PORT"
echo "  Porta AdminDashboard: $ADMIN_PORT"
echo ""

read -p "Deseja continuar com a instalação? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    log_info "Instalação cancelada"
    exit 0
fi

echo ""
echo "=== 1. ATUALIZANDO SISTEMA ==="

log_info "Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

log_info "Instalando utilitários essenciais..."
sudo apt install -y curl wget git nano htop unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release

log_success "Sistema atualizado"

echo ""
echo "=== 2. CONFIGURANDO FIREWALL ==="

log_info "Configurando UFW..."
sudo ufw --force reset
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow $PUBLIC_PORT/tcp
sudo ufw allow $ADMIN_PORT/tcp
sudo ufw --force enable

log_success "Firewall configurado"

echo ""
echo "=== 3. INSTALANDO DOCKER ==="

log_info "Removendo versões antigas do Docker..."
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

log_info "Adicionando repositório oficial do Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

log_info "Instalando Docker..."
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log_info "Configurando Docker..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

log_info "Testando Docker..."
sudo docker run --rm hello-world

log_success "Docker instalado e configurado"

echo ""
echo "=== 4. PREPARANDO DIRETÓRIO DO PROJETO ==="

log_info "Criando diretório /var/www..."
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
sudo chmod -R 755 /var/www

log_success "Diretório preparado"

echo ""
echo "=== 5. CLONANDO REPOSITÓRIO ==="

log_info "Clonando repositório do GitHub..."
cd /var/www

if [[ -d "Batuara.net" ]]; then
    log_warning "Diretório Batuara.net já existe. Fazendo backup..."
    mv Batuara.net Batuara.net.backup.$(date +%Y%m%d_%H%M%S)
fi

git clone $REPO_URL
cd Batuara.net

log_info "Verificando estrutura do projeto..."
if [[ ! -f "docker-compose.production.yml" ]]; then
    log_error "Arquivo docker-compose.production.yml não encontrado"
    exit 1
fi

if [[ ! -f "Dockerfile.frontend" ]]; then
    log_error "Arquivo Dockerfile.frontend não encontrado"
    exit 1
fi

log_success "Repositório clonado"

echo ""
echo "=== 6. CONFIGURANDO AMBIENTE ==="

log_info "Criando arquivo .env..."
if [[ ! -f ".env" ]]; then
    cp .env.example .env
    
    # Configurar variáveis básicas
    sed -i "s/PUBLIC_WEBSITE_PORT=3000/PUBLIC_WEBSITE_PORT=$PUBLIC_PORT/" .env
    sed -i "s/ADMIN_DASHBOARD_PORT=3001/ADMIN_DASHBOARD_PORT=$ADMIN_PORT/" .env
    sed -i "s/REACT_APP_API_URL=http:\/\/localhost:8080/REACT_APP_API_URL=http:\/\/$(curl -s -4 icanhazip.com 2>\/dev\/null || echo localhost):8080/" .env
    
    log_success "Arquivo .env criado"
else
    log_info "Arquivo .env já existe"
fi

echo ""
echo "=== 7. CONSTRUINDO APLICAÇÕES ==="

log_info "Construindo imagens Docker (isso pode demorar 5-10 minutos)..."
docker compose -f docker-compose.production.yml build --no-cache

log_success "Imagens construídas"

echo ""
echo "=== 8. INICIANDO APLICAÇÕES ==="

log_info "Iniciando containers..."
docker compose -f docker-compose.production.yml up -d

log_info "Aguardando containers iniciarem (30 segundos)..."
sleep 30

log_info "Verificando status dos containers..."
docker compose -f docker-compose.production.yml ps

log_success "Aplicações iniciadas"

echo ""
echo "=== 9. CONFIGURANDO MONITORAMENTO ==="

log_info "Configurando script de monitoramento..."
chmod +x monitor-assets.sh

log_info "Criando arquivo de log..."
sudo touch /var/log/batuara-monitor.log
sudo chown $USER:$USER /var/log/batuara-monitor.log

log_info "Configurando cron para monitoramento..."
(crontab -l 2>/dev/null; echo "*/15 * * * * $PROJECT_DIR/monitor-assets.sh >> /var/log/batuara-monitor.log 2>&1") | crontab -

log_success "Monitoramento configurado"

echo ""
echo "=== 10. TESTANDO INSTALAÇÃO ==="

log_info "Testando aplicações..."

# Aguardar um pouco mais para garantir que estão rodando
sleep 10

# Testar PublicWebsite
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PUBLIC_PORT | grep -q "200"; then
    log_success "PublicWebsite respondendo corretamente"
else
    log_warning "PublicWebsite pode não estar respondendo corretamente"
fi

# Testar AdminDashboard
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$ADMIN_PORT | grep -q "200"; then
    log_success "AdminDashboard respondendo corretamente"
else
    log_warning "AdminDashboard pode não estar respondendo corretamente"
fi

# Executar monitoramento
log_info "Executando teste de monitoramento..."
./monitor-assets.sh

echo ""
echo "=== 11. CONFIGURAÇÕES FINAIS ==="

# Detectar IP público
PUBLIC_IP=$(curl -s -4 icanhazip.com 2>/dev/null || curl -s -4 ifconfig.me 2>/dev/null || echo "N/A")

log_info "Configurando logrotate..."
sudo tee /etc/logrotate.d/batuara > /dev/null << EOF
/var/log/batuara-*.log {
    rotate 30
    daily
    compress
    missingok
    delaycompress
    copytruncate
    create 644 $USER $USER
}
EOF

log_success "Configurações finais aplicadas"

echo ""
echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "===================================="
echo ""
log_success "Batuara.net foi instalado e está rodando!"
echo ""
log_info "URLs de acesso:"
echo "  📱 PublicWebsite: http://localhost:$PUBLIC_PORT"
echo "  🔧 AdminDashboard: http://localhost:$ADMIN_PORT/dashboard"

if [[ "$PUBLIC_IP" != "N/A" ]]; then
    echo ""
    log_info "URLs públicas (se firewall/security groups permitirem):"
    echo "  📱 PublicWebsite: http://$PUBLIC_IP:$PUBLIC_PORT"
    echo "  🔧 AdminDashboard: http://$PUBLIC_IP:$ADMIN_PORT/dashboard"
fi

echo ""
log_info "Comandos úteis:"
echo "  Ver status: docker compose -f docker-compose.production.yml ps"
echo "  Ver logs: docker compose -f docker-compose.production.yml logs -f"
echo "  Reiniciar: docker compose -f docker-compose.production.yml restart"
echo "  Parar: docker compose -f docker-compose.production.yml down"
echo "  Monitorar: ./monitor-assets.sh"
echo "  Ver logs de monitoramento: tail -f /var/log/batuara-monitor.log"

echo ""
log_info "Próximos passos recomendados:"
echo "  1. Configurar domínio (se tiver)"
echo "  2. Configurar SSL/HTTPS"
echo "  3. Configurar backups"
echo "  4. Revisar configurações de segurança"

echo ""
log_info "Documentação completa em:"
echo "  📖 docs/VPS_INFRASTRUCTURE_SETUP.md"
echo "  📖 docs/VPS_APPLICATION_DEPLOY.md"
echo "  📖 docs/VPS_PROVIDERS_GUIDE.md"

echo ""
log_warning "IMPORTANTE: Reinicie sua sessão SSH para aplicar as permissões do Docker:"
echo "  exit"
echo "  ssh $USER@$(hostname -I | awk '{print $1}')"

echo ""
log_success "Instalação finalizada! 🚀"