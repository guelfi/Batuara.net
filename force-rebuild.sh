#!/bin/bash

echo "🔥 REBUILD FORÇADO - SEM CACHE"
echo "=============================="
echo "Data: $(date)"
echo ""

# Parar e remover containers
echo "🛑 Parando containers..."
docker-compose down

echo ""
echo "🧹 Limpando cache Docker..."
docker system prune -f
docker builder prune -f

echo ""
echo "🗑️ Removendo imagens antigas..."
docker rmi batuara_net_public-website:latest 2>/dev/null || echo "Imagem não encontrada"

echo ""
echo "🏗️ Rebuild completo sem cache..."
docker-compose build --no-cache public-website

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando inicialização..."
sleep 10

echo ""
echo "🔍 Verificando resultado..."
docker exec batuara-public-website ls -la /usr/share/nginx/html/

echo ""
echo "✅ Rebuild concluído!"
echo "Teste: http://129.153.86.168:3000"