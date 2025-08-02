#!/bin/bash

# Script de Limpeza para Oracle - Remove arquivos desnecessários
# Configurado para /var/www/batuara_net

echo "=== LIMPEZA DE ARQUIVOS DESNECESSÁRIOS - ORACLE ==="
echo "Data: $(date)"
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
ORACLE_DIR="/var/www/batuara_net"

# Ir para diretório correto
cd "$ORACLE_DIR" || {
    log_error "Não foi possível acessar $ORACLE_DIR"
    exit 1
}

log_info "Diretório atual: $(pwd)"
echo ""

# Confirmação
read -p "⚠️  ATENÇÃO: Este script irá REMOVER arquivos desnecessários. Continuar? (digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    log_warning "Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "=== REMOVENDO SCRIPTS ANTIGOS ==="

# Lista de scripts antigos para remover
OLD_SCRIPTS=(
    "batuara-deploy-fixer.sh"
    "batuara-deploy-fixer.sh.backup"
    "deploy-assets-fix.sh"
    "deploy-config-generator.sh"
    "deploy-config-generator.sh.backup"
    "deploy.sh"
    "fix-deploy.sh"
    "fix-docker-compose-now.sh"
    "fix-favicon-complete.sh"
    "fix-logo-assets.sh"
    "force-rebuild.sh"
    "debug-build.sh"
    "test-assets-build.sh"
    "test-setup-local.sh"
    "update-server.sh"
    "diagnose-assets.sh"
)

for script in "${OLD_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        rm -f "$script"
        log_success "Removido: $script"
    fi
done

echo ""
echo "=== REMOVENDO DOCUMENTOS TEMPORÁRIOS ==="

# Lista de documentos temporários
OLD_DOCS=(
    "CONTEXT_SUMMARY.md"
    "CORREÇÃO_DEPLOY.md"
    "DEPLOY_GUIDE.md"
    "DOCKER_FIX.md"
    "ESTRATÉGIAS_DEPLOY.md"
    "OTIMIZACOES_INTERFACE.md"
    "PROJECT_ANALYSIS.md"
    "Analise Batuara.net.html"
    "analise_batuara.html"
    "deploy-batuara-fixed.html"
    "deploy-batuara.html"
    "deploy-infra-compartilhada.html"
)

for doc in "${OLD_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        rm -f "$doc"
        log_success "Removido: $doc"
    fi
done

echo ""
echo "=== REMOVENDO ARQUIVOS DE BACKUP E LOGS ==="

# Remover backups e logs antigos
OLD_FILES=(
    "docker-compose-fixed.yml.backup"
    "docker-compose.yml.backup"
    "deploy-fix.log"
    "*.log"
    "*.backup"
)

for pattern in "${OLD_FILES[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ] && [ "$file" != "*.log" ] && [ "$file" != "*.backup" ]; then
            rm -f "$file"
            log_success "Removido: $file"
        fi
    done
done

echo ""
echo "=== ORGANIZANDO ARQUIVOS RESTANTES ==="

# Renomear docker-compose-fixed.yml se existir
if [ -f "docker-compose-fixed.yml" ] && [ ! -f "docker-compose.yml" ]; then
    mv docker-compose-fixed.yml docker-compose.yml
    log_success "Renomeado: docker-compose-fixed.yml → docker-compose.yml"
fi

# Tornar scripts executáveis
log_info "Tornando scripts executáveis..."
chmod +x *.sh 2>/dev/null
log_success "Permissões de execução aplicadas aos scripts"

echo ""
echo "=== VERIFICANDO ARQUIVOS ESSENCIAIS ==="

# Lista de arquivos essenciais que devem existir
ESSENTIAL_FILES=(
    "docker-compose.yml"
    "Dockerfile.frontend"
    "README.md"
    "setup-database.sh"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_warning "✗ $file (FALTANDO - será criado no próximo deploy)"
    fi
done

echo ""
echo "=== LIMPEZA DE DOCKER ==="

log_info "Removendo containers parados..."
docker container prune -f

log_info "Removendo imagens não utilizadas..."
docker image prune -f

log_info "Removendo volumes órfãos..."
docker volume prune -f

log_success "Limpeza do Docker concluída"

echo ""
echo "=== RESUMO DA LIMPEZA ==="

log_success "Limpeza concluída!"
echo ""
log_info "Arquivos removidos:"
echo "✓ Scripts antigos e duplicados"
echo "✓ Documentos temporários"
echo "✓ Arquivos de backup antigos"
echo "✓ Logs antigos"
echo "✓ Containers e imagens Docker não utilizados"
echo ""
log_info "Próximos passos:"
echo "1. Execute: ./oracle-deploy-ready.sh (para deploy completo)"
echo "2. Ou: git pull (para atualizar arquivos do GitHub)"
echo ""
log_info "Estrutura atual:"
ls -la | grep -E "\.(sh|yml|md)$" | head -10

echo ""
echo "=== LIMPEZA CONCLUÍDA ==="