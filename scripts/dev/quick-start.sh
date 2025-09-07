#!/bin/bash

# Script de início rápido para desenvolvimento - Batuara.net
# Facilita o uso da nova estrutura reorganizada

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

show_help() {
    echo "🚀 Batuara.net - Script de Início Rápido"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  dev          - Iniciar ambiente de desenvolvimento (apenas frontends)"
    echo "  full         - Iniciar ambiente completo (frontends + API + banco)"
    echo "  stop         - Parar todos os serviços"
    echo "  clean        - Limpar containers e imagens"
    echo "  logs         - Mostrar logs dos serviços"
    echo "  status       - Mostrar status dos containers"
    echo "  test         - Executar testes"
    echo "  build        - Fazer build das aplicações"
    echo "  oracle       - Comandos específicos para Oracle Cloud"
    echo "  help         - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 dev       # Inicia apenas os frontends"
    echo "  $0 full      # Inicia ambiente completo"
    echo "  $0 oracle    # Mostra comandos Oracle disponíveis"
}

show_oracle_help() {
    echo "☁️ Comandos Oracle Cloud Infrastructure"
    echo ""
    echo "Uso: $0 oracle [SUBCOMANDO]"
    echo ""
    echo "Subcomandos disponíveis:"
    echo "  deploy       - Deploy automático para OCI"
    echo "  diagnose     - Diagnosticar problemas no servidor"
    echo "  clear-cache  - Limpar cache no servidor"
    echo "  cleanup      - Limpeza completa no servidor"
    echo "  quick-fix    - Correção rápida de problemas"
    echo ""
    echo "Exemplos:"
    echo "  $0 oracle deploy     # Executa deploy para OCI"
    echo "  $0 oracle diagnose   # Executa diagnóstico"
}

check_requirements() {
    log_info "Verificando requisitos..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado"
        exit 1
    fi
    
    log_success "Requisitos verificados"
}

start_dev() {
    log_info "Iniciando ambiente de desenvolvimento (apenas frontends)..."
    
    # Verificar se arquivo .env existe
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_warning "Arquivo .env não encontrado, copiando de .env.example"
            cp .env.example .env
        else
            log_error "Arquivo .env não encontrado e .env.example não existe"
            exit 1
        fi
    fi
    
    docker-compose up -d
    
    log_success "Ambiente de desenvolvimento iniciado!"
    echo ""
    log_info "Serviços disponíveis:"
    echo "  🌐 Website Público: http://localhost:3000"
    echo "  🔧 Dashboard Admin: http://localhost:3001"
    echo ""
    log_info "Para ver logs: $0 logs"
    log_info "Para parar: $0 stop"
}

start_full() {
    log_info "Iniciando ambiente completo (frontends + API + banco)..."
    
    if [ ! -f "scripts/docker/docker-compose.oracle.yml" ]; then
        log_error "Arquivo docker-compose.oracle.yml não encontrado"
        exit 1
    fi
    
    docker-compose -f docker-compose.yml -f scripts/docker/docker-compose.oracle.yml up -d
    
    log_success "Ambiente completo iniciado!"
    echo ""
    log_info "Serviços disponíveis:"
    echo "  🌐 Website Público: http://localhost:3000"
    echo "  🔧 Dashboard Admin: http://localhost:3001"
    echo "  🚀 API Backend: http://localhost:8080"
    echo "  🗄️ Banco PostgreSQL: localhost:5432"
    echo ""
    log_info "Para ver logs: $0 logs"
    log_info "Para parar: $0 stop"
}

stop_services() {
    log_info "Parando todos os serviços..."
    
    # Parar com docker-compose padrão
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Parar com configuração completa se existir
    if [ -f "scripts/docker/docker-compose.oracle.yml" ]; then
        docker-compose -f docker-compose.yml -f scripts/docker/docker-compose.oracle.yml down --remove-orphans 2>/dev/null || true
    fi
    
    # Parar containers Batuara específicos
    docker ps --format "{{.Names}}" | grep -i batuara | xargs -r docker stop
    
    log_success "Serviços parados"
}

clean_docker() {
    log_info "Limpando containers e imagens..."
    
    # Parar serviços primeiro
    stop_services
    
    # Remover containers Batuara
    docker ps -a --format "{{.Names}}" | grep -i batuara | xargs -r docker rm -f
    
    # Remover imagens Batuara
    docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -i batuara | awk '{print $2}' | xargs -r docker rmi -f
    
    # Limpeza geral
    docker system prune -f
    
    log_success "Limpeza concluída"
}

show_logs() {
    log_info "Mostrando logs dos serviços..."
    
    if docker-compose ps -q | grep -q .; then
        docker-compose logs -f --tail=50
    else
        log_warning "Nenhum serviço está rodando"
    fi
}

show_status() {
    log_info "Status dos containers:"
    echo ""
    
    # Status dos containers Batuara
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i batuara; then
        echo ""
    else
        log_warning "Nenhum container Batuara está rodando"
    fi
    
    # Verificar se docker-compose está ativo
    if [ -f "docker-compose.yml" ]; then
        echo ""
        log_info "Status do Docker Compose:"
        docker-compose ps
    fi
}

run_tests() {
    log_info "Executando testes..."
    
    # Testes do backend
    if [ -d "src/Backend" ]; then
        log_info "Executando testes do backend..."
        dotnet test --configuration Release --logger trx
    fi
    
    # Testes do frontend
    if [ -d "src/Frontend" ]; then
        log_info "Executando testes do frontend..."
        cd src/Frontend
        
        if [ -d "PublicWebsite" ]; then
            log_info "Testando PublicWebsite..."
            cd PublicWebsite
            npm test -- --coverage --watchAll=false
            cd ..
        fi
        
        if [ -d "AdminDashboard" ]; then
            log_info "Testando AdminDashboard..."
            cd AdminDashboard
            npm test -- --coverage --watchAll=false
            cd ..
        fi
        
        cd ..
    fi
    
    log_success "Testes concluídos"
}

build_apps() {
    log_info "Fazendo build das aplicações..."
    
    # Build do backend
    if [ -d "src/Backend" ]; then
        log_info "Build do backend..."
        dotnet build --configuration Release
    fi
    
    # Build do frontend
    if [ -d "src/Frontend" ]; then
        log_info "Build do frontend..."
        cd src/Frontend
        
        if [ -f "package.json" ]; then
            npm run build:all
        else
            # Build individual se não houver script centralizado
            if [ -d "PublicWebsite" ]; then
                cd PublicWebsite && npm run build && cd ..
            fi
            if [ -d "AdminDashboard" ]; then
                cd AdminDashboard && npm run build && cd ..
            fi
        fi
        
        cd ..
    fi
    
    log_success "Build concluído"
}

handle_oracle() {
    case "$2" in
        "deploy")
            if [ -f "scripts/oracle/oracle-deploy-ready.sh" ]; then
                ./scripts/oracle/oracle-deploy-ready.sh
            else
                log_error "Script de deploy não encontrado"
            fi
            ;;
        "diagnose")
            if [ -f "scripts/oracle/diagnose-assets-oracle.sh" ]; then
                ./scripts/oracle/diagnose-assets-oracle.sh
            else
                log_error "Script de diagnóstico não encontrado"
            fi
            ;;
        "clear-cache")
            if [ -f "scripts/oracle/clear-cache-oracle.sh" ]; then
                ./scripts/oracle/clear-cache-oracle.sh
            else
                log_error "Script de limpeza de cache não encontrado"
            fi
            ;;
        "cleanup")
            if [ -f "scripts/oracle/oracle-cleanup.sh" ]; then
                ./scripts/oracle/oracle-cleanup.sh
            else
                log_error "Script de limpeza não encontrado"
            fi
            ;;
        "quick-fix")
            if [ -f "scripts/oracle/oracle-quick-fix.sh" ]; then
                ./scripts/oracle/oracle-quick-fix.sh
            else
                log_error "Script de correção rápida não encontrado"
            fi
            ;;
        *)
            show_oracle_help
            ;;
    esac
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    log_error "Este script deve ser executado na raiz do projeto Batuara.net"
    exit 1
fi

# Processar comando
case "$1" in
    "dev")
        check_requirements
        start_dev
        ;;
    "full")
        check_requirements
        start_full
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_docker
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "test")
        run_tests
        ;;
    "build")
        build_apps
        ;;
    "oracle")
        handle_oracle "$@"
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        log_error "Comando desconhecido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac