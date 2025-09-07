#!/bin/bash

# Script de Diagnóstico de Assets para Servidor Oracle
# Verifica status dos containers e disponibilidade dos assets estáticos

echo "=== DIAGNÓSTICO DE ASSETS - SERVIDOR ORACLE ==="
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

# 1. Verificar status dos containers
echo "=== 1. STATUS DOS CONTAINERS ==="
log_info "Verificando containers em execução..."

if command -v docker &> /dev/null; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(batuara|public|website)" || log_warning "Nenhum container Batuara encontrado em execução"
    
    echo ""
    log_info "Verificando todos os containers Batuara (incluindo parados)..."
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(batuara|public|website)" || log_warning "Nenhum container Batuara encontrado"
else
    log_error "Docker não está instalado ou não está no PATH"
fi

echo ""

# 2. Verificar estrutura de arquivos no container
echo "=== 2. ESTRUTURA DE ARQUIVOS NO CONTAINER ==="

# Tentar diferentes nomes de container
CONTAINER_NAMES=("batuara-public-website" "batuara-publicwebsite" "publicwebsite" "batuara_public_website")
CONTAINER_FOUND=""

for container_name in "${CONTAINER_NAMES[@]}"; do
    if docker ps -q -f name="$container_name" &> /dev/null; then
        if [ "$(docker ps -q -f name="$container_name")" ]; then
            CONTAINER_FOUND="$container_name"
            break
        fi
    fi
done

if [ -n "$CONTAINER_FOUND" ]; then
    log_success "Container encontrado: $CONTAINER_FOUND"
    
    log_info "Listando arquivos no diretório nginx..."
    docker exec "$CONTAINER_FOUND" ls -la /usr/share/nginx/html/ 2>/dev/null || log_error "Erro ao listar arquivos do container"
    
    echo ""
    log_info "Verificando assets críticos no container..."
    
    # Verificar favicon.ico
    if docker exec "$CONTAINER_FOUND" test -f /usr/share/nginx/html/favicon.ico 2>/dev/null; then
        log_success "favicon.ico encontrado"
        docker exec "$CONTAINER_FOUND" ls -la /usr/share/nginx/html/favicon.ico 2>/dev/null
    else
        log_error "favicon.ico NÃO encontrado"
    fi
    
    # Verificar favicon.png
    if docker exec "$CONTAINER_FOUND" test -f /usr/share/nginx/html/favicon.png 2>/dev/null; then
        log_success "favicon.png encontrado"
        docker exec "$CONTAINER_FOUND" ls -la /usr/share/nginx/html/favicon.png 2>/dev/null
    else
        log_error "favicon.png NÃO encontrado"
    fi
    
    # Verificar batuara_logo.png
    if docker exec "$CONTAINER_FOUND" test -f /usr/share/nginx/html/batuara_logo.png 2>/dev/null; then
        log_success "batuara_logo.png encontrado"
        docker exec "$CONTAINER_FOUND" ls -la /usr/share/nginx/html/batuara_logo.png 2>/dev/null
    else
        log_error "batuara_logo.png NÃO encontrado"
    fi
    
    # Verificar outros assets
    echo ""
    log_info "Verificando outros assets importantes..."
    for asset in "logo192.png" "logo512.png" "bg.jpg" "manifest.json"; do
        if docker exec "$CONTAINER_FOUND" test -f "/usr/share/nginx/html/$asset" 2>/dev/null; then
            log_success "$asset encontrado"
        else
            log_warning "$asset não encontrado"
        fi
    done
    
    # Verificar pasta static
    echo ""
    log_info "Verificando pasta static..."
    if docker exec "$CONTAINER_FOUND" test -d /usr/share/nginx/html/static 2>/dev/null; then
        log_success "Pasta static encontrada"
        docker exec "$CONTAINER_FOUND" ls -la /usr/share/nginx/html/static/ 2>/dev/null | head -10
    else
        log_warning "Pasta static não encontrada"
    fi
    
else
    log_error "Nenhum container do PublicWebsite encontrado em execução"
    log_info "Containers disponíveis:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
fi

echo ""

# 3. Testar acesso direto aos assets
echo "=== 3. TESTE DE ACESSO DIRETO AOS ASSETS ==="

# Descobrir a porta do container
if [ -n "$CONTAINER_FOUND" ]; then
    PORT=$(docker port "$CONTAINER_FOUND" 80 2>/dev/null | cut -d: -f2)
    if [ -n "$PORT" ]; then
        BASE_URL="http://localhost:$PORT"
        log_info "Testando acesso via $BASE_URL"
    else
        BASE_URL="http://localhost:3000"
        log_warning "Porta não encontrada, tentando porta padrão 3000"
    fi
else
    BASE_URL="http://localhost:3000"
    log_warning "Container não encontrado, tentando porta padrão 3000"
fi

# Lista de assets para testar
ASSETS_TO_TEST=(
    "favicon.ico"
    "favicon.png" 
    "batuara_logo.png"
    "logo192.png"
    "logo512.png"
    "bg.jpg"
    "manifest.json"
)

for asset in "${ASSETS_TO_TEST[@]}"; do
    log_info "Testando $BASE_URL/$asset"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$asset" 2>/dev/null)
        if [ "$response" = "200" ]; then
            log_success "$asset - Status: $response (OK)"
        elif [ "$response" = "404" ]; then
            log_error "$asset - Status: $response (NOT FOUND)"
        else
            log_warning "$asset - Status: $response"
        fi
    else
        log_warning "curl não disponível, pulando teste HTTP para $asset"
    fi
done

echo ""

# 4. Verificar logs do nginx
echo "=== 4. ANÁLISE DE LOGS DO NGINX ==="

if [ -n "$CONTAINER_FOUND" ]; then
    log_info "Verificando logs recentes do container..."
    
    echo ""
    log_info "Últimas 20 linhas do log:"
    docker logs --tail 20 "$CONTAINER_FOUND" 2>/dev/null || log_error "Erro ao acessar logs do container"
    
    echo ""
    log_info "Procurando por erros 404 nos logs..."
    docker logs "$CONTAINER_FOUND" 2>/dev/null | grep -E "(404|Not Found)" | tail -10 || log_info "Nenhum erro 404 encontrado nos logs recentes"
    
    echo ""
    log_info "Procurando por erros relacionados a assets..."
    docker logs "$CONTAINER_FOUND" 2>/dev/null | grep -E "(favicon|logo|\.png|\.ico|\.jpg)" | tail -10 || log_info "Nenhum log relacionado a assets encontrado"
    
else
    log_error "Container não encontrado, não é possível verificar logs"
fi

echo ""

# 5. Verificar configuração do nginx
echo "=== 5. CONFIGURAÇÃO DO NGINX ==="

if [ -n "$CONTAINER_FOUND" ]; then
    log_info "Verificando configuração do nginx..."
    
    if docker exec "$CONTAINER_FOUND" test -f /etc/nginx/conf.d/default.conf 2>/dev/null; then
        log_success "Arquivo de configuração encontrado"
        echo ""
        log_info "Conteúdo da configuração:"
        docker exec "$CONTAINER_FOUND" cat /etc/nginx/conf.d/default.conf 2>/dev/null || log_error "Erro ao ler configuração"
    else
        log_error "Arquivo de configuração não encontrado"
    fi
else
    log_error "Container não encontrado, não é possível verificar configuração"
fi

echo ""

# 6. Resumo e recomendações
echo "=== 6. RESUMO E RECOMENDAÇÕES ==="

log_info "Diagnóstico concluído!"
echo ""
log_info "Para resolver problemas encontrados:"
echo "1. Se assets estão faltando no container: Rebuild do container"
echo "2. Se container não está rodando: docker-compose up -d"
echo "3. Se há erros 404: Verificar configuração nginx e caminhos dos assets"
echo "4. Se assets existem mas não são acessíveis: Verificar permissões e configuração nginx"
echo ""
log_info "Para rebuild completo:"
echo "docker-compose down && docker-compose build --no-cache && docker-compose up -d"
echo ""
log_info "Para limpar cache do Docker:"
echo "docker system prune -a"

echo ""
echo "=== FIM DO DIAGNÓSTICO ==="