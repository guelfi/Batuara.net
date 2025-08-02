#!/bin/bash

echo "🔧 TESTE DE BUILD - VERIFICAÇÃO DE ASSETS"
echo "========================================"
echo "Data: $(date)"
echo ""

# Navegar para o diretório do projeto
cd "$(dirname "$0")"

echo "📁 Diretório atual: $(pwd)"
echo ""

echo "🔍 Verificando assets na pasta public..."
echo "Assets encontrados:"
ls -la src/Frontend/PublicWebsite/public/
echo ""

echo "🐳 Construindo imagem Docker para teste..."
docker build -f Dockerfile.frontend -t batuara-frontend-test . || {
    echo "❌ Erro ao construir imagem Docker"
    exit 1
}

echo ""
echo "🚀 Iniciando container de teste..."
docker run -d --name batuara-test -p 3001:80 batuara-frontend-test || {
    echo "❌ Erro ao iniciar container"
    exit 1
}

echo ""
echo "⏳ Aguardando container inicializar..."
sleep 5

echo ""
echo "🔍 Testando acesso aos assets..."

echo "Testando favicon.ico:"
FAVICON_RESPONSE=$(curl -s -I http://localhost:3001/favicon.ico | head -n 1)
echo "Resposta: $FAVICON_RESPONSE"

echo ""
echo "Testando batuara_logo.png:"
LOGO_RESPONSE=$(curl -s -I http://localhost:3001/batuara_logo.png | head -n 1)
echo "Resposta: $LOGO_RESPONSE"

echo ""
echo "Testando página principal:"
MAIN_RESPONSE=$(curl -s -I http://localhost:3001/ | head -n 1)
echo "Resposta: $MAIN_RESPONSE"

echo ""
echo "📋 Verificando arquivos no container:"
docker exec batuara-test ls -la /usr/share/nginx/html/

echo ""
echo "🧹 Limpando container de teste..."
docker stop batuara-test
docker rm batuara-test

echo ""
echo "✅ Teste concluído!"
echo "Se os assets retornaram 200 OK, o build está funcionando corretamente."
echo "========================================"