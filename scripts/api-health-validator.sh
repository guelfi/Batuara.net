#!/bin/bash

# API Health Validator
# Valida funcionamento completo da API e conectividade

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"

log_info() { echo -e "${INFO} ${BLUE}$1${NC}"; }
log_success() { echo -e "${SUCCESS} ${GREEN}$1${NC}"; }
log_warning() { echo -e "${WARNING} ${YELLOW}$1${NC}"; }
log_error() { echo -e "${ERROR} ${RED}$1${NC}"; }

# Configurações
API_CONTAINER="batuara-api"
PUBLIC_CONTAINER="batuara-public-website"
ADMIN_CONTAINER="batuara-admin-dashboard"
MAX_RETRIES=5
RETRY_DELAY=3

# Verificar se API está iniciando
check_api_startup() {
    log_info "Verificando inicialização da API..."
    
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if docker ps --filter "name=$API_CONTAINER" --filter "status=running" | grep -q $API_CONTAINER; then
            log_success "Container da API está rodando"
            
            # Verificar logs para erros críticos
            if docker logs $API_CONTAINER 2>&1 | grep -q "Application started"; then
                log_success "API iniciou com sucesso"
                return 0
            elif docker logs $API_CONTAINER 2>&1 | grep -q "FATAL\|ERROR.*Exception"; then
                log_error "API tem erros críticos nos logs"
                return 1
            fi
        fi
        
        retries=$((retries + 1))
        log_warning "Tentativa $retries/$MAX_RETRIES - Aguardando API iniciar..."
        sleep $RETRY_DELAY
    done
    
    log_error "API não iniciou após $MAX_RETRIES tentativas"
    return 1
}

# Testar conectividade interna entre containers
test_internal_connectivity() {
    log_info "Testando conectividade interna da API..."
    
    # Testar do container público para API
    if docker exec $PUBLIC_CONTAINER curl -s --connect-timeout 5 http://batuara-api:8080 >/dev/null 2>&1; then
        log_success "Conectividade do PublicWebsite para API: OK"
    else
        log_error "Falha na conectividade do PublicWebsite para API"
        return 1
    fi
    
    # Testar do container admin para API
    if docker exec $ADMIN_CONTAINER curl -s --connect-timeout 5 http://batuara-api:8080 >/dev/null 2>&1; then
        log_success "Conectividade do AdminDashboard para API: OK"
    else
        log_error "Falha na conectividade do AdminDashboard para API"
        return 1
    fi
    
    return 0
}

# Verificar endpoints específicos da API
verify_api_endpoints() {
    log_info "Verificando endpoints da API..."
    
    local endpoints=(
        "/health:Health Check"
        "/api/orixas:Orixás"
        "/api/umbanda-lines:Linhas de Umbanda"
        "/api/spiritual-content:Conteúdo Espiritual"
        "/swagger/index.html:Swagger UI"
    )
    
    local success_count=0
    local total_endpoints=${#endpoints[@]}
    
    for endpoint_info in "${endpoints[@]}"; do
        local endpoint=$(echo $endpoint_info | cut -d: -f1)
        local description=$(echo $endpoint_info | cut -d: -f2)
        
        log_info "Testando endpoint: $endpoint ($description)"
        
        # Testar endpoint via container público
        local response=$(docker exec $PUBLIC_CONTAINER curl -s -w "%{http_code}" -o /dev/null --connect-timeout 5 "http://batuara-api:8080$endpoint" 2>/dev/null)
        
        if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "401" ]; then
            log_success "$description: HTTP $response"
            success_count=$((success_count + 1))
        else
            log_warning "$description: HTTP $response ou sem resposta"
        fi
    done
    
    log_info "Endpoints testados: $success_count/$total_endpoints respondendo"
    
    if [ $success_count -ge $((total_endpoints / 2)) ]; then
        log_success "Maioria dos endpoints está respondendo"
        return 0
    else
        log_error "Muitos endpoints não estão respondendo"
        return 1
    fi
}

# Verificar logs da API para problemas
analyze_api_logs() {
    log_info "Analisando logs da API..."
    
    local recent_logs=$(docker logs --tail 50 $API_CONTAINER 2>&1)
    
    # Verificar erros críticos
    if echo "$recent_logs" | grep -q "FATAL\|System\.Exception\|OutOfMemoryException"; then
        log_error "Erros críticos encontrados nos logs"
        echo "$recent_logs" | grep -E "FATAL|System\.Exception|OutOfMemoryException" | tail -3
        return 1
    fi
    
    # Verificar warnings importantes
    local warning_count=$(echo "$recent_logs" | grep -c "WRN\|WARNING")
    if [ $warning_count -gt 10 ]; then
        log_warning "Muitos warnings encontrados: $warning_count"
    else
        log_success "Logs da API parecem normais"
    fi
    
    # Verificar se API está ouvindo na porta correta
    if echo "$recent_logs" | grep -q "Now listening on.*8080\|Binding to.*8080"; then
        log_success "API está ouvindo na porta 8080"
    else
        log_warning "Não foi possível confirmar que API está na porta 8080"
    fi
    
    return 0
}

# Testar performance básica da API
test_api_performance() {
    log_info "Testando performance básica da API..."
    
    local start_time=$(date +%s%N)
    
    # Fazer algumas requisições para medir tempo de resposta
    for i in {1..3}; do
        docker exec $PUBLIC_CONTAINER curl -s --connect-timeout 10 http://batuara-api:8080/health >/dev/null 2>&1
    done
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Converter para ms
    local avg_response=$((duration / 3))
    
    if [ $avg_response -lt 1000 ]; then
        log_success "Tempo de resposta médio: ${avg_response}ms (Bom)"
    elif [ $avg_response -lt 3000 ]; then
        log_warning "Tempo de resposta médio: ${avg_response}ms (Aceitável)"
    else
        log_warning "Tempo de resposta médio: ${avg_response}ms (Lento)"
    fi
}

# Verificar conectividade externa (frontends)
test_external_connectivity() {
    log_info "Testando conectividade externa dos frontends..."
    
    # Testar frontend público
    if curl -s --connect-timeout 5 http://localhost:3000 >/dev/null 2>&1; then
        log_success "Frontend público acessível externamente (porta 3000)"
    else
        log_error "Frontend público não acessível externamente"
        return 1
    fi
    
    # Testar frontend admin
    if curl -s --connect-timeout 5 http://localhost:3001 >/dev/null 2>&1; then
        log_success "Frontend admin acessível externamente (porta 3001)"
    else
        log_error "Frontend admin não acessível externamente"
        return 1
    fi
    
    return 0
}

# Gerar relatório de saúde
generate_health_report() {
    log_info "📊 Gerando relatório de saúde..."
    
    local report_file="/tmp/batuara_health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== RELATÓRIO DE SAÚDE DO SISTEMA BATUARA ==="
        echo "Data: $(date)"
        echo ""
        
        echo "=== STATUS DOS CONTAINERS ==="
        docker ps --filter "name=batuara" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        echo "=== LOGS RECENTES DA API ==="
        docker logs --tail 20 $API_CONTAINER 2>&1
        echo ""
        
        echo "=== CONECTIVIDADE INTERNA ==="
        docker exec $PUBLIC_CONTAINER curl -s -I http://batuara-api:8080 2>&1 || echo "Falha na conectividade"
        echo ""
        
        echo "=== TABELAS DO BANCO ==="
        docker exec batuara-db psql -U batuara_user -d batuara_db -c "\dt" 2>&1
        echo ""
        
    } > "$report_file"
    
    log_success "Relatório salvo em: $report_file"
    echo "$report_file"
}

# Função principal de validação
validate_api_health() {
    log_info "🏥 Iniciando validação de saúde da API..."
    
    local checks_passed=0
    local total_checks=6
    
    # Executar verificações
    if check_api_startup; then checks_passed=$((checks_passed + 1)); fi
    if test_internal_connectivity; then checks_passed=$((checks_passed + 1)); fi
    if verify_api_endpoints; then checks_passed=$((checks_passed + 1)); fi
    if analyze_api_logs; then checks_passed=$((checks_passed + 1)); fi
    if test_api_performance; then checks_passed=$((checks_passed + 1)); fi
    if test_external_connectivity; then checks_passed=$((checks_passed + 1)); fi
    
    # Resultado final
    local health_percentage=$((checks_passed * 100 / total_checks))
    
    if [ $health_percentage -ge 80 ]; then
        log_success "🎉 Sistema saudável: $checks_passed/$total_checks verificações passaram ($health_percentage%)"
        return 0
    elif [ $health_percentage -ge 60 ]; then
        log_warning "⚠️ Sistema com problemas: $checks_passed/$total_checks verificações passaram ($health_percentage%)"
        return 1
    else
        log_error "❌ Sistema com falhas críticas: $checks_passed/$total_checks verificações passaram ($health_percentage%)"
        return 2
    fi
}

# Função principal
main() {
    case "${1:-validate}" in
        validate)
            validate_api_health
            ;;
        startup)
            check_api_startup
            ;;
        connectivity)
            test_internal_connectivity
            ;;
        endpoints)
            verify_api_endpoints
            ;;
        logs)
            analyze_api_logs
            ;;
        performance)
            test_api_performance
            ;;
        external)
            test_external_connectivity
            ;;
        report)
            generate_health_report
            ;;
        *)
            echo "Uso: $0 [validate|startup|connectivity|endpoints|logs|performance|external|report]"
            echo "  validate      - Validação completa (padrão)"
            echo "  startup       - Verificar inicialização da API"
            echo "  connectivity  - Testar conectividade interna"
            echo "  endpoints     - Verificar endpoints da API"
            echo "  logs          - Analisar logs da API"
            echo "  performance   - Testar performance básica"
            echo "  external      - Testar conectividade externa"
            echo "  report        - Gerar relatório completo"
            exit 1
            ;;
    esac
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi