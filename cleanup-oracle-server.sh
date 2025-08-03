#!/bin/bash

# Script de Limpeza e Organização do Servidor Oracle
# Remove duplicações e mantém apenas arquivos necessários

echo "=== LIMPEZA E ORGANIZAÇÃO DO SERVIDOR ORACLE ==="
echo "Data: $(date)"
echo ""

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

# Verificar se estamos na pasta correta
EXPECTED_DIR="/var/www/batuara_net"
if [ "$(pwd)" != "$EXPECTED_DIR" ]; then
    log_warning "Navegando para $EXPECTED_DIR"
    cd "$EXPECTED_DIR" || {
        log_error "Não foi possível acessar $EXPECTED_DIR"
        exit 1
    }
fi

log_info "Pasta atual: $(pwd)"
echo ""

# Confirmação de segurança
read -p "⚠️  ATENÇÃO: Este script irá REMOVER arquivos duplicados e desnecessários. Continuar? (digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    log_warning "Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "=== 1. CRIANDO BACKUP DE SEGURANÇA ==="

BACKUP_DIR="/var/www/backups/cleanup_backup_$(date +%Y%m%d_%H%M%S)"
log_info "Criando backup em: $BACKUP_DIR"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r . "$BACKUP_DIR/"
log_success "Backup criado com sucesso"

echo ""
echo "=== 2. REMOVENDO ARQUIVOS DUPLICADOS DA PASTA RAIZ ==="

# Lista de arquivos que devem existir APENAS dentro de Batuara.net/
DUPLICATED_FILES=(
    "Batuara.sln"
    "Dockerfile.frontend"
    "FASE0-COMPLETA.md"
    "GUIA_DESENVOLVIMENTO.md"
    "ORACLE_DEPLOY_README.md"
    "README.md"
    "STATUS-PROJETO.md"
    "clear-cache-oracle.sh"
    "diagnose-assets-oracle.sh"
    "docker-compose.oracle.yml"
    "docker-compose.production.yml"
    "docker-compose.yml"
    "install-batuara-vps.sh"
    "monitor-assets.sh"
    "oracle-cleanup.sh"
    "oracle-deploy-ready.sh"
    "oracle-quick-fix.sh"
    "setup-database.sh"
    "update-production.sh"
)

log_info "Removendo arquivos duplicados da pasta raiz..."
for file in "${DUPLICATED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_warning "Removendo: $file (duplicado)"
        rm -f "$file"
    fi
done

echo ""
echo "=== 3. REMOVENDO ARQUIVOS BACKUP DESNECESSÁRIOS ==="

# Lista de arquivos backup que podem ser removidos
BACKUP_FILES=(
    "batuara-deploy-fixer.sh.backup"
    "deploy-config-generator.sh.backup"
    "docker-compose-fixed.yml.backup"
    "docker-compose.yml.backup"
    "deploy-fix.log"
    "validate_infra.sh"
    "backup_db.sh"
)

log_info "Removendo arquivos backup desnecessários..."
for file in "${BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_warning "Removendo backup: $file"
        rm -f "$file"
    fi
done

echo ""
echo "=== 4. LIMPANDO PASTA Batuara.net/ ==="

cd Batuara.net/

# Arquivos backup dentro da pasta do projeto
PROJECT_BACKUP_FILES=(
    "Dockerfile.frontend.backup"
    "Dockerfile.simple"
    "docker-compose-frontend-only.yml"
    "docker-compose.yml.backup"
)

log_info "Removendo backups da pasta do projeto..."
for file in "${PROJECT_BACKUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_warning "Removendo: $file"
        rm -f "$file"
    fi
done

echo ""
echo "=== 5. ORGANIZANDO ESTRUTURA FINAL ==="

# Verificar arquivos essenciais
ESSENTIAL_FILES=(
    "docker-compose.oracle.yml"
    "deploy-oracle-fase0.sh"
    "src/Frontend/PublicWebsite/package.json"
    "src/Frontend/AdminDashboard/package.json"
    "README.md"
    "STATUS-PROJETO.md"
)

log_info "Verificando arquivos essenciais..."
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_error "✗ $file (FALTANDO)"
    fi
done

# Tornar scripts executáveis
log_info "Tornando scripts executáveis..."
chmod +x *.sh 2>/dev/null || log_warning "Alguns scripts podem não ter sido encontrados"

echo ""
echo "=== 6. ESTRUTURA FINAL RECOMENDADA ==="

log_info "Estrutura organizada:"
echo ""
echo "📁 /var/www/batuara_net/"
echo "└── 📁 Batuara.net/                    # ← PASTA PRINCIPAL DO PROJETO"
echo "    ├── 📄 README.md                   # Documentação principal"
echo "    ├── 📄 STATUS-PROJETO.md           # Status atual"
echo "    ├── 📄 FASE0-COMPLETA.md           # Documentação da Fase 0"
echo "    ├── 🐳 docker-compose.oracle.yml   # Configuração para Oracle"
echo "    ├── 🚀 deploy-oracle-fase0.sh      # Script de deploy"
echo "    ├── 🔧 diagnose-assets-oracle.sh   # Diagnóstico"
echo "    ├── 🧹 clear-cache-oracle.sh       # Limpeza de cache"
echo "    ├── 📁 src/                        # Código fonte"
echo "    │   └── 📁 Frontend/"
echo "    │       ├── 📁 PublicWebsite/      # Site público"
echo "    │       └── 📁 AdminDashboard/     # Dashboard admin"
echo "    ├── 📁 docs/                       # Documentação"
echo "    ├── 📁 scripts/                    # Scripts auxiliares"
echo "    └── 📁 tests/                      # Testes"
echo ""

echo ""
echo "=== 7. COMANDOS PARA USO DIÁRIO ==="

log_info "Comandos principais (sempre executar em /var/www/batuara_net/Batuara.net):"
echo ""
echo "# Navegar para pasta do projeto:"
echo "cd /var/www/batuara_net/Batuara.net"
echo ""
echo "# Atualizar código do GitHub:"
echo "git pull origin master"
echo ""
echo "# Deploy da Fase 0:"
echo "./deploy-oracle-fase0.sh"
echo ""
echo "# Diagnóstico de problemas:"
echo "./diagnose-assets-oracle.sh"
echo ""
echo "# Limpar cache:"
echo "./clear-cache-oracle.sh"
echo ""
echo "# Ver status dos containers:"
echo "docker-compose -f docker-compose.oracle.yml ps"
echo ""

echo ""
echo "=== RESUMO DA LIMPEZA ==="

cd /var/www/batuara_net

log_success "Limpeza concluída!"
echo ""
log_info "O que foi feito:"
echo "✓ Backup de segurança criado em: $BACKUP_DIR"
echo "✓ Arquivos duplicados removidos da pasta raiz"
echo "✓ Arquivos backup desnecessários removidos"
echo "✓ Estrutura organizada e limpa"
echo "✓ Scripts tornados executáveis"
echo ""
log_info "Estrutura atual:"
echo "📁 /var/www/batuara_net/ (pasta raiz - apenas Batuara.net/)"
echo "└── 📁 Batuara.net/ (projeto principal - todos os arquivos aqui)"
echo ""
log_warning "IMPORTANTE:"
echo "• Sempre trabalhar dentro de /var/www/batuara_net/Batuara.net/"
echo "• Todos os comandos git e docker devem ser executados nesta pasta"
echo "• Backup disponível em: $BACKUP_DIR"
echo ""
log_info "Para rollback (se necessário):"
echo "sudo rm -rf /var/www/batuara_net/*"
echo "sudo cp -r $BACKUP_DIR/* /var/www/batuara_net/"
echo ""

echo "=== LIMPEZA CONCLUÍDA ==="