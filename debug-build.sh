#!/bin/bash

echo "🔍 DEBUG BUILD - VERIFICAÇÃO DETALHADA"
echo "====================================="

echo "📋 Verificando logs de build do container..."
docker logs batuara-public-website --tail 100

echo ""
echo "📁 Verificando estrutura completa do container..."
docker exec batuara-public-website find /usr/share/nginx/html -type f -name "*" | head -20

echo ""
echo "🔧 Verificando configuração nginx completa..."
docker exec batuara-public-website cat /etc/nginx/conf.d/default.conf

echo ""
echo "📦 Verificando se há cache de build..."
docker images | grep batuara

echo ""
echo "🏗️ Forçando rebuild sem cache..."
echo "Execute: docker-compose build --no-cache public-website"