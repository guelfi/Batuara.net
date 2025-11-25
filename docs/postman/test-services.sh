#!/bin/bash

echo "🧪 Testando Serviços Batuara..."
echo "================================"

# Testar API
echo "1. Testando API (porta 3003)..."
api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/swagger)
if [ "$api_response" = "200" ] || [ "$api_response" = "302" ]; then
    echo "✅ API Batuara respondendo (Status: $api_response)"
    echo "   📍 Swagger: http://localhost:3003/swagger"
else
    echo "❌ API Batuara não está respondendo (Status: $api_response)"
fi

echo ""

# Testar AdminDashboard
echo "2. Testando AdminDashboard (porta 3000)..."
admin_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$admin_response" = "200" ]; then
    echo "✅ AdminDashboard respondendo (Status: $admin_response)"
    echo "   📍 URL: http://localhost:3000"
else
    echo "❌ AdminDashboard não está respondendo (Status: $admin_response)"
fi

echo ""

# Testar PublicWebsite
echo "3. Testando PublicWebsite (porta 3001)..."
public_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$public_response" = "200" ]; then
    echo "✅ PublicWebsite respondendo (Status: $public_response)"
    echo "   📍 URL: http://localhost:3001"
else
    echo "❌ PublicWebsite não está respondendo (Status: $public_response)"
fi

echo ""
echo "📋 Resumo dos Serviços:"
echo "- API: http://localhost:3003/swagger"
echo "- AdminDashboard: http://localhost:3000"
echo "- PublicWebsite: http://localhost:3001"
echo ""
echo "🔍 Para verificar logs:"
echo "- API: tail -f Batuara.net/src/Backend/Batuara.API/logs/application-*.log"
echo "- Frontends: verificar console do browser"