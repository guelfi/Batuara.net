#!/bin/bash

# Data Seeder para popular dados iniciais
# Sistema robusto de seeding com verificação de duplicatas

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

# Verificar se dados já existem
check_existing_data() {
    local table_name=$1
    local count_query=$2
    
    log_info "Verificando dados existentes na tabela $table_name..."
    
    local count=$(docker exec batuara-db psql -U batuara_user -d batuara_db -t -c "$count_query" 2>/dev/null | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        log_success "Tabela $table_name já possui $count registros"
        return 0  # Dados existem
    else
        log_info "Tabela $table_name está vazia, precisa ser populada"
        return 1  # Dados não existem
    fi
}

# Executar script SQL com verificação de erro
execute_sql_script() {
    local script_path=$1
    local description=$2
    
    log_info "Executando $description..."
    
    if [ ! -f "$script_path" ]; then
        log_error "Script não encontrado: $script_path"
        return 1
    fi
    
    if docker exec -i batuara-db psql -U batuara_user -d batuara_db < "$script_path" >/dev/null 2>&1; then
        log_success "$description executado com sucesso"
        return 0
    else
        log_error "Falha ao executar $description"
        return 1
    fi
}

# Seed de dados de Orixás
seed_orixas_data() {
    log_info "🌟 Populando dados de Orixás..."
    
    if check_existing_data "Orixas" "SELECT COUNT(*) FROM \"Orixas\";"; then
        return 0
    fi
    
    if execute_sql_script "scripts/seed_orixas_data.sql" "dados de Orixás"; then
        local count=$(docker exec batuara-db psql -U batuara_user -d batuara_db -t -c "SELECT COUNT(*) FROM \"Orixas\";" 2>/dev/null | tr -d ' ')
        log_success "Inseridos $count Orixás"
        return 0
    else
        return 1
    fi
}

# Seed de dados de Linhas de Umbanda
seed_umbanda_lines_data() {
    log_info "🕯️ Populando dados de Linhas de Umbanda..."
    
    if check_existing_data "UmbandaLines" "SELECT COUNT(*) FROM \"UmbandaLines\";"; then
        return 0
    fi
    
    if execute_sql_script "scripts/seed_umbanda_lines_data.sql" "dados de Linhas de Umbanda"; then
        local count=$(docker exec batuara-db psql -U batuara_user -d batuara_db -t -c "SELECT COUNT(*) FROM \"UmbandaLines\";" 2>/dev/null | tr -d ' ')
        log_success "Inseridas $count Linhas de Umbanda"
        return 0
    else
        return 1
    fi
}

# Seed de conteúdo espiritual
seed_spiritual_content() {
    log_info "📿 Populando conteúdo espiritual..."
    
    if check_existing_data "SpiritualContents" "SELECT COUNT(*) FROM \"SpiritualContents\";"; then
        return 0
    fi
    
    if execute_sql_script "scripts/seed_spiritual_content_data.sql" "conteúdo espiritual"; then
        local count=$(docker exec batuara-db psql -U batuara_user -d batuara_db -t -c "SELECT COUNT(*) FROM \"SpiritualContents\";" 2>/dev/null | tr -d ' ')
        log_success "Inseridos $count conteúdos espirituais"
        return 0
    else
        return 1
    fi
}

# Seed de dados gerais
seed_general_data() {
    log_info "📋 Populando dados gerais..."
    
    if [ -f "scripts/seed_all_data.sql" ]; then
        execute_sql_script "scripts/seed_all_data.sql" "dados gerais"
    else
        log_warning "Script de dados gerais não encontrado"
    fi
}

# Criar usuário administrador padrão
create_admin_user() {
    log_info "👤 Criando usuário administrador padrão..."
    
    # Verificar se usuário admin já existe
    if check_existing_data "Users" "SELECT COUNT(*) FROM \"Users\" WHERE \"Email\" = 'admin@casabatuara.org.br';"; then
        return 0
    fi
    
    # Criar usuário admin
    local admin_sql="
    INSERT INTO \"Users\" (\"Id\", \"Name\", \"Email\", \"PasswordHash\", \"Role\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\")
    VALUES (
        gen_random_uuid(),
        'Administrador',
        'admin@casabatuara.org.br',
        '\$2a\$11\$rQZrHzXKqZZqZqZqZqZqZeJ1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J1',
        'Admin',
        true,
        NOW(),
        NOW()
    );
    "
    
    if echo "$admin_sql" | docker exec -i batuara-db psql -U batuara_user -d batuara_db >/dev/null 2>&1; then
        log_success "Usuário administrador criado"
    else
        log_warning "Falha ao criar usuário administrador (pode já existir)"
    fi
}

# Verificar integridade dos dados após seeding
verify_data_integrity() {
    log_info "🔍 Verificando integridade dos dados..."
    
    local tables=("Orixas" "UmbandaLines" "SpiritualContents" "Users")
    local total_records=0
    
    for table in "${tables[@]}"; do
        local count=$(docker exec batuara-db psql -U batuara_user -d batuara_db -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            log_success "$table: $count registros"
            total_records=$((total_records + count))
        else
            log_warning "$table: vazia"
        fi
    done
    
    if [ "$total_records" -gt 0 ]; then
        log_success "Total de registros inseridos: $total_records"
        return 0
    else
        log_error "Nenhum registro encontrado após seeding"
        return 1
    fi
}

# Função principal de seeding
seed_all_data() {
    log_info "🌱 Iniciando seeding de dados..."
    
    local success_count=0
    local total_operations=5
    
    # Executar operações de seeding
    if seed_general_data; then success_count=$((success_count + 1)); fi
    if seed_orixas_data; then success_count=$((success_count + 1)); fi
    if seed_umbanda_lines_data; then success_count=$((success_count + 1)); fi
    if seed_spiritual_content; then success_count=$((success_count + 1)); fi
    if create_admin_user; then success_count=$((success_count + 1)); fi
    
    # Verificar integridade
    if verify_data_integrity; then
        log_success "🎉 Seeding concluído: $success_count/$total_operations operações bem-sucedidas"
        return 0
    else
        log_error "Falha na verificação de integridade dos dados"
        return 1
    fi
}

# Função para limpar dados (útil para testes)
clean_data() {
    log_warning "🧹 Limpando dados existentes..."
    
    local tables=("SpiritualContents" "UmbandaLines" "Orixas" "Users")
    
    for table in "${tables[@]}"; do
        if docker exec batuara-db psql -U batuara_user -d batuara_db -c "TRUNCATE TABLE \"$table\" CASCADE;" >/dev/null 2>&1; then
            log_success "Tabela $table limpa"
        else
            log_warning "Falha ao limpar tabela $table"
        fi
    done
}

# Função principal
main() {
    case "${1:-seed}" in
        seed)
            seed_all_data
            ;;
        clean)
            clean_data
            ;;
        verify)
            verify_data_integrity
            ;;
        orixas)
            seed_orixas_data
            ;;
        umbanda)
            seed_umbanda_lines_data
            ;;
        spiritual)
            seed_spiritual_content
            ;;
        admin)
            create_admin_user
            ;;
        *)
            echo "Uso: $0 [seed|clean|verify|orixas|umbanda|spiritual|admin]"
            echo "  seed      - Popular todos os dados (padrão)"
            echo "  clean     - Limpar dados existentes"
            echo "  verify    - Verificar integridade dos dados"
            echo "  orixas    - Popular apenas dados de Orixás"
            echo "  umbanda   - Popular apenas Linhas de Umbanda"
            echo "  spiritual - Popular apenas conteúdo espiritual"
            echo "  admin     - Criar apenas usuário administrador"
            exit 1
            ;;
    esac
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi