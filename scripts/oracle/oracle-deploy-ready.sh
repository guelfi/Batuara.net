#!/bin/bash

# Script de Deploy Pronto para Oracle - Sem necessidade de edição
# Configurado para /var/www/batuara_net com repositório guelfi/Batuara.net

echo "=== DEPLOY AUTOMÁTICO PARA ORACLE - BATUARA.NET ==="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo "Usuário: $(whoami)"
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

# Configurações fixas para Oracle
REPO_URL="https://github.com/guelfi/Batuara.net.git"
BRANCH="master"
ORACLE_DIR="/var/www/batuara_net"
PROJECT_DIR="Batuara.net"
BACKUP_DIR="/var/www/backups/batuara_backup_$(date +%Y%m%d_%H%M%S)"

echo "=== CONFIGURAÇÕES ==="
log_info "Repositório: $REPO_URL"
log_info "Branch: $BRANCH"
log_info "Diretório Oracle: $ORACLE_DIR"
log_info "Diretório do Projeto: $PROJECT_DIR"
log_info "Backup será salvo em: $BACKUP_DIR"
echo ""

# Verificar se estamos no diretório correto
if [ "$(pwd)" != "$ORACLE_DIR" ]; then
    log_warning "Não estamos em $ORACLE_DIR, navegando..."
    cd "$ORACLE_DIR" || {
        log_error "Não foi possível acessar $ORACLE_DIR"
        exit 1
    }
fi

log_success "Diretório atual: $(pwd)"
echo ""

# Confirmação de segurança
read -p "⚠️  ATENÇÃO: Este script irá REMOVER o projeto atual e clonar do GitHub. Continuar? (digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    log_warning "Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "=== 1. PARANDO CONTAINERS E FAZENDO BACKUP ==="

# Parar containers se existirem
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    if [ -f "docker-compose.yml" ]; then
        log_info "Parando containers..."
        docker-compose down --remove-orphans
        log_success "Containers parados"
    fi
    cd "$ORACLE_DIR"
    
    # Fazer backup
    log_info "Criando backup do projeto atual..."
    sudo mkdir -p "$(dirname "$BACKUP_DIR")"
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR"
    log_success "Backup criado: $BACKUP_DIR"
    
    # Remover projeto atual
    log_info "Removendo projeto atual..."
    rm -rf "$PROJECT_DIR"
    log_success "Projeto removido"
else
    log_info "Projeto não existe, pulando backup"
fi

echo ""
echo "=== 2. LIMPEZA DO DOCKER ==="

log_info "Parando todos os containers Batuara..."
docker ps --format "{{.Names}}" | grep -i batuara | xargs -r docker stop
docker ps -a --format "{{.Names}}" | grep -i batuara | xargs -r docker rm -f

log_info "Removendo imagens do Batuara..."
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -i batuara | awk '{print $2}' | xargs -r docker rmi -f

log_info "Limpeza geral do Docker..."
docker system prune -f
log_success "Limpeza do Docker concluída"

echo ""
echo "=== 3. CLONANDO REPOSITÓRIO ATUALIZADO ==="

log_info "Clonando repositório do GitHub..."
if git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"; then
    log_success "Repositório clonado com sucesso"
else
    log_error "Falha ao clonar repositório"
    log_info "Tentando restaurar backup..."
    if [ -d "$BACKUP_DIR" ]; then
        cp -r "$BACKUP_DIR" "$PROJECT_DIR"
        log_warning "Backup restaurado"
    fi
    exit 1
fi

cd "$PROJECT_DIR"

# Verificar informações do repositório
log_info "Informações do repositório:"
echo "Branch atual: $(git branch --show-current)"
echo "Último commit: $(git log -1 --oneline)"
echo "Remote origin: $(git remote get-url origin)"

echo ""
echo "=== 4. VERIFICANDO ARQUIVOS ESSENCIAIS ==="

ESSENTIAL_FILES=(
    "docker-compose.yml"
    "Dockerfile.frontend"
    "src/Frontend/PublicWebsite/public/favicon.ico"
    "src/Frontend/PublicWebsite/public/batuara_logo.png"
    "src/Frontend/PublicWebsite/public/bg.jpg"
    "diagnose-assets-oracle.sh"
    "clear-cache-oracle.sh"
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
echo "=== 5. BUILD E INICIALIZAÇÃO ==="

log_info "Construindo containers (pode demorar alguns minutos)..."
if docker-compose build --no-cache; then
    log_success "Build concluído"
else
    log_error "Falha no build"
    exit 1
fi

log_info "Iniciando serviços..."
if docker-compose up -d; then
    log_success "Serviços iniciados"
else
    log_error "Falha ao iniciar serviços"
    exit 1
fi

# Aguardar inicialização
log_info "Aguardando inicialização dos containers (30 segundos)..."
sleep 30

echo ""
echo "=== 6. VERIFICAÇÃO FINAL ==="

log_info "Status dos containers:"
docker-compose ps

# Verificar se o PublicWebsite está rodando
CONTAINER_NAME=$(docker-compose ps -q publicwebsite 2>/dev/null || docker-compose ps -q public-website 2>/dev/null)

if [ -n "$CONTAINER_NAME" ]; then
    log_success "Container do PublicWebsite está rodando"
    
    # Verificar assets no container
    log_info "Assets no container:"
    docker exec "$CONTAINER_NAME" ls -la /usr/share/nginx/html/ | grep -E "(favicon|logo|bg\.jpg)" || log_warning "Assets não encontrados no container"
    
    # Testar acesso
    PORT=$(docker port "$CONTAINER_NAME" 80 2>/dev/null | cut -d: -f2)
    if [ -n "$PORT" ]; then
        log_info "Serviço disponível em: http://localhost:$PORT"
        
        # Teste rápido de conectividade
        if command -v curl &> /dev/null; then
            log_info "Testando assets..."
            for asset in "favicon.ico" "batuara_logo.png" "bg.jpg"; do
                response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/$asset" 2>/dev/null)
                if [ "$response" = "200" ]; then
                    log_success "$asset - OK ($response)"
                else
                    log_warning "$asset - Status: $response"
                fi
            done
        fi
    fi
else
    log_error "Container do PublicWebsite não está rodando"
fi

echo ""
echo "=== 7. EXECUTANDO DIAGNÓSTICO AUTOMÁTICO ==="

if [ -f "diagnose-assets-oracle.sh" ]; then
    log_info "Executando diagnóstico completo..."
    ./diagnose-assets-oracle.sh
else
    log_warning "Script de diagnóstico não encontrado"
fi

echo ""
echo "=== RESUMO FINAL ==="
log_success "Deploy automático concluído!"
echo ""
log_info "O que foi feito:"
echo "✓ Backup do projeto anterior criado"
echo "✓ Containers antigos removidos"
echo "✓ Docker limpo"
echo "✓ Repositório atualizado clonado do GitHub"
echo "✓ Containers reconstruídos com --no-cache"
echo "✓ Serviços iniciados"
echo "✓ Diagnóstico executado"
echo ""
log_info "Próximos passos:"
echo "1. Testar o site no navegador (IP público da Oracle)"
echo "2. Verificar se favicon aparece na aba"
echo "3. Verificar se logo aparece no header"
echo "4. Executar diagnóstico manual: ./diagnose-assets-oracle.sh"
echo ""
log_info "Para monitorar:"
echo "docker-compose ps              # Status dos containers"
echo "docker-compose logs -f         # Logs em tempo real"
echo "./clear-cache-oracle.sh        # Limpar cache se necessário"
echo ""
log_info "Backup disponível em: $BACKUP_DIR"
echo ""
log_info "Para rollback (se necessário):"
echo "docker-compose down"
echo "rm -rf $PROJECT_DIR"
echo "cp -r $BACKUP_DIR $PROJECT_DIR"
echo "cd $PROJECT_DIR && docker-compose up -d"

echo ""
echo "=== DEPLOY CONCLUÍDO ==="