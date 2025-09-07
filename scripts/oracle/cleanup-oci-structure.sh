#!/bin/bash

# Script para limpar e reorganizar a estrutura do Batuara.net na OCI
# Este script deve ser executado na OCI para corrigir a estrutura de pastas

set -e

echo "🧹 Iniciando limpeza e reorganização da estrutura na OCI..."

# Definir caminhos
CURRENT_STRUCTURE="/var/www/batuara_net"
CORRECT_STRUCTURE="/var/www/batuara_net"
BACKUP_DIR="/var/www/backups/structure_cleanup_$(date +%Y%m%d_%H%M%S)"
TEMP_DIR="/tmp/batuara_cleanup"

# Criar diretório de backup
echo "📦 Criando backup da estrutura atual..."
mkdir -p "$BACKUP_DIR"
cp -r "$CURRENT_STRUCTURE" "$BACKUP_DIR/"
echo "✅ Backup criado em: $BACKUP_DIR"

# Parar containers se estiverem rodando
echo "⏹️ Parando containers..."
cd "$CURRENT_STRUCTURE"
if [ -f "docker-compose.production.yml" ]; then
    docker-compose -f docker-compose.production.yml -p batuara-net down 2>/dev/null || true
fi
if [ -f "Batuara.net/docker-compose.production.yml" ]; then
    cd "Batuara.net"
    docker-compose -f docker-compose.production.yml -p batuara-net down 2>/dev/null || true
    cd ..
fi

# Criar estrutura temporária limpa
echo "🔄 Reorganizando estrutura..."
mkdir -p "$TEMP_DIR"

# Mover arquivos da estrutura correta (assumindo que está em Batuara.net/)
if [ -d "$CURRENT_STRUCTURE/Batuara.net" ]; then
    echo "📁 Movendo arquivos da pasta Batuara.net/ para raiz..."
    cp -r "$CURRENT_STRUCTURE/Batuara.net/"* "$TEMP_DIR/"
    cp -r "$CURRENT_STRUCTURE/Batuara.net/".* "$TEMP_DIR/" 2>/dev/null || true
else
    echo "📁 Copiando estrutura atual..."
    cp -r "$CURRENT_STRUCTURE/"* "$TEMP_DIR/"
    cp -r "$CURRENT_STRUCTURE/".* "$TEMP_DIR/" 2>/dev/null || true
fi

# Remover arquivos duplicados e desnecessários na raiz
echo "🗑️ Removendo arquivos duplicados..."
cd "$CURRENT_STRUCTURE"

# Lista de arquivos que devem estar apenas na estrutura principal
FILES_TO_REMOVE=(
    "cleanup-oracle-server.sh"
    "deploy-oracle-fase0.sh"
    "clear-cache-oracle.sh"
    "diagnose-assets-oracle.sh"
    "monitor-assets.sh"
    "oracle-cleanup.sh"
    "oracle-deploy-ready.sh"
    "oracle-quick-fix.sh"
    "setup-env-oracle.sh"
    "start-all.sh"
    "start-apps.bat"
    "start-apps.ps1"
    "start-apps.sh"
    "stop-all.sh"
    "stop-apps.sh"
)

# Remover arquivos duplicados da raiz se existirem na subpasta
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ] && [ -f "Batuara.net/$file" ]; then
        echo "🗑️ Removendo $file duplicado da raiz"
        rm -f "$file"
    fi
done

# Remover pastas duplicadas da raiz se existirem na subpasta
DIRS_TO_CHECK=("docs" "postman" "scripts" "src" "tests")
for dir in "${DIRS_TO_CHECK[@]}"; do
    if [ -d "$dir" ] && [ -d "Batuara.net/$dir" ]; then
        echo "🗑️ Removendo pasta $dir duplicada da raiz"
        rm -rf "$dir"
    fi
done

# Limpar estrutura atual e mover arquivos organizados
echo "🔄 Aplicando nova estrutura..."
rm -rf "$CURRENT_STRUCTURE/"*
rm -rf "$CURRENT_STRUCTURE/".* 2>/dev/null || true

# Mover estrutura limpa para o local correto
mv "$TEMP_DIR/"* "$CURRENT_STRUCTURE/"
mv "$TEMP_DIR/".* "$CURRENT_STRUCTURE/" 2>/dev/null || true

# Limpar diretório temporário
rm -rf "$TEMP_DIR"

# Verificar se os arquivos essenciais estão presentes
echo "🔍 Verificando arquivos essenciais..."
ESSENTIAL_FILES=(
    "docker-compose.production.yml"
    "Dockerfile.api"
    "Dockerfile.frontend"
    ".env.example"
    "src"
    ".github/workflows/deploy-oci.yml"
)

cd "$CURRENT_STRUCTURE"
for item in "${ESSENTIAL_FILES[@]}"; do
    if [ -e "$item" ]; then
        echo "✅ $item encontrado"
    else
        echo "❌ $item NÃO encontrado!"
    fi
done

# Definir permissões corretas
echo "🔐 Definindo permissões..."
chown -R ubuntu:ubuntu "$CURRENT_STRUCTURE"
find "$CURRENT_STRUCTURE" -type f -name "*.sh" -exec chmod +x {} \;

echo "🎉 Limpeza e reorganização concluída!"
echo "📁 Estrutura atual: $CURRENT_STRUCTURE"
echo "📦 Backup disponível em: $BACKUP_DIR"
echo ""
echo "📋 Próximos passos:"
echo "1. Verificar se a estrutura está correta"
echo "2. Testar o deploy via GitHub Actions"
echo "3. Remover backup se tudo estiver funcionando"