#!/bin/bash

# Script de Deploy para Correção de Assets - Servidor Oracle
# Limpa ambiente, clona repositório atualizado e reconstrói containers

echo "=== DEPLOY DE CORREÇÃO DE ASSETS - SERVIDOR ORACLE ==="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
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

# Função para verificar se comando foi executado com sucesso
check_command() {
    if [ $? -eq 0 ]; then
        log_success "$1"
    else
        log_error "$1 - FALHOU"
        exit 1
    fi
}

# Configurações
REPO_URL="https://github.com/seu-usuario/Batuara.net.git"  # Substitua pela URL correta
PROJECT_DIR="Batuara.net"
BACKUP_DIR="Batuara.net.backup.$(date +%Y%m%d_%H%M%S)"

# Verificar se estamos no diretório correto
if [ ! -d "$PROJECT_DIR" ] && [ ! -f "docker-compose.yml" ]; then
    log_error "Diretório do projeto não encontrado. Execute este script no diretório pai do projeto."
    exit 1
fi

echo "=== 1. BACKUP E LIMPEZA DO AMBIENTE ==="

# Parar containers existentes
log_info "Parando containers existentes..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down
    check_command "Containers parados"
elif [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    docker-compose down
    check_command "Containers parados"
    cd ..
fi

# Fazer backup do projeto atual (se existir)
if [ -d "$PROJECT_DIR" ]; then
    log_info "Fazendo backup do projeto atual..."
    mv "$PROJECT_DIR" "$BACKUP_DIR"
    check_command "Backup criado: $BACKUP_DIR"
fi

# Limpar cache do Docker
log_info "Limpando cache do Docker..."
docker system prune -f
check_command "Cache do Docker limpo"

# Remover imagens antigas do projeto (opcional)
log_info "Removendo imagens antigas do Batuara..."
docker images | grep -E "(batuara|publicwebsite)" | awk '{print $3}' | xargs -r docker rmi -f
log_success "Imagens antigas removidas"

echo ""

echo "=== 2. CLONAGEM DO REPOSITÓRIO ATUALIZADO ==="

log_info "Clonando repositório do GitHub..."
git clone "$REPO_URL" "$PROJECT_DIR"
check_command "Repositório clonado"

cd "$PROJECT_DIR"

# Verificar se estamos na branch correta
log_info "Verificando branch atual..."
git branch -a
git status

echo ""

echo "=== 3. VERIFICAÇÃO DOS ARQUIVOS CRÍTICOS ==="

log_info "Verificando se assets estão presentes no repositório..."

# Verificar assets no PublicWebsite
ASSETS_DIR="src/Frontend/PublicWebsite/public"
if [ -d "$ASSETS_DIR" ]; then
    log_success "Diretório de assets encontrado: $ASSETS_DIR"
    
    # Verificar assets críticos
    CRITICAL_ASSETS=("favicon.ico" "favicon.png" "batuara_logo.png" "bg.jpg")
    for asset in "${CRITICAL_ASSETS[@]}"; do
        if [ -f "$ASSETS_DIR/$asset" ]; then
            log_success "Asset encontrado: $asset"
        else
            log_error "Asset FALTANDO: $asset"
        fi
    done
else
    log_error "Diretório de assets não encontrado: $ASSETS_DIR"
    exit 1
fi

# Verificar Dockerfile
if [ -f "Dockerfile.frontend" ]; then
    log_success "Dockerfile.frontend encontrado"
else
    log_error "Dockerfile.frontend não encontrado"
    exit 1
fi

# Verificar docker-compose
if [ -f "docker-compose.yml" ]; then
    log_success "docker-compose.yml encontrado"
else
    log_error "docker-compose.yml não encontrado"
    exit 1
fi

echo ""

echo "=== 4. BUILD DOS CONTAINERS ==="

log_info "Construindo containers com --no-cache..."
docker-compose build --no-cache
check_command "Build dos containers concluído"

echo ""

echo "=== 5. INICIALIZAÇÃO DOS SERVIÇOS ==="

log_info "Iniciando serviços..."
docker-compose up -d
check_command "Serviços iniciados"

# Aguardar containers iniciarem
log_info "Aguardando containers iniciarem (30 segundos)..."
sleep 30

# Verificar status dos containers
log_info "Verificando status dos containers..."
docker-compose ps

echo ""

echo "=== 6. VERIFICAÇÃO DOS ASSETS ==="

# Descobrir nome do container do PublicWebsite
CONTAINER_NAME=$(docker-compose ps -q publicwebsite 2>/dev/null || docker-compose ps -q public-website 2>/dev/null || docker ps --format "{{.Names}}" | grep -E "(public|website)" | head -1)

if [ -n "$CONTAINER_NAME" ]; then
    log_success "Container encontrado: $CONTAINER_NAME"
    
    log_info "Verificando assets no container..."
    docker exec "$CONTAINER_NAME" ls -la /usr/share/nginx/html/ | grep -E "(favicon|logo|bg\.jpg)"
    
    # Testar acesso aos assets
    log_info "Testando acesso aos assets..."
    
    # Descobrir porta
    PORT=$(docker port "$CONTAINER_NAME" 80 2>/dev/null | cut -d: -f2)
    if [ -n "$PORT" ]; then
        BASE_URL="http://localhost:$PORT"
    else
        BASE_URL="http://localhost:3000"
    fi
    
    log_info "Testando via $BASE_URL"
    
    # Testar assets críticos
    ASSETS_TO_TEST=("favicon.ico" "favicon.png" "batuara_logo.png" "bg.jpg")
    for asset in "${ASSETS_TO_TEST[@]}"; do
        if command -v curl &> /dev/null; then
            response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$asset")
            if [ "$response" = "200" ]; then
                log_success "$asset - Status: $response (OK)"
            else
                log_error "$asset - Status: $response (ERRO)"
            fi
        fi
    done
    
else
    log_error "Container do PublicWebsite não encontrado"
fi

echo ""

echo "=== 7. LIMPEZA FINAL ==="

log_info "Removendo containers e imagens não utilizadas..."
docker system prune -f
log_success "Limpeza concluída"

echo ""

echo "=== 8. RESUMO DO DEPLOY ==="

log_info "Deploy concluído com sucesso!"
echo ""
log_info "Próximos passos:"
echo "1. Testar o site via navegador no IP público da Oracle"
echo "2. Verificar se favicon aparece na aba do navegador"
echo "3. Verificar se logo aparece no header do site"
echo "4. Executar diagnóstico completo: ./diagnose-assets-oracle.sh"
echo ""

if [ -n "$CONTAINER_NAME" ] && [ -n "$PORT" ]; then
    log_info "Acesso local: $BASE_URL"
fi

log_info "Logs dos containers:"
echo "docker-compose logs -f"
echo ""

log_info "Para rollback (se necessário):"
echo "docker-compose down"
echo "rm -rf $PROJECT_DIR"
echo "mv $BACKUP_DIR $PROJECT_DIR"
echo "cd $PROJECT_DIR && docker-compose up -d"

echo ""
echo "=== FIM DO DEPLOY ==="