#!/bin/bash

# Script de Limpeza de Cache para Oracle - Batuara.net
# Remove caches Docker, Node.js e outros arquivos temporários

echo "=== LIMPEZA DE CACHE - ORACLE BATUARA.NET ==="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo "Usuário: $(whoami)"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configurações
ORACLE_DIR="/var/www/batuara_net/Batuara.net"

# Verificar se estamos no diretório correto
if [ ! -d "$ORACLE_DIR" ]; then
    log_error "Diretório $ORACLE_DIR não encontrado"
    exit 1
fi

cd "$ORACLE_DIR" || {
    log_error "Não foi possível acessar $ORACLE_DIR"
    exit 1
}

log_info "Diretório atual: $(pwd)"
echo ""

echo "=== 1. PARANDO CONTAINERS ==="
log_info "Parando containers Docker..."
docker-compose down 2>/dev/null || log_warning "Nenhum container estava rodando"
log_success "Containers parados"

echo ""
echo "=== 2. LIMPEZA DE CACHE DOCKER ==="

log_info "Removendo containers parados..."
docker container prune -f

log_info "Removendo imagens não utilizadas..."
docker image prune -f

log_info "Removendo volumes órfãos..."
docker volume prune -f

log_info "Removendo redes não utilizadas..."
docker network prune -f

log_info "Limpeza agressiva do sistema Docker..."
docker system prune -f

log_success "Cache Docker limpo"

echo ""
echo "=== 3. LIMPEZA DE CACHE NODE.JS ==="

# Limpar cache do npm/yarn se existir
if command -v npm &> /dev/null; then
    log_info "Limpando cache do npm..."
    npm cache clean --force 2>/dev/null || log_warning "Falha ao limpar cache npm"
fi

if command -v yarn &> /dev/null; then
    log_info "Limpando cache do yarn..."
    yarn cache clean 2>/dev/null || log_warning "Falha ao limpar cache yarn"
fi

# Remover node_modules se existir
if [ -d "src/Frontend/PublicWebsite/node_modules" ]; then
    log_info "Removendo node_modules..."
    rm -rf src/Frontend/PublicWebsite/node_modules
    log_success "node_modules removido"
fi

if [ -d "src/Frontend/AdminDashboard/node_modules" ]; then
    log_info "Removendo node_modules do AdminDashboard..."
    rm -rf src/Frontend/AdminDashboard/node_modules
    log_success "node_modules AdminDashboard removido"
fi

echo ""
echo "=== 4. LIMPEZA DE ARQUIVOS TEMPORÁRIOS ==="

# Remover arquivos de build antigos
BUILD_DIRS=(
    "src/Frontend/PublicWebsite/dist"
    "src/Frontend/PublicWebsite/build"
    "src/Frontend/AdminDashboard/dist"
    "src/Frontend/AdminDashboard/build"
)

for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_info "Removendo diretório de build: $dir"
        rm -rf "$dir"
        log_success "Removido: $dir"
    fi
done

# Remover arquivos temporários
TEMP_FILES=(
    "*.log"
    "*.tmp"
    ".DS_Store"
    "Thumbs.db"
    "*.swp"
    "*.swo"
)

for pattern in "${TEMP_FILES[@]}"; do
    find . -name "$pattern" -type f -delete 2>/dev/null
done

log_success "Arquivos temporários removidos"

echo ""
echo "=== 5. LIMPEZA DE CACHE DO SISTEMA ==="

# Limpar cache do sistema se possível
if command -v sync &> /dev/null; then
    log_info "Sincronizando sistema de arquivos..."
    sync
fi

# Limpar cache de memória (se tiver permissão)
if [ -w /proc/sys/vm/drop_caches ]; then
    log_info "Limpando cache de memória..."
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || log_warning "Não foi possível limpar cache de memória"
fi

echo ""
echo "=== 6. VERIFICAÇÃO FINAL ==="

log_info "Verificando espaço em disco..."
df -h . | tail -1

log_info "Verificando arquivos essenciais..."
ESSENTIAL_FILES=(
    "docker-compose.yml"
    "Dockerfile.frontend"
    ".env"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_warning "✗ $file (FALTANDO)"
    fi
done

echo ""
echo "=== RESUMO DA LIMPEZA ==="
log_success "Cache limpo com sucesso!"
echo ""
log_info "Itens limpos:"
echo "✓ Containers Docker parados"
echo "✓ Imagens Docker não utilizadas"
echo "✓ Volumes Docker órfãos"
echo "✓ Cache npm/yarn"
echo "✓ Diretórios node_modules"
echo "✓ Arquivos de build antigos"
echo "✓ Arquivos temporários"
echo "✓ Cache do sistema"
echo ""
log_info "Próximos passos sugeridos:"
echo "1. ./oracle-deploy-ready.sh  # Para deploy completo"
echo "2. docker-compose up -d      # Para iniciar containers"
echo "3. ./diagnose-assets-oracle.sh # Para diagnóstico"
echo ""
echo "=== LIMPEZA DE CACHE CONCLUÍDA ==="