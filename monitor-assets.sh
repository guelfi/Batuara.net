#!/bin/bash

# Script de Monitoramento de Assets - Batuara.net
# Verifica continuamente se os assets estão funcionando corretamente

echo "=== MONITORAMENTO DE ASSETS - BATUARA.NET ==="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
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

# Configurações
PUBLIC_WEBSITE_PORT=${PUBLIC_WEBSITE_PORT:-3000}
ADMIN_DASHBOARD_PORT=${ADMIN_DASHBOARD_PORT:-3001}
BASE_URL_PUBLIC="http://localhost:$PUBLIC_WEBSITE_PORT"
BASE_URL_ADMIN="http://localhost:$ADMIN_DASHBOARD_PORT"

# Assets críticos para testar
CRITICAL_ASSETS=(
    "favicon.ico"
    "batuara_logo.png"
)

# Assets opcionais
OPTIONAL_ASSETS=(
    "favicon.png"
    "logo192.png"
    "logo512.png"
    "bg.jpg"
    "manifest.json"
)

# Função para testar asset
test_asset() {
    local base_url=$1
    local asset=$2
    local app_name=$3
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/$asset" 2>/dev/null)
        if [ "$response" = "200" ]; then
            log_success "$app_name - $asset: HTTP $response (OK)"
            return 0
        elif [ "$response" = "404" ]; then
            log_error "$app_name - $asset: HTTP $response (NOT FOUND)"
            return 1
        else
            log_warning "$app_name - $asset: HTTP $response"
            return 1
        fi
    else
        log_warning "curl não disponível, pulando teste para $asset"
        return 1
    fi
}

# Função para verificar container
check_container() {
    local container_name=$1
    local app_name=$2
    
    if docker ps --format "{{.Names}}" | grep -q "^$container_name$"; then
        log_success "$app_name - Container '$container_name' está rodando"
        
        # Verificar se assets existem no container
        log_info "$app_name - Verificando assets no container..."
        if docker exec "$container_name" ls -la /usr/share/nginx/html/ | grep -E "(favicon|logo|\.png|\.ico|\.jpg)" > /dev/null 2>&1; then
            log_success "$app_name - Assets encontrados no container"
        else
            log_warning "$app_name - Assets podem estar faltando no container"
        fi
        
        return 0
    else
        log_error "$app_name - Container '$container_name' não está rodando"
        return 1
    fi
}

# Função para verificar saúde da aplicação
check_app_health() {
    local base_url=$1
    local app_name=$2
    
    log_info "Verificando saúde da aplicação: $app_name"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$base_url" 2>/dev/null)
        if [ "$response" = "200" ]; then
            log_success "$app_name - Aplicação respondendo: HTTP $response"
            return 0
        else
            log_error "$app_name - Aplicação não responde: HTTP $response"
            return 1
        fi
    else
        log_warning "curl não disponível, pulando teste de saúde"
        return 1
    fi
}

# 1. Verificar containers
echo "=== 1. VERIFICAÇÃO DOS CONTAINERS ==="
check_container "batuara-public-website" "PublicWebsite"
check_container "batuara-admin-dashboard" "AdminDashboard"

echo ""

# 2. Verificar saúde das aplicações
echo "=== 2. VERIFICAÇÃO DE SAÚDE DAS APLICAÇÕES ==="
check_app_health "$BASE_URL_PUBLIC" "PublicWebsite"
check_app_health "$BASE_URL_ADMIN" "AdminDashboard"

echo ""

# 3. Testar assets críticos
echo "=== 3. TESTE DE ASSETS CRÍTICOS ==="

log_info "Testando assets do PublicWebsite..."
public_critical_errors=0
for asset in "${CRITICAL_ASSETS[@]}"; do
    if ! test_asset "$BASE_URL_PUBLIC" "$asset" "PublicWebsite"; then
        ((public_critical_errors++))
    fi
done

log_info "Testando assets do AdminDashboard..."
admin_critical_errors=0
for asset in "${CRITICAL_ASSETS[@]}"; do
    if ! test_asset "$BASE_URL_ADMIN" "$asset" "AdminDashboard"; then
        ((admin_critical_errors++))
    fi
done

echo ""

# 4. Testar assets opcionais
echo "=== 4. TESTE DE ASSETS OPCIONAIS ==="

log_info "Testando assets opcionais do PublicWebsite..."
for asset in "${OPTIONAL_ASSETS[@]}"; do
    test_asset "$BASE_URL_PUBLIC" "$asset" "PublicWebsite"
done

log_info "Testando assets opcionais do AdminDashboard..."
for asset in "${OPTIONAL_ASSETS[@]}"; do
    test_asset "$BASE_URL_ADMIN" "$asset" "AdminDashboard"
done

echo ""

# 5. Verificar logs recentes
echo "=== 5. VERIFICAÇÃO DE LOGS RECENTES ==="

if docker ps --format "{{.Names}}" | grep -q "batuara-public-website"; then
    log_info "Últimas 5 linhas do log do PublicWebsite:"
    docker logs --tail 5 batuara-public-website 2>/dev/null | sed 's/^/  /'
fi

if docker ps --format "{{.Names}}" | grep -q "batuara-admin-dashboard"; then
    log_info "Últimas 5 linhas do log do AdminDashboard:"
    docker logs --tail 5 batuara-admin-dashboard 2>/dev/null | sed 's/^/  /'
fi

echo ""

# 6. Verificar recursos do sistema
echo "=== 6. VERIFICAÇÃO DE RECURSOS ==="

log_info "Uso de memória:"
free -h | grep -E "(Mem|Swap)" | sed 's/^/  /'

log_info "Uso de disco:"
df -h / | tail -1 | sed 's/^/  /'

if command -v docker &> /dev/null; then
    log_info "Estatísticas dos containers:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | sed 's/^/  /'
fi

echo ""

# 7. Resumo e alertas
echo "=== 7. RESUMO E ALERTAS ==="

total_critical_errors=$((public_critical_errors + admin_critical_errors))

if [ $total_critical_errors -eq 0 ]; then
    log_success "✅ Todos os assets críticos estão funcionando corretamente!"
else
    log_error "❌ Encontrados $total_critical_errors erros em assets críticos"
    
    if [ $public_critical_errors -gt 0 ]; then
        log_error "PublicWebsite: $public_critical_errors assets críticos com problema"
    fi
    
    if [ $admin_critical_errors -gt 0 ]; then
        log_error "AdminDashboard: $admin_critical_errors assets críticos com problema"
    fi
    
    echo ""
    log_info "Ações recomendadas:"
    echo "1. Verificar se containers estão rodando: docker ps"
    echo "2. Verificar logs: docker logs batuara-public-website"
    echo "3. Reiniciar containers: docker restart batuara-public-website batuara-admin-dashboard"
    echo "4. Rebuild se necessário: docker-compose -f docker-compose.production.yml build --no-cache"
fi

echo ""

# 8. Informações de acesso
echo "=== 8. INFORMAÇÕES DE ACESSO ==="
log_info "URLs de acesso:"
echo "  PublicWebsite: $BASE_URL_PUBLIC"
echo "  AdminDashboard: $BASE_URL_ADMIN/dashboard"

# Se estivermos em um servidor, mostrar IP público
if command -v curl &> /dev/null; then
    PUBLIC_IP=$(curl -s -4 icanhazip.com 2>/dev/null || curl -s -4 ifconfig.me 2>/dev/null || echo "N/A")
    if [ "$PUBLIC_IP" != "N/A" ]; then
        log_info "URLs públicas (se portas estiverem abertas):"
        echo "  PublicWebsite: http://$PUBLIC_IP:$PUBLIC_WEBSITE_PORT"
        echo "  AdminDashboard: http://$PUBLIC_IP:$ADMIN_DASHBOARD_PORT/dashboard"
    fi
fi

echo ""
echo "=== FIM DO MONITORAMENTO ==="

# Retornar código de saída baseado nos erros críticos
exit $total_critical_errors