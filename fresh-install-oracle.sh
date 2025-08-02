#!/bin/bash

echo "🚀 FRESH INSTALL - SERVIDOR ORACLE"
echo "=================================="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo ""

# Definir variáveis
PROJECT_DIR="/var/www/batuara_net"
REPO_URL="https://github.com/guelfi/Batuara.net.git"
BACKUP_DIR="/var/www/backups/$(date +%Y%m%d_%H%M%S)"

echo "📋 CONFIGURAÇÕES:"
echo "- Diretório do projeto: $PROJECT_DIR"
echo "- Repositório: $REPO_URL"
echo "- Backup será salvo em: $BACKUP_DIR"
echo ""

# Parar todos os containers
echo "🛑 Parando todos os containers..."
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    docker-compose down 2>/dev/null || echo "Nenhum container rodando"
fi

# Fazer backup do diretório atual (se existir)
if [ -d "$PROJECT_DIR" ]; then
    echo "💾 Fazendo backup do diretório atual..."
    mkdir -p "$(dirname "$BACKUP_DIR")"
    mv "$PROJECT_DIR" "$BACKUP_DIR"
    echo "✅ Backup salvo em: $BACKUP_DIR"
else
    echo "ℹ️  Diretório não existe, não há necessidade de backup"
fi

# Criar diretório pai se não existir
echo "📁 Criando estrutura de diretórios..."
mkdir -p "$(dirname "$PROJECT_DIR")"

# Clonar repositório fresh
echo "📥 Clonando repositório fresh do GitHub..."
cd "$(dirname "$PROJECT_DIR")"
if git clone "$REPO_URL" "$(basename "$PROJECT_DIR")"; then
    echo "✅ Repositório clonado com sucesso!"
else
    echo "❌ Erro ao clonar repositório"
    echo "Tentando restaurar backup..."
    if [ -d "$BACKUP_DIR" ]; then
        mv "$BACKUP_DIR" "$PROJECT_DIR"
        echo "✅ Backup restaurado"
    fi
    exit 1
fi

# Navegar para o diretório do projeto
cd "$PROJECT_DIR"

echo ""
echo "🔍 VERIFICANDO ARQUIVOS CRÍTICOS:"
echo "---------------------------------"

# Verificar Dockerfile.frontend
if [ -f "Dockerfile.frontend" ]; then
    echo "✅ Dockerfile.frontend encontrado"
    echo "Primeiras linhas:"
    head -5 Dockerfile.frontend
else
    echo "❌ Dockerfile.frontend NÃO encontrado"
fi

# Verificar docker-compose
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml encontrado"
elif [ -f "docker-compose-fixed.yml" ]; then
    echo "✅ docker-compose-fixed.yml encontrado"
    COMPOSE_FILE="docker-compose-fixed.yml"
else
    echo "❌ Nenhum arquivo docker-compose encontrado"
fi

# Verificar assets do PublicWebsite
if [ -f "src/Frontend/PublicWebsite/public/favicon.ico" ]; then
    echo "✅ favicon.ico encontrado no PublicWebsite"
else
    echo "❌ favicon.ico NÃO encontrado no PublicWebsite"
fi

if [ -f "src/Frontend/PublicWebsite/public/batuara_logo.png" ]; then
    echo "✅ batuara_logo.png encontrado no PublicWebsite"
else
    echo "❌ batuara_logo.png NÃO encontrado no PublicWebsite"
fi

echo ""
echo "🧹 LIMPANDO CACHE DOCKER COMPLETO..."
echo "-----------------------------------"
docker system prune -af --volumes
docker builder prune -af

echo ""
echo "🏗️ CONSTRUINDO TODOS OS CONTAINERS FRESH..."
echo "-------------------------------------------"

# Determinar qual arquivo docker-compose usar
if [ -f "docker-compose-fixed.yml" ]; then
    COMPOSE_FILE="docker-compose-fixed.yml"
    echo "📄 Usando: docker-compose-fixed.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
    echo "📄 Usando: docker-compose.yml"
else
    echo "❌ Nenhum arquivo docker-compose encontrado!"
    exit 1
fi

# Build completo sem cache
if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build"
    exit 1
fi

echo ""
echo "🚀 INICIANDO TODOS OS SERVIÇOS..."
echo "--------------------------------"
if docker-compose -f "$COMPOSE_FILE" up -d; then
    echo "✅ Serviços iniciados com sucesso!"
else
    echo "❌ Erro ao iniciar serviços"
    exit 1
fi

echo ""
echo "⏳ Aguardando inicialização completa..."
sleep 15

echo ""
echo "🔍 VERIFICANDO STATUS DOS CONTAINERS:"
echo "------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧪 TESTANDO ASSETS CRÍTICOS:"
echo "----------------------------"

# Testar favicon
echo "Testando favicon.ico:"
FAVICON_RESPONSE=$(curl -s -I http://localhost:3000/favicon.ico | head -n 1)
if echo "$FAVICON_RESPONSE" | grep -q "200"; then
    echo "✅ favicon.ico: $FAVICON_RESPONSE"
else
    echo "❌ favicon.ico: $FAVICON_RESPONSE"
fi

# Testar logo
echo "Testando batuara_logo.png:"
LOGO_RESPONSE=$(curl -s -I http://localhost:3000/batuara_logo.png | head -n 1)
if echo "$LOGO_RESPONSE" | grep -q "200"; then
    echo "✅ batuara_logo.png: $LOGO_RESPONSE"
else
    echo "❌ batuara_logo.png: $LOGO_RESPONSE"
fi

# Testar página principal
echo "Testando página principal:"
MAIN_RESPONSE=$(curl -s -I http://localhost:3000/ | head -n 1)
if echo "$MAIN_RESPONSE" | grep -q "200"; then
    echo "✅ Página principal: $MAIN_RESPONSE"
else
    echo "❌ Página principal: $MAIN_RESPONSE"
fi

echo ""
echo "📊 RESUMO DO FRESH INSTALL:"
echo "=========================="
echo "✅ Fresh install concluído!"
echo "📁 Backup anterior salvo em: $BACKUP_DIR"
echo "🌐 Site disponível em: http://129.153.86.168:3000"
echo "🔧 AdminDashboard disponível em: http://129.153.86.168:3001"
echo ""
echo "🎉 FRESH INSTALL FINALIZADO COM SUCESSO!"
echo "========================================"