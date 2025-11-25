#!/bin/bash

# Script para testar rapidamente se a API está funcionando
# Execute este script para verificar se a API está respondendo corretamente

API_URL="http://localhost:3003"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testando API Batuara.net..."
echo "URL: $API_URL"
echo ""

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local headers=$5
    local data=$6
    
    echo -n "Testing $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method \
            $headers \
            "$API_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        if [ -n "$response_body" ]; then
            echo "   Response: $response_body"
        fi
    fi
}

# 1. Testar se a API está rodando (Swagger)
test_endpoint "GET" "/swagger/index.html" "API Health Check" "200"

# 2. Testar endpoint de login sem credenciais (deve retornar 400)
test_endpoint "POST" "/api/auth/login" "Login without credentials" "400" "" '{}'

# 3. Testar endpoint protegido sem token (deve retornar 401)
test_endpoint "GET" "/api/auth/me" "Protected endpoint without token" "401"

# 4. Testar endpoint de verificação de token com token inválido (deve retornar 401)
test_endpoint "GET" "/api/auth/verify" "Token verification with invalid token" "401" "-H 'Authorization: Bearer invalid_token'"

echo ""
echo "📋 Resumo dos Testes:"
echo "- Se todos os testes passaram, a API está funcionando corretamente"
echo "- Para testes completos, use a collection do Postman"
echo "- Para criar o primeiro usuário admin, execute: create-admin-user.sql"
echo ""
echo "🚀 Próximos passos:"
echo "1. Importe a collection no Postman: Batuara-API-Collection.json"
echo "2. Importe o environment: Batuara-API-Environment.json"
echo "3. Execute os testes na ordem recomendada"
echo ""
echo "📖 Documentação completa: README.md"