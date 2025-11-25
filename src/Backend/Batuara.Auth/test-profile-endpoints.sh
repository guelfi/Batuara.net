#!/bin/bash

# Colors for better visualization
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3003/api"

echo -e "${BLUE}=== Testando Endpoints de Perfil e Senha da API Batuara ===${NC}"

# Function to make requests and show formatted results
function make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    
    echo -e "\n${YELLOW}$method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        echo -e "${BLUE}Request:${NC}"
        echo "$data" | jq '.'
    fi
    
    local headers="-H 'Content-Type: application/json'"
    
    if [ -n "$auth_header" ]; then
        headers="$headers -H 'Authorization: Bearer $auth_header'"
    fi
    
    local response
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$API_URL$endpoint" -H "Content-Type: application/json" $([[ -n "$auth_header" ]] && echo "-H 'Authorization: Bearer $auth_header'") -d "$data")
    else
        response=$(curl -s -X "$method" "$API_URL$endpoint" $([[ -n "$auth_header" ]] && echo "-H 'Authorization: Bearer $auth_header'"))
    fi
    
    echo -e "${GREEN}Response:${NC}"
    echo "$response" | jq '.'
    
    # Extract token if it's login
    if [[ "$endpoint" == "/auth/login" ]]; then
        TOKEN=$(echo "$response" | jq -r '.data.token')
        REFRESH_TOKEN=$(echo "$response" | jq -r '.data.refreshToken')
        echo -e "${BLUE}Token:${NC} $TOKEN"
        echo -e "${BLUE}Refresh Token:${NC} $REFRESH_TOKEN"
    fi
}

# Test 1: Login to get authentication token
echo -e "\n${GREEN}=== Teste 1: Login para obter token de autenticação ===${NC}"
make_request "POST" "/auth/login" '{"email":"admin@casabatuara.org.br","password":"admin123"}'

# Save token for next tests
TOKEN=$(curl -s -X "POST" "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"admin123"}' | jq -r '.data.token')

# Test 2: Get current user information
echo -e "\n${GREEN}=== Teste 2: Obter informações do usuário atual ===${NC}"
make_request "GET" "/auth/me" "" "$TOKEN"

# Test 3: Update user profile
echo -e "\n${GREEN}=== Teste 3: Atualizar perfil do usuário ===${NC}"
make_request "PUT" "/auth/me" '{"name":"Admin Atualizado","email":"admin@casabatuara.org.br"}' "$TOKEN"

# Test 4: Change password
echo -e "\n${GREEN}=== Teste 4: Alterar senha ===${NC}"
make_request "PUT" "/auth/change-password" '{"currentPassword":"admin123","newPassword":"novasenha123"}' "$TOKEN"

# Test 5: Login with new password
echo -e "\n${GREEN}=== Teste 5: Login com nova senha ===${NC}"
make_request "POST" "/auth/login" '{"email":"admin@casabatuara.org.br","password":"novasenha123"}'

# Test 6: Change password back to original
echo -e "\n${GREEN}=== Teste 6: Alterar senha de volta para a original ===${NC}"
NEW_TOKEN=$(curl -s -X "POST" "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"novasenha123"}' | jq -r '.data.token')
make_request "PUT" "/auth/change-password" '{"currentPassword":"novasenha123","newPassword":"admin123"}' "$NEW_TOKEN"

# Test 7: Login with original password
echo -e "\n${GREEN}=== Teste 7: Login com senha original ===${NC}"
make_request "POST" "/auth/login" '{"email":"admin@casabatuara.org.br","password":"admin123"}'

echo -e "\n${BLUE}=== Testes concluídos ===${NC}"