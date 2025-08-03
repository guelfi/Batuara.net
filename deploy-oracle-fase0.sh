#!/bin/bash

# Script de Deploy Específico para Oracle - Fase 0
# Usa docker-compose.oracle.yml compatível com versões mais antigas

echo "=== DEPLOY FASE 0 - ORACLE ==="
echo "Data: $(date)"
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

echo "=== 1. PARANDO CONTAINERS ANTIGOS ==="
log_info "Parando containers existentes..."
docker stop batuara-public-website batuara-admin-dashboard 2>/dev/null || log_info "Nenhum container rodando"
docker rm batuara-public-website batuara-admin-dashboard 2>/dev/null || log_info "Nenhum container para remover"

echo ""
echo "=== 2. LIMPEZA DE IMAGENS ==="
log_info "Removendo imagens antigas..."
docker images | grep batuara | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || log_info "Nenhuma imagem para remover"

echo ""
echo "=== 3. BUILD DOS CONTAINERS ==="
log_info "Construindo PublicWebsite..."
if docker-compose -f docker-compose.oracle.yml build public-website --no-cache; then
    log_success "PublicWebsite construído"
else
    log_error "Falha no build do PublicWebsite"
    exit 1
fi

log_info "Construindo AdminDashboard..."
if docker-compose -f docker-compose.oracle.yml build admin-dashboard --no-cache; then
    log_success "AdminDashboard construído"
else
    log_error "Falha no build do AdminDashboard"
    exit 1
fi

echo ""
echo "=== 4. INICIANDO SERVIÇOS ==="
log_info "Iniciando containers..."
if docker-compose -f docker-compose.oracle.yml up -d; then
    log_success "Containers iniciados"
else
    log_error "Falha ao iniciar containers"
    exit 1
fi

echo ""
echo "=== 5. AGUARDANDO INICIALIZAÇÃO ==="
log_info "Aguardando containers ficarem prontos (30 segundos)..."
sleep 30

echo ""
echo "=== 6. VERIFICAÇÃO FINAL ==="
log_info "Status dos containers:"
docker ps --filter "name=batuara"

echo ""
log_info "Testando serviços:"

# Testar PublicWebsite
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8003 | grep -q "200"; then
    log_success "PublicWebsite - OK (http://localhost:8003)"
else
    log_warning "PublicWebsite - Pode estar ainda inicializando"
fi

# Testar AdminDashboard
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8004 | grep -q "200"; then
    log_success "AdminDashboard - OK (http://localhost:8004)"
else
    log_warning "AdminDashboard - Pode estar ainda inicializando"
fi

echo ""
echo "=== DEPLOY CONCLUÍDO ==="
log_success "Fase 0 deployada com sucesso!"
echo ""
log_info "Serviços disponíveis:"
echo "• PublicWebsite: http://IP_PUBLICO:8003"
echo "• AdminDashboard: http://IP_PUBLICO:8004"
echo ""
log_info "Para monitorar:"
echo "docker ps                                    # Status dos containers"
echo "docker logs batuara-public-website          # Logs do PublicWebsite"
echo "docker logs batuara-admin-dashboard         # Logs do AdminDashboard"
echo "docker-compose -f docker-compose.oracle.yml logs -f  # Logs em tempo real"