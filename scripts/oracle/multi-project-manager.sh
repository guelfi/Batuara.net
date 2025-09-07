#!/bin/bash

# Multi-Project Manager para OCI
# Gerencia múltiplos projetos (Batuara.net, MobileMed, etc.) na mesma instância OCI
# Evita conflitos de porta, recursos e garante isolamento

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações OCI
OCI_HOST="${OCI_HOST:-129.153.86.168}"
OCI_USER="${OCI_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-ssh-key-2025-08-28.key}"

# Configurações dos projetos conhecidos
declare -A PROJECT_PORTS=(
    ["batuara"]="3000,3001,8080"
    ["mobilemed"]="5000,5005"
    ["other"]="9000-9999"
)

declare -A PROJECT_NETWORKS=(
    ["batuara"]="batuara-network"
    ["mobilemed"]="mobilemed-network"
)

declare -A PROJECT_COMPOSE_NAMES=(
    ["batuara"]="batuara-net"
    ["mobilemed"]="mobilemed-api"
)

# Funções de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

log_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}\n"
}

# Verificar se uma porta está em uso
check_port() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Verificar conflitos de porta para um projeto
check_project_ports() {
    local project=$1
    local ports=${PROJECT_PORTS[$project]}
    local conflicts=0
    
    log_info "Verificando portas do projeto $project: $ports"
    
    IFS=',' read -ra PORT_ARRAY <<< "$ports"
    for port in "${PORT_ARRAY[@]}"; do
        if check_port "$port"; then
            local pid=$(lsof -ti:$port 2>/dev/null || echo "unknown")
            local process_info=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            
            # Verificar se é do mesmo projeto
            local container_name=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep ":$port->" | awk '{print $1}' || echo "")
            
            if [[ $container_name == *"${PROJECT_COMPOSE_NAMES[$project]}"* ]]; then
                log_success "Porta $port: OK (pertence ao projeto $project)"
            else
                log_error "Porta $port: CONFLITO! Usada por PID $pid ($process_info)"
                if [[ -n $container_name ]]; then
                    log_error "  Container: $container_name"
                fi
                conflicts=$((conflicts + 1))
            fi
        else
            log_success "Porta $port: Disponível"
        fi
    done
    
    return $conflicts
}

# Listar todos os projetos ativos
list_active_projects() {
    log_header "PROJETOS ATIVOS NA OCI"
    
    echo -e "${CYAN}Container Name\t\t\tStatus\t\tPorts${NC}"
    echo "─────────────────────────────────────────────────────────────"
    
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "batuara|mobilemed" || {
        log_warning "Nenhum projeto conhecido encontrado em execução"
        return 1
    }
}

# Verificar recursos do sistema
check_system_resources() {
    log_header "RECURSOS DO SISTEMA"
    
    # CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    log_info "CPU Usage: ${cpu_usage}%"
    
    # Memória
    local mem_info=$(free -h | grep "Mem:")
    log_info "Memory: $mem_info"
    
    # Disco
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}')
    log_info "Disk Usage: $disk_usage"
    
    # Docker
    local docker_containers=$(docker ps -q | wc -l)
    local docker_images=$(docker images -q | wc -l)
    log_info "Docker: $docker_containers containers, $docker_images images"
}

# Verificar redes Docker
check_docker_networks() {
    log_header "REDES DOCKER"
    
    for project in "${!PROJECT_NETWORKS[@]}"; do
        local network=${PROJECT_NETWORKS[$project]}
        if docker network ls | grep -q "$network"; then
            local network_info=$(docker network inspect "$network" --format '{{.IPAM.Config}}' 2>/dev/null || echo "N/A")
            log_success "Rede $network ($project): Ativa - $network_info"
        else
            log_warning "Rede $network ($project): Não encontrada"
        fi
    done
}

# Verificar volumes Docker
check_docker_volumes() {
    log_header "VOLUMES DOCKER"
    
    docker volume ls --format "table {{.Name}}\t{{.Driver}}" | grep -E "batuara|mobilemed" || {
        log_warning "Nenhum volume de projeto encontrado"
    }
}

# Limpar recursos órfãos
cleanup_orphaned_resources() {
    log_header "LIMPEZA DE RECURSOS ÓRFÃOS"
    
    log_info "Removendo containers parados..."
    docker container prune -f
    
    log_info "Removendo imagens não utilizadas..."
    docker image prune -f
    
    log_info "Removendo redes não utilizadas..."
    docker network prune -f
    
    log_info "Removendo volumes não utilizados..."
    docker volume prune -f
    
    log_success "Limpeza concluída"
}

# Parar projeto específico
stop_project() {
    local project=$1
    local compose_name=${PROJECT_COMPOSE_NAMES[$project]}
    
    if [[ -z $compose_name ]]; then
        log_error "Projeto '$project' não reconhecido"
        return 1
    fi
    
    log_header "PARANDO PROJETO: $project"
    
    # Parar containers do projeto
    local containers=$(docker ps --filter "label=com.docker.compose.project=$compose_name" -q)
    if [[ -n $containers ]]; then
        log_info "Parando containers do projeto $project..."
        docker stop $containers
        log_success "Projeto $project parado"
    else
        log_warning "Nenhum container do projeto $project encontrado"
    fi
}

# Verificar saúde de todos os projetos
health_check_all() {
    log_header "VERIFICAÇÃO DE SAÚDE - TODOS OS PROJETOS"
    
    for project in "${!PROJECT_PORTS[@]}"; do
        log_info "Verificando projeto: $project"
        check_project_ports "$project"
        echo
    done
}

# Mostrar ajuda
show_help() {
    echo -e "${CYAN}Multi-Project Manager para OCI${NC}"
    echo -e "Gerencia múltiplos projetos na mesma instância OCI\n"
    echo -e "${YELLOW}Uso:${NC} $0 [comando] [opções]\n"
    echo -e "${YELLOW}Comandos:${NC}"
    echo "  status          - Mostra status de todos os projetos"
    echo "  ports [projeto] - Verifica conflitos de porta (projeto opcional)"
    echo "  resources       - Verifica recursos do sistema"
    echo "  networks        - Verifica redes Docker"
    echo "  volumes         - Verifica volumes Docker"
    echo "  health          - Verificação completa de saúde"
    echo "  cleanup         - Remove recursos órfãos"
    echo "  stop [projeto]  - Para um projeto específico"
    echo "  help            - Mostra esta ajuda"
    echo
    echo -e "${YELLOW}Projetos suportados:${NC} batuara, mobilemed"
    echo -e "${YELLOW}Exemplo:${NC} $0 ports batuara"
}

# Função principal
main() {
    local command=${1:-"status"}
    local project=$2
    
    case $command in
        "status")
            list_active_projects
            ;;
        "ports")
            if [[ -n $project ]]; then
                check_project_ports "$project"
            else
                health_check_all
            fi
            ;;
        "resources")
            check_system_resources
            ;;
        "networks")
            check_docker_networks
            ;;
        "volumes")
            check_docker_volumes
            ;;
        "health")
            list_active_projects
            echo
            health_check_all
            check_system_resources
            check_docker_networks
            ;;
        "cleanup")
            cleanup_orphaned_resources
            ;;
        "stop")
            if [[ -z $project ]]; then
                log_error "Especifique o projeto para parar"
                show_help
                exit 1
            fi
            stop_project "$project"
            ;;
        "help"|"--help"|"h")
            show_help
            ;;
        *)
            log_error "Comando desconhecido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    log_error "Docker não está rodando ou não está acessível"
    exit 1
fi

# Executar função principal
main "$@"