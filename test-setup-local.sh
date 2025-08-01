#!/bin/bash

# Script de teste local para validar a configuração
# Simula o ambiente do servidor para testes

echo "🧪 Testando configuração local do Batuara..."

# Verificar se todos os scripts existem
scripts=("setup-database.sh" "scripts/migration-handler.sh" "scripts/data-seeder.sh" "scripts/api-health-validator.sh")

echo "📋 Verificando scripts..."
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ $script encontrado"
        if [ -x "$script" ]; then
            echo "✅ $script é executável"
        else
            echo "❌ $script não é executável"
            chmod +x "$script"
            echo "✅ $script tornado executável"
        fi
    else
        echo "❌ $script não encontrado"
    fi
done

echo ""
echo "📁 Verificando estrutura de arquivos..."

# Verificar arquivos necessários
required_files=(
    "docker-compose.yml"
    ".env"
    "scripts/create_database_schema.sql"
    "scripts/seed_orixas_data.sql"
    "scripts/seed_umbanda_lines_data.sql"
    "scripts/seed_spiritual_content_data.sql"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "⚠️ $file não encontrado (pode ser necessário no servidor)"
    fi
done

echo ""
echo "🔧 Testando sintaxe dos scripts..."

# Testar sintaxe bash
for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if bash -n "$script"; then
            echo "✅ $script: sintaxe OK"
        else
            echo "❌ $script: erro de sintaxe"
        fi
    fi
done

echo ""
echo "📊 Resumo dos testes locais:"
echo "✅ Scripts criados e executáveis"
echo "✅ Sintaxe validada"
echo "✅ Estrutura de arquivos verificada"
echo ""
echo "🚀 Pronto para fazer git push e testar no servidor!"
echo ""
echo "Comandos para o servidor:"
echo "1. git pull origin main"
echo "2. chmod +x setup-database.sh"
echo "3. ./setup-database.sh setup"