#!/bin/bash

# Port Manager para OCI - Gerenciamento de Portas Multi-Projeto
# Evita conflitos entre Batuara.net, MobileMed e outros projetos

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração de portas por projeto
declare -A PROJECT_PORTS=(
    ["batuara"]="3000,3001,3003,5432"
    ["mobilemed"]="5000,5005,3306,6379"
    ["nginx"]="80,443"
)

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Função para listar portas em uso
list_used_ports() {
    log "Verificando portas em uso..."
    echo -e "\n${BLUE}Portas ativas no sistema:${NC}"
    netstat -tuln 2>/dev/null | grep LISTEN | awk '{print $4}' | sed 's/.*://' | sort -n | uniq | while read port; do
        local process=$(lsof -ti:$port 2>/dev/null | head -1)
        if [ -n "$process" ]; then
            local process_name=$(ps -p $process -o comm= 2>/dev/null || echo "unknown")
            echo "  Porta $port - Processo: $process_name (PID: $process)"
        else
            echo "  Porta $port - Processo: desconhecido"
        fi
    done
}

# Função para verificar conflitos de porta por projeto
check_project_conflicts() {
    local project=$1
    local conflicts=0
    
    if [ -z "${PROJECT_PORTS[$project]:-}" ]; then
        log_error "Projeto '$project' não encontrado na configuração"
        return 1
    fi
    
    log "Verificando conflitos para o projeto: $project"
    
    IFS=',' read -ra PORTS <<< "${PROJECT_PORTS[$project]}"
    for port in "${PORTS[@]}"; do
        if check_port "$port"; then
            local process=$(lsof -ti:$port 2>/dev/null | head -1)
            local process_name=$(ps -p $process -o comm= 2>/dev/null || echo "unknown")
            log_warning "Conflito na porta $port - Processo: $process_name (PID: $process)"
            conflicts=$((conflicts + 1))
        else
            log_success "Porta $port disponível"
        fi
    done
    
    if [ $conflicts -eq 0 ]; then
        log_success "Nenhum conflito encontrado para o projeto $project"
    else
        log_error "$conflicts conflito(s) encontrado(s) para o projeto $project"
    fi
    
    return $conflicts
}

# Função para verificar todos os projetos
check_all_projects() {
    log "Verificando conflitos para todos os projetos..."
    local total_conflicts=0
    
    for project in "${!PROJECT_PORTS[@]}"; do
        echo -e "\n${BLUE}=== Projeto: $project ===${NC}"
        check_project_conflicts "$project"
        local project_conflicts=$?
        total_conflicts=$((total_conflicts + project_conflicts))
    done
    
    echo -e "\n${BLUE}=== Resumo ===${NC}"
    if [ $total_conflicts -eq 0 ]; then
        log_success "Todos os projetos podem ser executados sem conflitos"
    else
        log_error "Total de $total_conflicts conflito(s) encontrado(s)"
    fi
    
    return $total_conflicts
}

# Função para encontrar próxima porta disponível
find_next_available_port() {
    local start_port=$1
    local port=$start_port
    
    while check_port "$port"; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            log_error "Nenhuma porta disponível encontrada a partir de $start_port"
            return 1
        fi
    done
    
    echo $port
}

# Função para sugerir portas alternativas
suggest_alternative_ports() {
    local project=$1
    
    if [ -z "${PROJECT_PORTS[$project]:-}" ]; then
        log_error "Projeto '$project' não encontrado na configuração"
        return 1
    fi
    
    log "Sugerindo portas alternativas para o projeto: $project"
    
    IFS=',' read -ra PORTS <<< "${PROJECT_PORTS[$project]}"
    for port in "${PORTS[@]}"; do
        if check_port "$port"; then
            local alternative=$(find_next_available_port $((port + 100)))
            if [ $? -eq 0 ]; then
                log_warning "Porta $port em uso - Sugestão: $alternative"
            fi
        fi
    done
}

# Função para parar processos em portas específicas
stop_port_processes() {
    local ports="$1"
    local force=${2:-false}
    
    IFS=',' read -ra PORT_ARRAY <<< "$ports"
    for port in "${PORT_ARRAY[@]}"; do
        if check_port "$port"; then
            local pids=$(lsof -ti:$port 2>/dev/null)
            if [ -n "$pids" ]; then
                for pid in $pids; do
                    local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
                    if [ "$force" = true ]; then
                        log_warning "Forçando parada do processo $process_name (PID: $pid) na porta $port"
                        kill -9 $pid 2>/dev/null || true
                    else
                        log "Parando processo $process_name (PID: $pid) na porta $port"
                        kill -15 $pid 2>/dev/null || true
                        sleep 2
                        if kill -0 $pid 2>/dev/null; then
                            log_warning "Processo ainda ativo, forçando parada..."
                            kill -9 $pid 2>/dev/null || true
                        fi
                    fi
                done
                log_success "Processos na porta $port foram parados"
            fi
        else
            log "Porta $port já está livre"
        fi
    done
}

# Função para reservar portas para um projeto
reserve_ports() {
    local project=$1
    local reserve_file="/tmp/port-reservations-$project.lock"
    
    if [ -z "${PROJECT_PORTS[$project]:-}" ]; then
        log_error "Projeto '$project' não encontrado na configuração"
        return 1
    fi
    
    log "Reservando portas para o projeto: $project"
    
    # Criar arquivo de reserva
    echo "$(date): Portas reservadas para $project" > "$reserve_file"
    echo "PID: $$" >> "$reserve_file"
    echo "Portas: ${PROJECT_PORTS[$project]}" >> "$reserve_file"
    
    log_success "Portas reservadas em: $reserve_file"
}

# Função para liberar reservas de porta
release_ports() {
    local project=$1
    local reserve_file="/tmp/port-reservations-$project.lock"
    
    if [ -f "$reserve_file" ]; then
        rm -f "$reserve_file"
        log_success "Reservas de porta liberadas para o projeto: $project"
    else
        log "Nenhuma reserva encontrada para o projeto: $project"
    fi
}

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}Port Manager - Gerenciamento de Portas Multi-Projeto${NC}"
    echo ""
    echo "Uso: $0 [COMANDO] [OPÇÕES]"
    echo ""
    echo "Comandos:"
    echo "  list                    - Lista todas as portas em uso"
    echo "  check [projeto]         - Verifica conflitos para um projeto específico"
    echo "  check-all              - Verifica conflitos para todos os projetos"
    echo "  suggest [projeto]       - Sugere portas alternativas para um projeto"
    echo "  stop [portas]          - Para processos nas portas especificadas (separadas por vírgula)"
    echo "  stop [portas] --force  - Força parada dos processos"
    echo "  reserve [projeto]      - Reserva portas para um projeto"
    echo "  release [projeto]      - Libera reservas de porta de um projeto"
    echo "  help                   - Mostra esta ajuda"
    echo ""
    echo "Projetos disponíveis:"
    for project in "${!PROJECT_PORTS[@]}"; do
        echo "  - $project: ${PROJECT_PORTS[$project]}"
    done
    echo ""
    echo "Exemplos:"
    echo "  $0 check batuara"
    echo "  $0 check-all"
    echo "  $0 stop 3000,3001"
    echo "  $0 suggest mobilemed"
}

# Função principal
main() {
    case "${1:-help}" in
        "list")
            list_used_ports
            ;;
        "check")
            if [ $# -lt 2 ]; then
                log_error "Especifique o nome do projeto"
                show_help
                exit 1
            fi
            check_project_conflicts "$2"
            ;;
        "check-all")
            check_all_projects
            ;;
        "suggest")
            if [ $# -lt 2 ]; then
                log_error "Especifique o nome do projeto"
                show_help
                exit 1
            fi
            suggest_alternative_ports "$2"
            ;;
        "stop")
            if [ $# -lt 2 ]; then
                log_error "Especifique as portas a serem liberadas"
                show_help
                exit 1
            fi
            local force=false
            if [ "${3:-}" = "--force" ]; then
                force=true
            fi
            stop_port_processes "$2" "$force"
            ;;
        "reserve")
            if [ $# -lt 2 ]; then
                log_error "Especifique o nome do projeto"
                show_help
                exit 1
            fi
            reserve_ports "$2"
            ;;
        "release")
            if [ $# -lt 2 ]; then
                log_error "Especifique o nome do projeto"
                show_help
                exit 1
            fi
            release_ports "$2"
            ;;
        "help")
            show_help
            ;;
        *)
            log_error "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"