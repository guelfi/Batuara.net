#!/bin/bash

# ============================================================================
# BATUARA DEPLOY AUTOMATION SCRIPT
# ============================================================================
# Autor: Kiro AI Assistant
# Versão: 1.0
# Descrição: Script automatizado para deploy do projeto Batuara
# Uso: ./deploy.sh [opções]
# ============================================================================

# Cores e emojis
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
BACKUP="💾"
SYNC="🔄"
VALIDATE="🔍"
ROLLBACK="⏪"

# Configurações
PROJECT_NAME="batuara"
GIT_BRANCH="master"
BACKUP_DIR="/tmp/batuara_backups"
LOG_FILE="/tmp/batuara_deploy_$(date +%Y%m%d_%H%M%S).log"
DEPLOY_ID="deploy_$(date +%Y%m%d_%H%M%S)"

# URLs para validação
VALIDATION_URLS=(
    "http://localhost:3000"
    "http://localhost:3001"
)

# Funções de logging
log_info() {
    local msg="$1"
    echo -e "${INFO} ${BLUE}$msg${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    local msg="$1"
    echo -e "${SUCCESS} ${GREEN}$msg${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    local msg="$1"
    echo -e "${WARNING} ${YELLOW}$msg${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    local msg="$1"
    echo -e "${ERROR} ${RED}$msg${NC}" | tee -a "$LOG_FILE"
}

# Banner do deploy
show_banner() {
    clear
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${WHITE}                    🚀 BATUARA DEPLOY AUTOMATION 🚀                      ${NC}"
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${CYAN}Deploy ID: ${WHITE}$DEPLOY_ID${NC}"
    echo -e "${CYAN}Timestamp: ${WHITE}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}Log File: ${WHITE}$LOG_FILE${NC}"
    echo -e "${WHITE}============================================================================${NC}"
    echo
}

# Função para criar backup
create_backup() {
    log_info "${BACKUP} Criando backup do sistema..."
    
    # Criar diretório de backup
    mkdir -p "$BACKUP_DIR/$DEPLOY_ID"
    
    # Backup do banco de dados
    log_info "Fazendo backup do banco de dados..."
    if docker exec batuara-db pg_dump -U batuara_user -d batuara_db > "$BACKUP_DIR/$DEPLOY_ID/database_backup.sql" 2>/dev/null; then
        log_success "Backup do banco criado com sucesso"
    else
        log_warning "Falha no backup do banco (pode estar vazio)"
    fi
    
    # Backup de configurações
    log_info "Fazendo backup das configurações..."
    cp .env "$BACKUP_DIR/$DEPLOY_ID/" 2>/dev/null || log_warning "Arquivo .env não encontrado"
    cp docker-compose.yml "$BACKUP_DIR/$DEPLOY_ID/" 2>/dev/null || log_warning "docker-compose.yml não encontrado"
    
    # Backup do estado dos containers
    docker-compose ps > "$BACKUP_DIR/$DEPLOY_ID/containers_state.txt"
    
    # Informações do commit atual
    git log -1 --oneline > "$BACKUP_DIR/$DEPLOY_ID/current_commit.txt" 2>/dev/null || echo "No git info" > "$BACKUP_DIR/$DEPLOY_ID/current_commit.txt"
    
    log_success "Backup completo criado em: $BACKUP_DIR/$DEPLOY_ID"
}

# Função para sincronizar com Git
sync_with_git() {
    log_info "${SYNC} Sincronizando com repositório Git..."
    
    # Verificar se é um repositório Git
    if [ ! -d ".git" ]; then
        log_error "Não é um repositório Git válido"
        return 1
    fi
    
    # Fetch das mudanças
    log_info "Buscando atualizações do repositório..."
    if git fetch origin $GIT_BRANCH; then
        log_success "Fetch realizado com sucesso"
    else
        log_error "Falha no fetch do repositório"
        return 1
    fi
    
    # Verificar se há mudanças
    local current_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/$GIT_BRANCH)
    
    if [ "$current_commit" = "$remote_commit" ]; then
        log_info "Repositório já está atualizado"
        return 2  # Código especial para "sem mudanças"
    fi
    
    # Mostrar mudanças que serão aplicadas
    log_info "Mudanças detectadas:"
    git log --oneline $current_commit..$remote_commit | head -5 | while read line; do
        echo -e "  ${CYAN}• $line${NC}"
    done
    
    # Pull das mudanças
    log_info "Aplicando atualizações..."
    if git pull origin $GIT_BRANCH; then
        log_success "Repositório atualizado com sucesso"
        
        # Log do commit atual
        local new_commit=$(git log -1 --oneline)
        log_info "Commit atual: $new_commit"
        return 0
    else
        log_error "Falha ao atualizar repositório"
        return 1
    fi
}

# Função para detectar mudanças nos serviços
detect_service_changes() {
    log_info "Detectando mudanças nos serviços..."
    
    # Lista de serviços que podem precisar rebuild
    local services_changed=()
    
    # Verificar mudanças no backend
    if git diff HEAD~1 --name-only | grep -q "src/Backend\|Dockerfile.api"; then
        services_changed+=("batuara-api")
        log_info "Mudanças detectadas no backend"
    fi
    
    # Verificar mudanças no frontend público
    if git diff HEAD~1 --name-only | grep -q "src/Frontend/PublicWebsite\|Dockerfile.frontend"; then
        services_changed+=("batuara-public-website")
        log_info "Mudanças detectadas no frontend público"
    fi
    
    # Verificar mudanças no admin dashboard
    if git diff HEAD~1 --name-only | grep -q "src/Frontend/AdminDashboard\|Dockerfile.frontend"; then
        services_changed+=("batuara-admin-dashboard")
        log_info "Mudanças detectadas no admin dashboard"
    fi
    
    # Verificar mudanças no docker-compose
    if git diff HEAD~1 --name-only | grep -q "docker-compose.yml"; then
        services_changed+=("all")
        log_info "Mudanças detectadas no docker-compose.yml"
    fi
    
    echo "${services_changed[@]}"
}

# Função para rebuild de containers
rebuild_containers() {
    local services_to_rebuild=("$@")
    
    if [ ${#services_to_rebuild[@]} -eq 0 ]; then
        log_info "Nenhum serviço precisa ser reconstruído"
        return 0
    fi
    
    log_info "Reconstruindo containers: ${services_to_rebuild[*]}"
    
    # Se "all" está na lista, rebuild tudo
    if [[ " ${services_to_rebuild[@]} " =~ " all " ]]; then
        log_info "Reconstruindo todos os serviços..."
        if docker-compose up -d --build; then
            log_success "Todos os serviços reconstruídos"
        else
            log_error "Falha na reconstrução dos serviços"
            return 1
        fi
    else
        # Rebuild apenas serviços específicos
        for service in "${services_to_rebuild[@]}"; do
            log_info "Reconstruindo $service..."
            if docker-compose up -d --build "$service"; then
                log_success "$service reconstruído com sucesso"
            else
                log_error "Falha na reconstrução de $service"
                return 1
            fi
        done
    fi
    
    # Aguardar containers ficarem prontos
    log_info "Aguardando containers ficarem prontos..."
    sleep 15
    
    return 0
}

# Função para validar serviços
validate_services() {
    log_info "${VALIDATE} Validando serviços..."
    
    local failed_services=()
    
    # Verificar status dos containers
    log_info "Verificando status dos containers..."
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Nenhum container está rodando"
        return 1
    fi
    
    # Testar URLs de validação
    for url in "${VALIDATION_URLS[@]}"; do
        log_info "Testando $url..."
        if curl -s --connect-timeout 10 "$url" > /dev/null; then
            log_success "$url está respondendo"
        else
            log_error "$url não está respondendo"
            failed_services+=("$url")
        fi
    done
    
    # Verificar se houve falhas
    if [ ${#failed_services[@]} -gt 0 ]; then
        log_error "Falha na validação dos serviços: ${failed_services[*]}"
        return 1
    fi
    
    log_success "Todos os serviços estão funcionando corretamente"
    return 0
}

# Função para rollback
perform_rollback() {
    log_warning "${ROLLBACK} Iniciando rollback automático..."
    
    local backup_path="$BACKUP_DIR/$DEPLOY_ID"
    
    if [ ! -d "$backup_path" ]; then
        log_error "Backup não encontrado para rollback"
        return 1
    fi
    
    # Parar containers atuais
    log_info "Parando containers atuais..."
    docker-compose down
    
    # Restaurar configurações
    log_info "Restaurando configurações..."
    if [ -f "$backup_path/.env" ]; then
        cp "$backup_path/.env" .
        log_success "Arquivo .env restaurado"
    fi
    
    if [ -f "$backup_path/docker-compose.yml" ]; then
        cp "$backup_path/docker-compose.yml" .
        log_success "docker-compose.yml restaurado"
    fi
    
    # Restaurar banco de dados se necessário
    if [ -f "$backup_path/database_backup.sql" ] && [ -s "$backup_path/database_backup.sql" ]; then
        log_info "Restaurando banco de dados..."
        docker-compose up -d db
        sleep 10
        docker exec -i batuara-db psql -U batuara_user -d batuara_db < "$backup_path/database_backup.sql"
        log_success "Banco de dados restaurado"
    fi
    
    # Restaurar commit anterior
    if [ -f "$backup_path/current_commit.txt" ]; then
        local previous_commit=$(cat "$backup_path/current_commit.txt" | cut -d' ' -f1)
        if [ -n "$previous_commit" ] && [ "$previous_commit" != "No" ]; then
            log_info "Restaurando commit anterior: $previous_commit"
            git reset --hard "$previous_commit"
        fi
    fi
    
    # Reiniciar containers
    log_info "Reiniciando containers..."
    docker-compose up -d
    
    log_success "Rollback concluído"
}

# Função para mostrar resumo final
show_deploy_summary() {
    local status="$1"
    local duration="$2"
    
    echo
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${WHITE}                           RESUMO DO DEPLOY                               ${NC}"
    echo -e "${WHITE}============================================================================${NC}"
    echo -e "${CYAN}Deploy ID:${NC} $DEPLOY_ID"
    echo -e "${CYAN}Status:${NC} $status"
    echo -e "${CYAN}Duração:${NC} $duration"
    echo -e "${CYAN}Log File:${NC} $LOG_FILE"
    echo
    
    if [ "$status" = "${SUCCESS} SUCESSO" ]; then
        echo -e "${SUCCESS} ${GREEN}Deploy concluído com sucesso!${NC}"
        echo
        echo -e "${INFO} ${CYAN}Serviços disponíveis:${NC}"
        echo -e "  • Site Público: ${WHITE}http://129.153.86.168:3000${NC}"
        echo -e "  • Admin Dashboard: ${WHITE}http://129.153.86.168:3001${NC}"
    else
        echo -e "${ERROR} ${RED}Deploy falhou. Verifique os logs para mais detalhes.${NC}"
    fi
    
    echo -e "${WHITE}============================================================================${NC}"
}

# Função principal de deploy
main_deploy() {
    local start_time=$(date +%s)
    
    show_banner
    
    # Criar backup
    if ! create_backup; then
        log_error "Falha na criação do backup"
        return 1
    fi
    
    # Sincronizar com Git
    sync_with_git
    local git_result=$?
    
    if [ $git_result -eq 1 ]; then
        log_error "Falha na sincronização com Git"
        return 1
    elif [ $git_result -eq 2 ]; then
        log_info "Nenhuma atualização necessária"
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        show_deploy_summary "${SUCCESS} SUCESSO (SEM MUDANÇAS)" "${duration}s"
        return 0
    fi
    
    # Detectar mudanças nos serviços
    local services_changed=($(detect_service_changes))
    
    # Rebuild containers se necessário
    if [ ${#services_changed[@]} -gt 0 ]; then
        if ! rebuild_containers "${services_changed[@]}"; then
            log_error "Falha na reconstrução dos containers"
            perform_rollback
            return 1
        fi
    fi
    
    # Validar serviços
    if ! validate_services; then
        log_error "Falha na validação dos serviços"
        perform_rollback
        return 1
    fi
    
    # Deploy bem-sucedido
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    show_deploy_summary "${SUCCESS} SUCESSO" "${duration}s"
    
    return 0
}

# Função de ajuda
show_help() {
    echo -e "${WHITE}BATUARA DEPLOY AUTOMATION${NC}"
    echo
    echo -e "${CYAN}USO:${NC}"
    echo -e "  ./deploy.sh [OPÇÃO]"
    echo
    echo -e "${CYAN}OPÇÕES:${NC}"
    echo -e "  ${GREEN}deploy${NC}     Executar deploy completo (padrão)"
    echo -e "  ${YELLOW}backup${NC}     Criar apenas backup"
    echo -e "  ${RED}rollback${NC}   Fazer rollback para backup anterior"
    echo -e "  ${BLUE}status${NC}     Verificar status dos serviços"
    echo -e "  ${PURPLE}help${NC}       Mostrar esta ajuda"
    echo
    echo -e "${CYAN}EXEMPLOS:${NC}"
    echo -e "  ./deploy.sh deploy    # Deploy completo"
    echo -e "  ./deploy.sh backup    # Apenas backup"
    echo -e "  ./deploy.sh status    # Verificar status"
    echo
}

# Processamento de argumentos
case "${1:-deploy}" in
    deploy)
        main_deploy
        ;;
    backup)
        show_banner
        create_backup
        ;;
    rollback)
        show_banner
        perform_rollback
        ;;
    status)
        show_banner
        validate_services
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${ERROR} ${RED}Opção inválida: $1${NC}"
        show_help
        exit 1
        ;;
esac