#!/bin/bash

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
STOP="🛑"
GEAR="⚙️"

# Configurações
API_PORT=3003
ADMIN_DASHBOARD_PORT=3001
PUBLIC_WEBSITE_PORT=3000
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

show_banner() {
    clear
    echo -e "${WHITE}${BOLD}Batuara.net${NC}\n"
}

check_dependencies() {
    local missing=()
    command -v node &> /dev/null || missing+=("Node.js")
    command -v npm &> /dev/null || missing+=("npm")
    command -v dotnet &> /dev/null || missing+=(".NET Core")
    command -v lsof &> /dev/null || missing+=("lsof")
    
    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${ERROR} ${RED}Dependências não encontradas:${NC}"
        printf '%s\n' "${missing[@]}" | sed 's/^/   • /'
        echo -e "\n${INFO} ${YELLOW}Instale as dependências antes de continuar.${NC}"
        exit 1
    fi
}

kill_port() {
    local port=$1
    local name=$2
    echo -e "${INFO} ${YELLOW}Verificando porta ${port} (${name})...${NC}"
    
    local pid=$(lsof -t -i :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${WARNING} ${YELLOW}Finalizando PID ${pid}...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
        if lsof -t -i :$port &> /dev/null; then
            echo -e "${ERROR} ${RED}Falha ao finalizar processo.${NC}"
            return 1
        fi
        echo -e "${SUCCESS} ${GREEN}Processo finalizado.${NC}"
    else
        echo -e "${SUCCESS} ${GREEN}Porta disponível.${NC}"
    fi
    return 0
}

start_service() {
    local name=$1 dir=$2 cmd=$3 port=$4 url=$5 desc=$6
    
    echo -e "\n${GEAR} ${BLUE}Iniciando ${name}...${NC}"
    echo -e "${INFO} ${CYAN}${desc}${NC}"
    
    [ ! -d "$dir" ] && { echo -e "${ERROR} ${RED}Diretório não encontrado: ${dir}${NC}"; return 1; }
    
    kill_port $port "$name" || return 1
    
    echo -e "${ROCKET} ${BLUE}Executando: ${cmd}${NC}"
    local log="/tmp/batuara_$(echo $name | tr '[:upper:]' '[:lower:]')_$(date +%Y%m%d_%H%M%S).log"
    (cd "$dir" && eval "$cmd" > "$log" 2>&1 &)
    local pid=$!
    
    # Aguardar inicialização sem verificar PID imediatamente
    if [[ "$name" == *"API"* ]]; then
        echo -e "${INFO} ${YELLOW}Aguardando compilação .NET...${NC}"
        sleep 25
    else
        echo -e "${INFO} ${YELLOW}Aguardando inicialização React...${NC}"
        sleep 20
    fi
    
    # Tentar validar até 8 vezes verificando se a porta está respondendo
    local attempts=0
    local max_attempts=8
    
    while [ $attempts -lt $max_attempts ]; do
        ((attempts++))
        
        # Verificar se a porta está respondendo
        if curl -s --connect-timeout 3 "http://localhost:$port" > /dev/null 2>&1; then
            echo -e "${SUCCESS} ${GREEN}${name} iniciado e respondendo! (PID: $pid)${NC}"
            echo "${name}|${url}|${desc}" >> /tmp/batuara_services.tmp
            return 0
        fi
        
        echo -e "${INFO} ${CYAN}Tentativa $attempts/$max_attempts - aguardando serviço responder...${NC}"
        sleep 4
    done
    
    echo -e "${ERROR} ${RED}Falha ao iniciar ${name}. Log: ${log}${NC}"
    return 1
}

start_all() {
    show_banner
    check_dependencies
    
    > /tmp/batuara_services.tmp
    echo -e "${ROCKET} ${BLUE}Iniciando ambiente Batuara.net...${NC}"
    
    local started=0
    start_service "Batuara.API" "$BASE_DIR/Backend/Batuara.API" "dotnet run --urls http://localhost:$API_PORT" $API_PORT "http://localhost:$API_PORT" "API Backend" && ((started++))
    start_service "AdminDashboard" "$BASE_DIR/Frontend/AdminDashboard" "PORT=$ADMIN_DASHBOARD_PORT npm start" $ADMIN_DASHBOARD_PORT "http://localhost:$ADMIN_DASHBOARD_PORT" "Painel Admin" && ((started++))
    start_service "PublicWebsite" "$BASE_DIR/Frontend/PublicWebsite" "PORT=$PUBLIC_WEBSITE_PORT npm start" $PUBLIC_WEBSITE_PORT "http://localhost:$PUBLIC_WEBSITE_PORT" "Website Público" && ((started++))
    
    echo -e "\n${INFO} ${YELLOW}Finalizando inicialização...${NC}"
    for i in {1..5}; do printf "${CYAN}▓"; sleep 1; done
    echo
    
    if [ $started -eq 3 ]; then
        echo -e "\n${SUCCESS} ${GREEN}Ambiente iniciado com sucesso!${NC}\n"
        echo -e "${WHITE}═══════════════════════════════════════════════════════════════════════════════${NC}"
        echo -e "${WHITE}                            SERVIÇOS ATIVOS                                   ${NC}"
        echo -e "${WHITE}═══════════════════════════════════════════════════════════════════════════════${NC}\n"
        
        local ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
        echo -e "${INFO} ${CYAN}IP Local: ${WHITE}$ip${NC}\n"
        
        while IFS='|' read -r name url desc; do
            echo -e "${SUCCESS} ${GREEN}$name${NC}"
            echo -e "   ${CYAN}URL: ${WHITE}$url${NC}"
            echo -e "   ${YELLOW}Descrição: $desc${NC}"
            echo -e "   ${PURPLE}Rede: ${WHITE}${url/localhost/$ip}${NC}\n"
        done < /tmp/batuara_services.tmp
        
        echo -e "${WHITE}═══════════════════════════════════════════════════════════════════════════════${NC}\n"
        echo -e "${INFO} ${YELLOW}Pressione Ctrl+C para parar todos os serviços...${NC}"
        
        trap 'echo; echo -e "${STOP} ${YELLOW}Parando serviços...${NC}"; stop_all; exit 0' INT
        while true; do sleep 1; done
    else
        echo -e "${ERROR} ${RED}Alguns serviços falharam. Verifique os logs.${NC}"
        exit 1
    fi
}

stop_all() {
    show_banner
    echo -e "${STOP} ${RED}Parando todos os serviços...${NC}\n"
    
    kill_port $API_PORT "Batuara.API"
    kill_port $ADMIN_DASHBOARD_PORT "AdminDashboard"
    kill_port $PUBLIC_WEBSITE_PORT "PublicWebsite"
    
    rm -f /tmp/batuara_services.tmp /tmp/batuara_*.log
    echo -e "\n${SUCCESS} ${GREEN}Todos os serviços foram parados!${NC}\n"
}

check_status() {
    show_banner
    echo -e "${INFO} ${WHITE}STATUS DOS SERVIÇOS${NC}\n"
    
    local services=("Batuara.API:$API_PORT" "AdminDashboard:$ADMIN_DASHBOARD_PORT" "PublicWebsite:$PUBLIC_WEBSITE_PORT")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        local pid=$(lsof -t -i :$port 2>/dev/null)
        
        if [ -n "$pid" ]; then
            echo -e "${SUCCESS} ${GREEN}$name${NC} - ${GREEN}ATIVO${NC} (PID: $pid, Porta: $port)"
        else
            echo -e "${ERROR} ${RED}$name${NC} - ${RED}INATIVO${NC} (Porta: $port)"
        fi
    done
    echo
}

show_help() {
    show_banner
    echo -e "${INFO} ${WHITE}USO:${NC}"
    echo -e "   ${CYAN}./servers.sh ${YELLOW}[COMANDO]${NC}\n"
    
    echo -e "${INFO} ${WHITE}COMANDOS:${NC}"
    echo -e "   ${GREEN}start${NC}    ${CYAN}Inicia todos os serviços${NC}"
    echo -e "   ${RED}stop${NC}     ${CYAN}Para todos os serviços${NC}"
    echo -e "   ${BLUE}status${NC}   ${CYAN}Mostra status dos serviços${NC}"
    echo -e "   ${YELLOW}help${NC}     ${CYAN}Exibe esta ajuda${NC}\n"
    
    echo -e "${INFO} ${WHITE}SERVIÇOS:${NC}"
    echo -e "   ${SUCCESS} ${GREEN}Batuara.API${NC}        - Backend (porta $API_PORT)"
    echo -e "   ${SUCCESS} ${GREEN}AdminDashboard${NC}     - Admin (porta $ADMIN_DASHBOARD_PORT)"
    echo -e "   ${SUCCESS} ${GREEN}PublicWebsite${NC}      - Website (porta $PUBLIC_WEBSITE_PORT)\n"
}

case "${1:-help}" in
    start) start_all ;;
    stop) stop_all ;;
    status) check_status ;;
    help|--help|-h) show_help ;;
    *) echo -e "${ERROR} ${RED}Comando inválido: $1${NC}\n"; show_help; exit 1 ;;
esac