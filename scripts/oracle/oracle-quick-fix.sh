#!/bin/bash

# Script Rápido para Correção de Assets - Oracle
# Configurado para /var/www/batuara_net - SEM EDIÇÃO NECESSÁRIA

echo "=== CORREÇÃO RÁPIDA DE ASSETS - ORACLE ==="
echo "Data: $(date)"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configurações fixas
ORACLE_DIR="/var/www/batuara_net"
PROJECT_DIR="Batuara.net"

# Ir para diretório correto
cd "$ORACLE_DIR" || {
    log_error "Não foi possível acessar $ORACLE_DIR"
    exit 1
}

log_info "Diretório atual: $(pwd)"

# Verificar se projeto existe
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Projeto $PROJECT_DIR não encontrado em $ORACLE_DIR"
    log_info "Execute primeiro: ./oracle-deploy-ready.sh"
    exit 1
fi

cd "$PROJECT_DIR"

echo ""
echo "=== 1. LIMPEZA DE CACHE ==="

log_info "Limpando cache do Docker..."
docker system prune -f
log_success "Cache limpo"

echo ""
echo "=== 2. RECONSTRUÇÃO DOS CONTAINERS ==="

log_info "Parando containers..."
docker-compose down

log_info "Reconstruindo com --no-cache..."
docker-compose build --no-cache

log_info "Iniciando serviços..."
docker-compose up -d

log_info "Aguardando inicialização (20 segundos)..."
sleep 20

echo ""
echo "=== 3. VERIFICAÇÃO ==="

log_info "Status dos containers:"
docker-compose ps

# Testar assets
CONTAINER_NAME=$(docker-compose ps -q publicwebsite 2>/dev/null)
if [ -n "$CONTAINER_NAME" ]; then
    log_success "Container encontrado: $CONTAINER_NAME"
    
    log_info "Verificando assets no container..."
    docker exec "$CONTAINER_NAME" ls -la /usr/share/nginx/html/ | grep -E "(favicon|logo|bg\.jpg)"
    
    # Testar HTTP
    PORT=$(docker port "$CONTAINER_NAME" 80 2>/dev/null | cut -d: -f2)
    if [ -n "$PORT" ] && command -v curl &> /dev/null; then
        log_info "Testando assets via HTTP (porta $PORT)..."
        for asset in "favicon.ico" "batuara_logo.png" "bg.jpg"; do
            response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/$asset" 2>/dev/null)
            if [ "$response" = "200" ]; then
                log_success "$asset - OK"
            else
                log_warning "$asset - Status: $response"
            fi
        done
    fi
else
    log_error "Container não encontrado"
fi

echo ""
echo "=== CORREÇÃO RÁPIDA CONCLUÍDA ==="
log_info "Teste o site no navegador!"
echo ""