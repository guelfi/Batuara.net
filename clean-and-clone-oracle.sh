#!/bin/bash

# Script para Limpeza Completa e Clonagem do Repositório Original - Oracle
# Remove tudo e clona repositório limpo do GitHub

echo "=== LIMPEZA COMPLETA E CLONAGEM - SERVIDOR ORACLE ==="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
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

# Configurações - AJUSTE ESTAS VARIÁVEIS
REPO_URL="https://github.com/seu-usuario/Batuara.net.git"  # SUBSTITUA pela URL correta
BRANCH="main"  # ou "master" dependendo do seu repositório
PROJECT_DIR="Batuara.net"

echo "=== CONFIGURAÇÕES ==="
log_info "Repositório: $REPO_URL"
log_info "Branch: $BRANCH"
log_info "Diretório: $PROJECT_DIR"
echo ""

# Confirmação de segurança
read -p "⚠️  ATENÇÃO: Este script irá REMOVER COMPLETAMENTE o projeto atual. Continuar? (digite 'SIM' para confirmar): " confirm
if [ "$confirm" != "SIM" ]; then
    log_warning "Operação cancelada pelo usuário"
    exit 0
fi

echo ""
echo "=== 1. PARANDO TODOS OS CONTAINERS ==="

# Parar containers do projeto atual
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    if [ -f "docker-compose.yml" ]; then
        log_info "Parando containers do projeto..."
        docker-compose down --remove-orphans
        log_success "Containers parados"
    fi
    cd ..
fi

# Parar todos os containers relacionados ao Batuara
log_info "Parando todos os containers Batuara..."
docker ps --format "{{.Names}}" | grep -i batuara | xargs -r docker stop
docker ps -a --format "{{.Names}}" | grep -i batuara | xargs -r docker rm -f
log_success "Containers Batuara removidos"

echo ""
echo "=== 2. LIMPEZA COMPLETA DO DOCKER ==="

log_info "Removendo imagens do Batuara..."
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep -i batuara | awk '{print $2}' | xargs -r docker rmi -f

log_info "Removendo volumes órfãos..."
docker volume prune -f

log_info "Limpeza geral do sistema Docker..."
docker system prune -a -f --volumes

log_success "Limpeza do Docker concluída"

echo ""
echo "=== 3. REMOVENDO PROJETO ATUAL ==="

if [ -d "$PROJECT_DIR" ]; then
    log_info "Removendo diretório do projeto: $PROJECT_DIR"
    rm -rf "$PROJECT_DIR"
    log_success "Projeto removido"
else
    log_info "Diretório do projeto não existe"
fi

echo ""
echo "=== 4. CLONANDO REPOSITÓRIO ORIGINAL ==="

log_info "Clonando repositório do GitHub..."
if git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"; then
    log_success "Repositório clonado com sucesso"
else
    log_error "Falha ao clonar repositório"
    log_info "Verifique se:"
    echo "  - A URL do repositório está correta: $REPO_URL"
    echo "  - A branch existe: $BRANCH"
    echo "  - Você tem acesso ao repositório"
    echo "  - A conexão com internet está funcionando"
    exit 1
fi

cd "$PROJECT_DIR"

# Verificar informações do repositório
log_info "Informações do repositório clonado:"
echo "Branch atual: $(git branch --show-current)"
echo "Último commit: $(git log -1 --oneline)"
echo "Remote origin: $(git remote get-url origin)"

echo ""
echo "=== 5. VERIFICANDO ESTRUTURA DO PROJETO ==="

# Verificar arquivos essenciais
ESSENTIAL_FILES=(
    "docker-compose.yml"
    "Dockerfile.frontend"
    "src/Frontend/PublicWebsite/public/favicon.ico"
    "src/Frontend/PublicWebsite/public/batuara_logo.png"
    "src/Frontend/PublicWebsite/public/bg.jpg"
)

log_info "Verificando arquivos essenciais..."
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file"
    else
        log_error "✗ $file (FALTANDO)"
    fi
done

# Listar conteúdo da pasta public
log_info "Conteúdo da pasta public:"
if [ -d "src/Frontend/PublicWebsite/public" ]; then
    ls -la src/Frontend/PublicWebsite/public/
else
    log_error "Pasta public não encontrada!"
fi

echo ""
echo "=== 6. BUILD E INICIALIZAÇÃO ==="

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
echo "=== 7. VERIFICAÇÃO FINAL ==="

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
            if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" | grep -q "200"; then
                log_success "Serviço respondendo corretamente"
            else
                log_warning "Serviço não está respondendo na porta $PORT"
            fi
        fi
    fi
else
    log_error "Container do PublicWebsite não está rodando"
fi

echo ""
echo "=== RESUMO ==="
log_success "Limpeza e clonagem concluídas!"
echo ""
log_info "O que foi feito:"
echo "✓ Containers antigos removidos"
echo "✓ Imagens Docker limpas"
echo "✓ Projeto antigo removido"
echo "✓ Repositório original clonado"
echo "✓ Containers reconstruídos"
echo "✓ Serviços iniciados"
echo ""
log_info "Próximos passos:"
echo "1. Testar o site no navegador"
echo "2. Executar diagnóstico: ./diagnose-assets-oracle.sh"
echo "3. Verificar logs: docker-compose logs -f"
echo ""
log_info "Para monitorar:"
echo "docker-compose ps    # Status dos containers"
echo "docker-compose logs  # Logs dos serviços"

echo ""
echo "=== FIM DA OPERAÇÃO ==="