#!/bin/bash

# Cores e emojis para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"

# Configurações
DB_CONTAINER="batuara-db"
API_CONTAINER="batuara-api"
DB_VOLUME="batuara_net_batuara-db-data"
MAX_RETRIES=3
RETRY_DELAY=5

log_info() {
    echo -e "${INFO} ${BLUE}$1${NC}"
}

log_success() {
    echo -e "${SUCCESS} ${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${WARNING} ${YELLOW}$1${NC}"
}

log_error() {
    echo -e "${ERROR} ${RED}$1${NC}"
}

# Função para reset completo de volumes Docker
reset_database_volume() {
    log_info "Iniciando reset completo do banco de dados..."
    
    # Parar todos os containers
    log_info "Parando containers..."
    docker-compose down
    
    # Remover volume do banco
    log_info "Removendo volume do banco de dados..."
    if docker volume rm $DB_VOLUME 2>/dev/null; then
        log_success "Volume removido com sucesso"
    else
        log_warning "Volume não existia ou já foi removido"
    fi
}

# Função para inicialização sequencial de containers
start_database_container() {
    log_info "Iniciando container do banco de dados..."
    
    docker-compose up -d db
    if [ $? -eq 0 ]; then
        log_success "Container do banco iniciado"
        return 0
    else
        log_error "Falha ao iniciar container do banco"
        return 1
    fi
}

# Função para validação de conectividade do PostgreSQL
wait_for_database_ready() {
    log_info "Aguardando banco de dados ficar pronto..."
    
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if docker exec $DB_CONTAINER pg_isready -U batuara_user -d batuara_db >/dev/null 2>&1; then
            log_success "Banco de dados está pronto!"
            return 0
        fi
        
        retries=$((retries + 1))
        log_warning "Tentativa $retries/$MAX_RETRIES - Aguardando banco ficar pronto..."
        sleep $RETRY_DELAY
    done
    
    log_error "Banco de dados não ficou pronto após $MAX_RETRIES tentativas"
    return 1
}

# Função para verificar migrations pendentes
check_pending_migrations() {
    log_info "Verificando migrations pendentes..."
    
    # Iniciar API temporariamente para verificar migrations
    docker-compose up -d api
    sleep 10
    
    # Verificar se há erro de pending migrations nos logs
    if docker logs $API_CONTAINER 2>&1 | grep -q "PendingModelChangesWarning"; then
        log_warning "Migrations pendentes detectadas"
        return 1
    else
        log_success "Nenhuma migration pendente"
        return 0
    fi
}

# Função para aplicar migrations do Entity Framework
apply_entity_framework_migrations() {
    log_info "Aplicando migrations do Entity Framework..."
    
    # Usar o migration handler especializado
    if [ -f "scripts/migration-handler.sh" ]; then
        chmod +x scripts/migration-handler.sh
        if ./scripts/migration-handler.sh; then
            log_success "Migrations aplicadas via handler especializado"
            return 0
        else
            log_warning "Handler de migrations falhou, tentando método manual..."
        fi
    fi
    
    # Fallback para método manual
    docker-compose stop api
    
    if docker-compose run --rm api dotnet ef database update --project src/Backend/Batuara.API; then
        log_success "Migrations aplicadas manualmente"
        return 0
    else
        log_error "Falha ao aplicar migrations"
        return 1
    fi
}

# Função para popular dados iniciais
seed_initial_data() {
    log_info "Populando dados iniciais..."
    
    # Usar o data seeder especializado
    if [ -f "scripts/data-seeder.sh" ]; then
        chmod +x scripts/data-seeder.sh
        if ./scripts/data-seeder.sh seed; then
            log_success "Dados populados via seeder especializado"
            return 0
        else
            log_warning "Data seeder falhou, tentando método manual..."
        fi
    fi
    
    # Fallback para método manual
    log_info "Executando scripts de seed manuais..."
    
    local scripts=("seed_all_data.sql" "seed_orixas_data.sql" "seed_umbanda_lines_data.sql" "seed_spiritual_content_data.sql")
    
    for script in "${scripts[@]}"; do
        if [ -f "scripts/$script" ]; then
            if docker exec -i $DB_CONTAINER psql -U batuara_user -d batuara_db < "scripts/$script" >/dev/null 2>&1; then
                log_success "Script $script executado"
            else
                log_warning "Falha no script $script"
            fi
        fi
    done
}

# Função para validar schema do banco
validate_database_schema() {
    log_info "Validando schema do banco de dados..."
    
    local table_count=$(docker exec $DB_CONTAINER psql -U batuara_user -d batuara_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$table_count" -gt 0 ]; then
        log_success "Schema validado: $table_count tabelas encontradas"
        
        # Listar tabelas principais
        log_info "Tabelas principais:"
        docker exec $DB_CONTAINER psql -U batuara_user -d batuara_db -c "\dt" | grep -E "(Orixas|UmbandaLines|SpiritualContent|Users)" || true
        
        return 0
    else
        log_error "Nenhuma tabela encontrada no schema"
        return 1
    fi
}

# Função principal de configuração
setup_database() {
    log_info "🚀 Iniciando configuração completa do banco de dados..."
    
    # Verificar se arquivo .env existe
    if [ ! -f ".env" ]; then
        log_error "Arquivo .env não encontrado!"
        return 1
    fi
    
    # Reset do banco
    if ! reset_database_volume; then
        log_error "Falha no reset do banco"
        return 1
    fi
    
    # Iniciar banco
    if ! start_database_container; then
        log_error "Falha ao iniciar banco"
        return 1
    fi
    
    # Aguardar banco ficar pronto
    if ! wait_for_database_ready; then
        log_error "Banco não ficou pronto"
        return 1
    fi
    
    # Aplicar migrations
    if ! apply_entity_framework_migrations; then
        log_warning "Falha nas migrations, tentando com schema manual..."
        if [ -f "scripts/create_database_schema.sql" ]; then
            docker exec -i $DB_CONTAINER psql -U batuara_user -d batuara_db < scripts/create_database_schema.sql
            log_success "Schema manual aplicado"
        fi
    fi
    
    # Popular dados
    if ! seed_initial_data; then
        log_error "Falha ao popular dados iniciais"
        return 1
    fi
    
    # Validar schema
    if ! validate_database_schema; then
        log_error "Falha na validação do schema"
        return 1
    fi
    
    log_success "🎉 Configuração do banco de dados concluída com sucesso!"
    return 0
}

# Função para iniciar todos os serviços
start_all_services() {
    log_info "Iniciando todos os serviços..."
    
    docker-compose up -d
    
    log_info "Aguardando serviços ficarem prontos..."
    sleep 20
    
    # Usar o validador de saúde da API
    if [ -f "scripts/api-health-validator.sh" ]; then
        chmod +x scripts/api-health-validator.sh
        log_info "Executando validação de saúde da API..."
        if ./scripts/api-health-validator.sh validate; then
            log_success "Validação de saúde passou!"
        else
            log_warning "Alguns problemas detectados na validação"
        fi
    else
        # Fallback para verificação simples
        if docker exec batuara-public-website curl -s http://batuara-api:8080 >/dev/null 2>&1; then
            log_success "API está respondendo internamente"
        else
            log_warning "API pode não estar respondendo ainda"
        fi
    fi
    
    log_success "Todos os serviços iniciados!"
}

# Função principal
main() {
    echo -e "${ROCKET} ${BLUE}Configurador Automático do Banco Batuara${NC}"
    echo "=================================================="
    
    case "${1:-setup}" in
        setup)
            setup_database && start_all_services
            ;;
        reset)
            reset_database_volume
            ;;
        start)
            start_all_services
            ;;
        validate)
            validate_database_schema
            ;;
        *)
            echo "Uso: $0 [setup|reset|start|validate]"
            echo "  setup    - Configuração completa (padrão)"
            echo "  reset    - Apenas reset do banco"
            echo "  start    - Apenas iniciar serviços"
            echo "  validate - Apenas validar schema"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"