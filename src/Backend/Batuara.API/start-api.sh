#!/bin/bash

echo "🚀 Iniciando Batuara.API na porta 3003..."

# Verificar se a porta 3003 está em uso
if lsof -i :3003 > /dev/null 2>&1; then
    echo "⚠️  Porta 3003 está em uso. Tentando encerrar processo..."
    lsof -ti :3003 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Definir a URL da aplicação
export ASPNETCORE_URLS="http://localhost:3003"

echo "📊 Configurações:"
echo "   - Porta: 3003"
echo "   - URL: http://localhost:3003"
echo "   - Swagger: http://localhost:3003/swagger"
echo "   - Ambiente: Development"
echo ""

# Iniciar a API
dotnet run --project Batuara.API.csproj