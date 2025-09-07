#!/bin/bash

# Script para configurar arquivo .env na Oracle
echo "=== CONFIGURAÇÃO DO AMBIENTE ORACLE ==="
echo "Data: $(date)"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo "Erro: Arquivo .env.production não encontrado!"
    exit 1
fi

# Copiar .env.production para .env
log_info "Copiando .env.production para .env..."
cp .env.production .env

if [ $? -eq 0 ]; then
    log_success "Arquivo .env criado com sucesso!"
    echo ""
    log_info "Conteúdo do arquivo .env:"
    cat .env
    echo ""
    log_success "Ambiente configurado para Oracle!"
else
    echo "Erro ao criar arquivo .env"
    exit 1
fi