#!/bin/bash

# Script para Limpeza de Cache - Nginx e Docker - Oracle
# Limpa caches que podem estar causando problemas com assets

echo "=== LIMPEZA DE CACHE - NGINX E DOCKER ==="
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

echo "=== 1. LIMPEZA DE CACHE DO NGINX ==="

# Encontrar containers do nginx/PublicWebsite
CONTAINERS=$(docker ps --format "{{.Names}}" | grep -E "(nginx|public|website|batuara)")

if [ -n "$CONTAINERS" ]; then
    log_info "Containers encontrados:"
    echo "$CONTAINERS"
    echo ""
    
    for container in $CONTAINERS; do
        log_info "Limpando cache do nginx no container: $container"
        
        # Limpar cache do nginx (se existir)
        docker exec "$container" sh -c "
            # Limpar cache do nginx se existir
            if [ -d /var/cache/nginx ]; then
                rm -rf /var/cache/nginx/*
                echo 'Cache do nginx limpo'
            fi
            
            # Recarregar configuração do nginx
            if command -v nginx >/dev/null 2>&1; then
                nginx -s reload 2>/dev/null || echo 'Nginx reload não disponível'
            fi
            
            # Verificar se assets estão presentes
            echo 'Assets disponíveis:'
            ls -la /usr/share/nginx/html/ | grep -E '\.(ico|png|jpg)$' || echo 'Nenhum asset encontrado'
        " 2>/dev/null || log_warning "Erro ao executar comandos no container $container"
        
        log_success "Processado: $container"
    done
else
    log_warning "Nenhum container nginx/website encontrado em execução"
fi

echo ""
echo "=== 2. LIMPEZA DE CACHE DO DOCKER ==="

log_info "Limpando cache de build do Docker..."
docker builder prune -f
log_success "Cache de build limpo"

log_info "Removendo containers parados..."
docker container prune -f
log_success "Containers parados removidos"

log_info "Removendo imagens não utilizadas..."
docker image prune -f
log_success "Imagens não utilizadas removidas"

log_info "Removendo volumes órfãos..."
docker volume prune -f
log_success "Volumes órfãos removidos"

log_info "Removendo redes não utilizadas..."
docker network prune -f
log_success "Redes não utilizadas removidas"

echo ""
echo "=== 3. LIMPEZA AGRESSIVA (OPCIONAL) ==="

read -p "Deseja fazer limpeza agressiva do Docker? Isso removerá TODAS as imagens não utilizadas (y/N): " aggressive
if [[ $aggressive =~ ^[Yy]$ ]]; then
    log_warning "Executando limpeza agressiva..."
    docker system prune -a -f --volumes
    log_success "Limpeza agressiva concluída"
else
    log_info "Limpeza agressiva pulada"
fi

echo ""
echo "=== 4. REINICIALIZAÇÃO DOS SERVIÇOS ==="

# Se estivermos no diretório do projeto, reiniciar serviços
if [ -f "docker-compose.yml" ]; then
    log_info "Reiniciando serviços do docker-compose..."
    
    docker-compose restart
    log_success "Serviços reiniciados"
    
    # Aguardar inicialização
    log_info "Aguardando inicialização (15 segundos)..."
    sleep 15
    
    log_info "Status dos serviços:"
    docker-compose ps
    
elif [ -d "Batuara.net" ]; then
    cd Batuara.net
    if [ -f "docker-compose.yml" ]; then
        log_info "Reiniciando serviços do projeto Batuara.net..."
        
        docker-compose restart
        log_success "Serviços reiniciados"
        
        # Aguardar inicialização
        log_info "Aguardando inicialização (15 segundos)..."
        sleep 15
        
        log_info "Status dos serviços:"
        docker-compose ps
    fi
    cd ..
else
    log_warning "docker-compose.yml não encontrado, pulando reinicialização automática"
fi

echo ""
echo "=== 5. VERIFICAÇÃO PÓS-LIMPEZA ==="

# Verificar containers em execução
log_info "Containers em execução:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Testar acesso aos assets se possível
WEBSITE_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "(public|website)" | head -1)

if [ -n "$WEBSITE_CONTAINER" ]; then
    log_info "Testando assets no container: $WEBSITE_CONTAINER"
    
    # Verificar assets no container
    docker exec "$WEBSITE_CONTAINER" ls -la /usr/share/nginx/html/ | grep -E "(favicon|logo|bg\.jpg)" || log_warning "Assets não encontrados"
    
    # Testar acesso HTTP
    PORT=$(docker port "$WEBSITE_CONTAINER" 80 2>/dev/null | cut -d: -f2)
    if [ -n "$PORT" ] && command -v curl &> /dev/null; then
        log_info "Testando acesso HTTP na porta $PORT..."
        
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

echo ""
echo "=== 6. INFORMAÇÕES DO SISTEMA ==="

log_info "Uso de disco do Docker:"
docker system df

echo ""
log_info "Espaço em disco disponível:"
df -h / | tail -1

echo ""
echo "=== RESUMO ==="
log_success "Limpeza de cache concluída!"
echo ""
log_info "O que foi limpo:"
echo "✓ Cache do nginx nos containers"
echo "✓ Cache de build do Docker"
echo "✓ Containers parados"
echo "✓ Imagens não utilizadas"
echo "✓ Volumes órfãos"
echo "✓ Redes não utilizadas"
if [[ $aggressive =~ ^[Yy]$ ]]; then
    echo "✓ Limpeza agressiva do sistema Docker"
fi
echo ""
log_info "Próximos passos:"
echo "1. Testar o site no navegador"
echo "2. Verificar se assets carregam corretamente"
echo "3. Executar diagnóstico completo: ./diagnose-assets-oracle.sh"
echo ""
log_info "Se problemas persistirem:"
echo "1. Execute: ./clean-and-clone-oracle.sh (limpeza completa)"
echo "2. Ou: ./deploy-oracle-assets-fix.sh (deploy com backup)"

echo ""
echo "=== FIM DA LIMPEZA ==="