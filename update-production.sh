#!/bin/bash

# Script de Atualização de Produção - Batuara.net
# Automatiza o processo completo de atualização do servidor Oracle

echo "=== ATUALIZAÇÃO DE PRODUÇÃO - BATUARA.NET ==="
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

# Função para verificar se comando foi executado com sucesso
check_command() {
    if [ $? -eq 0 ]; then
        log_success "$1"
        return 0
    else
        log_error "$1 - FALHOU"
        return 1
    fi
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.production.yml" ]; then
    log_error "docker-compose.production.yml não encontrado"
    log_error "Execute este script no diretório raiz do projeto Batuara.net"
    exit 1
fi

log_info "Diretório do projeto verificado ✓"

# Verificar se Git está limpo
if ! git diff-index --quiet HEAD --; then
    log_warning "Há mudanças não commitadas no repositório local"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Atualização cancelada pelo usuário"
        exit 0
    fi
fi

echo ""
echo "=== 1. BACKUP DAS IMAGENS ATUAIS ==="

BACKUP_TAG="backup-$(date +%Y%m%d_%H%M%S)"
log_info "Criando backup com tag: $BACKUP_TAG"

# Fazer backup das imagens atuais
if docker images | grep -q "batuara-publicwebsite"; then
    docker tag batuara-publicwebsite batuara-publicwebsite:$BACKUP_TAG
    check_command "Backup da imagem PublicWebsite criado"
else
    log_warning "Imagem batuara-publicwebsite não encontrada para backup"
fi

if docker images | grep -q "batuara-admindashboard"; then
    docker tag batuara-admindashboard batuara-admindashboard:$BACKUP_TAG
    check_command "Backup da imagem AdminDashboard criado"
else
    log_warning "Imagem batuara-admindashboard não encontrada para backup"
fi

echo ""
echo "=== 2. PARANDO APLICAÇÕES ==="

log_info "Parando containers atuais..."
docker-compose -f docker-compose.production.yml down
check_command "Containers parados"

echo ""
echo "=== 3. ATUALIZANDO CÓDIGO DO GITHUB ==="

log_info "Fazendo pull das últimas mudanças..."
git fetch origin

# Verificar se há atualizações
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    log_info "Código já está atualizado (sem mudanças no GitHub)"
else
    log_info "Novas mudanças detectadas, atualizando..."
    git pull origin master
    if ! check_command "Código atualizado do GitHub"; then
        log_error "Falha ao atualizar código. Abortando atualização."
        exit 1
    fi
    
    # Mostrar últimas mudanças
    log_info "Últimas mudanças aplicadas:"
    git log --oneline -3 | sed 's/^/  /'
fi

echo ""
echo "=== 4. RECONSTRUINDO IMAGENS DOCKER ==="

log_info "Iniciando rebuild das imagens (pode demorar alguns minutos)..."
docker-compose -f docker-compose.production.yml build --no-cache

if ! check_command "Imagens reconstruídas"; then
    log_error "Falha no build das imagens!"
    log_warning "Tentando restaurar backup..."
    
    # Restaurar backup
    if docker images | grep -q "$BACKUP_TAG"; then
        docker tag batuara-publicwebsite:$BACKUP_TAG batuara-publicwebsite:latest 2>/dev/null
        docker tag batuara-admindashboard:$BACKUP_TAG batuara-admindashboard:latest 2>/dev/null
        log_info "Iniciando aplicações com versão anterior..."
        docker-compose -f docker-compose.production.yml up -d
        log_error "Atualização falhou, mas aplicações foram restauradas"
    else
        log_error "Backup não disponível. Aplicações podem estar indisponíveis."
    fi
    exit 1
fi

echo ""
echo "=== 5. INICIANDO APLICAÇÕES ==="

log_info "Iniciando containers atualizados..."
docker-compose -f docker-compose.production.yml up -d
check_command "Containers iniciados"

# Aguardar inicialização
log_info "Aguardando inicialização completa (30 segundos)..."
sleep 30

echo ""
echo "=== 6. VERIFICAÇÃO DE SAÚDE ==="

log_info "Verificando status dos containers..."
docker-compose -f docker-compose.production.yml ps

log_info "Executando verificação completa de saúde..."
if [ -f "./monitor-assets.sh" ]; then
    ./monitor-assets.sh
    HEALTH_STATUS=$?
else
    log_warning "Script de monitoramento não encontrado"
    HEALTH_STATUS=1
fi

echo ""
echo "=== 7. LIMPEZA ==="

log_info "Removendo imagens não utilizadas..."
docker image prune -f > /dev/null 2>&1
log_success "Limpeza concluída"

echo ""
echo "=== 8. RESUMO DA ATUALIZAÇÃO ==="

if [ $HEALTH_STATUS -eq 0 ]; then
    log_success "🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    log_info "🌐 URLs de acesso:"
    echo "   PublicWebsite: http://$(curl -s -4 icanhazip.com 2>/dev/null || echo 'SEU_IP'):3000"
    echo "   AdminDashboard: http://$(curl -s -4 icanhazip.com 2>/dev/null || echo 'SEU_IP'):3001/dashboard"
    echo ""
    log_info "📊 Comandos úteis:"
    echo "   Monitorar: ./monitor-assets.sh"
    echo "   Ver logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "   Status: docker-compose -f docker-compose.production.yml ps"
else
    log_warning "⚠️ ATUALIZAÇÃO CONCLUÍDA COM ALERTAS"
    log_warning "Aplicações foram iniciadas, mas alguns problemas foram detectados"
    log_info "Verifique os logs: docker-compose -f docker-compose.production.yml logs"
fi

echo ""
log_info "📦 Backup criado: $BACKUP_TAG"
log_info "Para rollback (se necessário):"
echo "   docker-compose -f docker-compose.production.yml down"
echo "   docker tag batuara-publicwebsite:$BACKUP_TAG batuara-publicwebsite:latest"
echo "   docker tag batuara-admindashboard:$BACKUP_TAG batuara-admindashboard:latest"
echo "   docker-compose -f docker-compose.production.yml up -d"

echo ""
echo "=== ATUALIZAÇÃO FINALIZADA ==="
echo "Horário de conclusão: $(date)"

# Registrar atualização no log
echo "$(date): Atualização de produção executada - Status: $([[ $HEALTH_STATUS -eq 0 ]] && echo 'SUCCESS' || echo 'WARNING')" >> /var/log/batuara-updates.log 2>/dev/null || true

exit $HEALTH_STATUS