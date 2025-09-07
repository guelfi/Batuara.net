#!/bin/bash

# Script de Health Check para Batuara.net
# Baseado nas práticas bem-sucedidas do projeto MobileMed

set -e

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
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"
API_URL="http://localhost:8080/health"
API_BASE_URL="http://localhost:8080"

# Timeouts
CONNECT_TIMEOUT=10
MAX_TIME=30
RETRY_COUNT=3
RETRY_DELAY=5

# Função para health check com retry
health_check() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-$RETRY_COUNT}
    local attempt=1
    
    log_info "Verificando $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f --connect-timeout $CONNECT_TIMEOUT --max-time $MAX_TIME "$url" > /dev/null 2>&1; then
            log_success "$service_name: OK (tentativa $attempt/$max_attempts)"
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log_warning "$service_name: Falha na tentativa $attempt/$max_attempts, tentando novamente em ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        else
            log_error "$service_name: FALHA após $max_attempts tentativas"
        fi
        
        attempt=$((attempt + 1))
    done
    
    return 1
}

# Função para verificar status do container
check_container_status() {
    local container_name=$1
    local service_name=$2
    
    if docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
        if [ "$status" = "running" ]; then
            log_success "Container $service_name: Rodando"
            return 0
        else
            log_error "Container $service_name: Status '$status'"
            return 1
        fi
    else
        log_error "Container $service_name: Não encontrado"
        return 1
    fi
}

# Função para verificar logs de erro
check_container_logs() {
    local container_name=$1
    local service_name=$2
    
    log_info "Verificando logs recentes do $service_name..."
    
    if docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        local error_count=$(docker logs --since=5m "$container_name" 2>&1 | grep -i "error\|exception\|fail" | wc -l)
        
        if [ "$error_count" -gt 0 ]; then
            log_warning "$service_name: $error_count erros encontrados nos últimos 5 minutos"
            log_info "Últimos erros:"
            docker logs --since=5m "$container_name" 2>&1 | grep -i "error\|exception\|fail" | tail -3
        else
            log_success "$service_name: Nenhum erro recente encontrado"
        fi
    fi
}

# Função para verificar uso de recursos
check_resource_usage() {
    local container_name=$1
    local service_name=$2
    
    if docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" "$container_name" | tail -n 1)
        log_info "$service_name - Recursos: $stats"
    fi
}

# Função para verificar conectividade de rede
check_network_connectivity() {
    log_info "Verificando conectividade de rede..."
    
    # Verificar se as portas estão abertas
    local ports=("3000" "3001" "8080")
    local services=("Website Público" "Dashboard Admin" "API Backend")
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local service=${services[$i]}
        
        if netstat -tuln | grep -q ":$port "; then
            log_success "Porta $port ($service): Aberta"
        else
            log_error "Porta $port ($service): Fechada ou não está escutando"
        fi
    done
}

# Função para verificar espaço em disco
check_disk_space() {
    log_info "Verificando espaço em disco..."
    
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 90 ]; then
        log_error "Espaço em disco crítico: ${disk_usage}% usado"
        return 1
    elif [ "$disk_usage" -gt 80 ]; then
        log_warning "Espaço em disco alto: ${disk_usage}% usado"
    else
        log_success "Espaço em disco: ${disk_usage}% usado"
    fi
    
    return 0
}

# Função para verificar memória
check_memory_usage() {
    log_info "Verificando uso de memória..."
    
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local mem_usage_int=${mem_usage%.*}
    
    if [ "$mem_usage_int" -gt 90 ]; then
        log_error "Uso de memória crítico: ${mem_usage}%"
        return 1
    elif [ "$mem_usage_int" -gt 80 ]; then
        log_warning "Uso de memória alto: ${mem_usage}%"
    else
        log_success "Uso de memória: ${mem_usage}%"
    fi
    
    return 0
}

# Função para verificar API endpoints específicos
check_api_endpoints() {
    log_info "Verificando endpoints específicos da API..."
    
    local endpoints=(
        "/health:Health Check"
        "/api/health:API Health"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        local endpoint=$(echo "$endpoint_info" | cut -d':' -f1)
        local description=$(echo "$endpoint_info" | cut -d':' -f2)
        local full_url="${API_BASE_URL}${endpoint}"
        
        if curl -f --connect-timeout 5 --max-time 10 "$full_url" > /dev/null 2>&1; then
            log_success "$description ($endpoint): OK"
        else
            log_error "$description ($endpoint): FALHA"
        fi
    done
}

# Função principal de health check
run_health_check() {
    local mode=${1:-"basic"}
    local failed_checks=0
    
    echo "🏥 Batuara.net - Health Check"
    echo "=============================="
    echo "Modo: $mode"
    echo "Timestamp: $(date)"
    echo ""
    
    # Verificações básicas
    log_info "🔍 Executando verificações básicas..."
    
    # Verificar containers
    check_container_status "batuara-public-website" "Website Público" || failed_checks=$((failed_checks + 1))
    check_container_status "batuara-admin-dashboard" "Dashboard Admin" || failed_checks=$((failed_checks + 1))
    check_container_status "batuara-api" "API Backend" || failed_checks=$((failed_checks + 1))
    
    echo ""
    
    # Health checks HTTP
    log_info "🌐 Executando health checks HTTP..."
    health_check "$FRONTEND_URL" "Website Público" || failed_checks=$((failed_checks + 1))
    health_check "$ADMIN_URL" "Dashboard Admin" || failed_checks=$((failed_checks + 1))
    health_check "$API_URL" "API Backend" || failed_checks=$((failed_checks + 1))
    
    echo ""
    
    # Verificações estendidas
    if [ "$mode" = "extended" ] || [ "$mode" = "full" ]; then
        log_info "🔧 Executando verificações estendidas..."
        
        check_network_connectivity
        check_api_endpoints
        
        echo ""
        
        # Verificar logs de erro
        log_info "📋 Verificando logs de containers..."
        check_container_logs "batuara-public-website" "Website Público"
        check_container_logs "batuara-admin-dashboard" "Dashboard Admin"
        check_container_logs "batuara-api" "API Backend"
        
        echo ""
    fi
    
    # Verificações completas
    if [ "$mode" = "full" ]; then
        log_info "💻 Executando verificações de sistema..."
        
        check_disk_space || failed_checks=$((failed_checks + 1))
        check_memory_usage || failed_checks=$((failed_checks + 1))
        
        echo ""
        
        # Verificar uso de recursos dos containers
        log_info "📊 Verificando uso de recursos..."
        check_resource_usage "batuara-public-website" "Website Público"
        check_resource_usage "batuara-admin-dashboard" "Dashboard Admin"
        check_resource_usage "batuara-api" "API Backend"
        
        echo ""
    fi
    
    # Resumo final
    echo "📋 Resumo do Health Check"
    echo "========================"
    
    if [ $failed_checks -eq 0 ]; then
        log_success "✅ Todos os serviços estão funcionando corretamente!"
        echo ""
        log_info "🌐 URLs de acesso:"
        echo "   • Website Público: http://localhost:3000"
        echo "   • Dashboard Admin: http://localhost:3001"
        echo "   • API Backend: http://localhost:8080"
        return 0
    else
        log_error "❌ $failed_checks verificação(ões) falharam!"
        echo ""
        log_info "🔧 Ações recomendadas:"
        echo "   • Verificar logs dos containers: docker-compose logs"
        echo "   • Reiniciar serviços com falha: docker-compose restart [service]"
        echo "   • Executar diagnóstico completo: ./scripts/oracle/diagnose-assets-oracle.sh"
        return 1
    fi
}

# Função de ajuda
show_help() {
    echo "🏥 Batuara.net Health Check"
    echo ""
    echo "Uso: $0 [MODO] [OPÇÕES]"
    echo ""
    echo "Modos disponíveis:"
    echo "  basic     - Verificações básicas (containers e HTTP) [padrão]"
    echo "  extended  - Inclui verificações de rede e logs"
    echo "  full      - Verificações completas (sistema e recursos)"
    echo ""
    echo "Opções:"
    echo "  --help, -h    - Mostrar esta ajuda"
    echo "  --quiet, -q   - Modo silencioso (apenas erros)"
    echo "  --json        - Output em formato JSON"
    echo ""
    echo "Exemplos:"
    echo "  $0                # Health check básico"
    echo "  $0 extended       # Health check estendido"
    echo "  $0 full           # Health check completo"
}

# Processar argumentos
MODE="basic"
QUIET=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        basic|extended|full)
            MODE="$1"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        --quiet|-q)
            QUIET=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        *)
            log_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Executar health check
if [ "$JSON_OUTPUT" = true ]; then
    # TODO: Implementar output JSON
    log_error "Output JSON ainda não implementado"
    exit 1
fi

if [ "$QUIET" = true ]; then
    run_health_check "$MODE" > /dev/null 2>&1
    exit $?
else
    run_health_check "$MODE"
    exit $?
fi