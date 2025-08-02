#!/bin/bash

echo "🔍 DIAGNÓSTICO DE ASSETS - BATUARA PUBLICWEBSITE"
echo "================================================"
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo ""

# Verificar se o container está rodando
echo "📦 STATUS DO CONTAINER:"
echo "----------------------"
if docker ps | grep -q "batuara-public-website"; then
    echo "✅ Container batuara-public-website está RODANDO"
    CONTAINER_STATUS="running"
else
    echo "❌ Container batuara-public-website NÃO está rodando"
    echo "Containers ativos:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    CONTAINER_STATUS="stopped"
fi
echo ""

# Se o container estiver rodando, fazer diagnósticos detalhados
if [ "$CONTAINER_STATUS" = "running" ]; then
    echo "📁 ESTRUTURA DE ARQUIVOS NO CONTAINER:"
    echo "-------------------------------------"
    echo "Listando /usr/share/nginx/html/:"
    docker exec batuara-public-website ls -la /usr/share/nginx/html/ || echo "❌ Erro ao listar arquivos"
    echo ""
    
    echo "🖼️ ASSETS ENCONTRADOS:"
    echo "----------------------"
    echo "Procurando por imagens e ícones:"
    docker exec batuara-public-website find /usr/share/nginx/html/ -name "*.png" -o -name "*.jpg" -o -name "*.ico" -o -name "*.svg" 2>/dev/null || echo "❌ Erro ao procurar assets"
    echo ""
    
    echo "📄 VERIFICANDO ARQUIVOS CRÍTICOS:"
    echo "---------------------------------"
    
    # Verificar favicon.ico
    if docker exec batuara-public-website test -f /usr/share/nginx/html/favicon.ico; then
        echo "✅ favicon.ico encontrado"
        docker exec batuara-public-website ls -la /usr/share/nginx/html/favicon.ico
    else
        echo "❌ favicon.ico NÃO encontrado"
    fi
    
    # Verificar batuara_logo.png
    if docker exec batuara-public-website test -f /usr/share/nginx/html/batuara_logo.png; then
        echo "✅ batuara_logo.png encontrado"
        docker exec batuara-public-website ls -la /usr/share/nginx/html/batuara_logo.png
    else
        echo "❌ batuara_logo.png NÃO encontrado"
    fi
    
    # Verificar index.html
    if docker exec batuara-public-website test -f /usr/share/nginx/html/index.html; then
        echo "✅ index.html encontrado"
        echo "Verificando referências ao favicon no index.html:"
        docker exec batuara-public-website grep -i "favicon" /usr/share/nginx/html/index.html || echo "Nenhuma referência ao favicon encontrada"
    else
        echo "❌ index.html NÃO encontrado"
    fi
    echo ""
    
    echo "🌐 TESTANDO ACESSO HTTP AOS ASSETS:"
    echo "-----------------------------------"
    
    # Testar favicon.ico
    echo "Testando http://localhost:3000/favicon.ico:"
    FAVICON_RESPONSE=$(curl -s -I http://localhost:3000/favicon.ico | head -n 1)
    if echo "$FAVICON_RESPONSE" | grep -q "200"; then
        echo "✅ favicon.ico acessível: $FAVICON_RESPONSE"
        # Verificar Content-Type
        FAVICON_TYPE=$(curl -s -I http://localhost:3000/favicon.ico | grep -i "content-type" || echo "Content-Type não encontrado")
        echo "   Content-Type: $FAVICON_TYPE"
    else
        echo "❌ favicon.ico não acessível: $FAVICON_RESPONSE"
    fi
    
    # Testar batuara_logo.png
    echo "Testando http://localhost:3000/batuara_logo.png:"
    LOGO_RESPONSE=$(curl -s -I http://localhost:3000/batuara_logo.png | head -n 1)
    if echo "$LOGO_RESPONSE" | grep -q "200"; then
        echo "✅ batuara_logo.png acessível: $LOGO_RESPONSE"
        # Verificar Content-Type
        LOGO_TYPE=$(curl -s -I http://localhost:3000/batuara_logo.png | grep -i "content-type" || echo "Content-Type não encontrado")
        echo "   Content-Type: $LOGO_TYPE"
    else
        echo "❌ batuara_logo.png não acessível: $LOGO_RESPONSE"
    fi
    
    # Testar página principal
    echo "Testando http://localhost:3000/:"
    MAIN_RESPONSE=$(curl -s -I http://localhost:3000/ | head -n 1)
    if echo "$MAIN_RESPONSE" | grep -q "200"; then
        echo "✅ Página principal acessível: $MAIN_RESPONSE"
    else
        echo "❌ Página principal não acessível: $MAIN_RESPONSE"
    fi
    
    echo ""
    echo "🔧 TESTANDO CONFIGURAÇÃO NGINX:"
    echo "-------------------------------"
    echo "Verificando configuração nginx no container:"
    docker exec batuara-public-website cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "❌ Erro ao ler configuração nginx"
    echo ""
    
    echo "📋 LOGS DO NGINX (últimas 20 linhas):"
    echo "-------------------------------------"
    docker logs batuara-public-website --tail 20 2>/dev/null || echo "❌ Erro ao obter logs"
    echo ""
    
    echo "🚨 ERROS 404 NOS LOGS:"
    echo "----------------------"
    docker logs batuara-public-website 2>/dev/null | grep -E "(404|favicon|logo|\.png|\.ico)" | tail -10 || echo "Nenhum erro 404 relacionado a assets encontrado"
    echo ""
    
    echo "⚙️ CONFIGURAÇÃO DO NGINX:"
    echo "-------------------------"
    echo "Verificando configuração do nginx:"
    docker exec batuara-public-website cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "❌ Erro ao ler configuração do nginx"
    echo ""
fi

echo "🐳 INFORMAÇÕES DOS CONTAINERS:"
echo "------------------------------"
docker ps -a | grep batuara || echo "Nenhum container batuara encontrado"
echo ""

echo "📊 RESUMO DO DIAGNÓSTICO:"
echo "========================="
if [ "$CONTAINER_STATUS" = "running" ]; then
    echo "- Container: ✅ Rodando"
    echo "- Para corrigir problemas de assets:"
    echo "  1. Verifique se os arquivos estão no container"
    echo "  2. Teste o acesso HTTP direto aos assets"
    echo "  3. Analise os logs do nginx para erros 404"
    echo "  4. Verifique a configuração do nginx"
else
    echo "- Container: ❌ Não está rodando"
    echo "- Primeiro inicie o container com: docker-compose up -d"
fi
echo ""
echo "🔧 Para executar correções, use os próximos scripts do plano de implementação."
echo "================================================"