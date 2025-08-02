#!/bin/bash

# Script para inicializar os serviços do Batuara.net para testes locais
# Uso: ./server.sh [start|stop|restart|status|logs]

echo "=== BATUARA.NET - GERENCIADOR DE SERVIÇOS ==="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    if [ -f "docker-compose-fixed.yml" ]; then
        log_info "Renomeando docker-compose-fixed.yml para docker-compose.yml"
        mv docker-compose-fixed.yml docker-compose.yml
    else
        log_error "Arquivo docker-compose.yml não encontrado!"
        exit 1
    fi
fi

# Função para mostrar status
show_status() {
    log_info "Status dos containers:"
    docker-compose ps
    echo ""
    
    # Verificar se serviços estão respondendo
    if command -v curl &> /dev/null; then
        log_info "Testando conectividade dos serviços:"
        
        # Testar PublicWebsite
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
            log_success "PublicWebsite: OK (http://localhost:3000)"
        else
            log_warning "PublicWebsite: Não está respondendo"
        fi
        
        # Testar API
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null | grep -q "200"; then
            log_success "API: OK (http://localhost:8080)"
        else
            log_warning "API: Não está respondendo"
        fi
    fi
}

# Função para mostrar logs
show_logs() {
    if [ -n "$2" ]; then
        log_info "Mostrando logs do serviço: $2"
        docker-compose logs -f "$2"
    else
        log_info "Mostrando logs de todos os serviços (Ctrl+C para sair)"
        docker-compose logs -f
    fi
}

# Processar comando
case "${1:-start}" in
    "start")
        log_info "Iniciando serviços do Batuara.net..."
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            log_success "Serviços iniciados!"
            echo ""
            log_info "Aguardando inicialização (10 segundos)..."
            sleep 10
            show_status
            echo ""
            log_info "Acesso aos serviços:"
            echo "  🌐 PublicWebsite: http://localhost:3000"
            echo "  🔧 API: http://localhost:8080"
            echo "  📊 Logs: ./server.sh logs"
        else
            log_error "Falha ao iniciar serviços!"
            exit 1
        fi
        ;;
        
    "stop")
        log_info "Parando serviços do Batuara.net..."
        docker-compose down
        
        if [ $? -eq 0 ]; then
            log_success "Serviços parados!"
        else
            log_error "Falha ao parar serviços!"
            exit 1
        fi
        ;;
        
    "restart")
        log_info "Reiniciando serviços do Batuara.net..."
        docker-compose down
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            log_success "Serviços reiniciados!"
            echo ""
            log_info "Aguardando inicialização (10 segundos)..."
            sleep 10
            show_status
        else
            log_error "Falha ao reiniciar serviços!"
            exit 1
        fi
        ;;
        
    "status")
        show_status
        ;;
        
    "logs")
        show_logs "$@"
        ;;
        
    "build")
        log_info "Reconstruindo containers..."
        docker-compose build --no-cache
        
        if [ $? -eq 0 ]; then
            log_success "Build concluído!"
            log_info "Para iniciar os serviços: ./server.sh start"
        else
            log_error "Falha no build!"
            exit 1
        fi
        ;;
        
    "clean")
        log_info "Limpando containers e imagens..."
        docker-compose down
        docker system prune -f
        log_success "Limpeza concluída!"
        ;;
        
    "help"|"-h"|"--help")
        echo "Uso: ./server.sh [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start    - Iniciar serviços (padrão)"
        echo "  stop     - Parar serviços"
        echo "  restart  - Reiniciar serviços"
        echo "  status   - Mostrar status dos serviços"
        echo "  logs     - Mostrar logs (logs [serviço] para serviço específico)"
        echo "  build    - Reconstruir containers"
        echo "  clean    - Limpar containers e cache"
        echo "  help     - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  ./server.sh start"
        echo "  ./server.sh logs publicwebsite"
        echo "  ./server.sh status"
        ;;
        
    *)
        log_error "Comando inválido: $1"
        echo "Use './server.sh help' para ver comandos disponíveis"
        exit 1
        ;;
esac