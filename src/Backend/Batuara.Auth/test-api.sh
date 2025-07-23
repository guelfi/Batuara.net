#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3003/api"

echo -e "${BLUE}=== Testando API de Autenticação Batuara ===${NC}"

# Função para fazer requisições e mostrar resultados formatados
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
    
    # Extrair token se for login
    if [[ "$endpoint" == "/auth/login" ]]; then
        TOKEN=$(echo "$response" | jq -r '.data.token')
        REFRESH_TOKEN=$(echo "$response" | jq -r '.data.refreshToken')
        echo -e "${BLUE}Token:${NC} $TOKEN"
        echo -e "${BLUE}Refresh Token:${NC} $REFRESH_TOKEN"
    fi
}

# Teste 1: Login com credenciais corretas
echo -e "\n${GREEN}=== Teste 1: Login com credenciais corretas ===${NC}"
make_request "POST" "/auth/login" '{"email":"admin@casabatuara.org.br","password":"admin123"}'

# Salvar token para próximos testes
TOKEN=$(curl -s -X "POST" "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"admin123"}' | jq -r '.data.token')
REFRESH_TOKEN=$(curl -s -X "POST" "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@casabatuara.org.br","password":"admin123"}' | jq -r '.data.refreshToken')

# Teste 2: Login com credenciais incorretas
echo -e "\n${GREEN}=== Teste 2: Login com credenciais incorretas ===${NC}"
make_request "POST" "/auth/login" '{"email":"admin@casabatuara.org.br","password":"senha_errada"}'

# Teste 3: Verificar token
echo -e "\n${GREEN}=== Teste 3: Verificar token ===${NC}"
make_request "GET" "/auth/verify" "" "$TOKEN"

# Teste 4: Obter informações do usuário atual
echo -e "\n${GREEN}=== Teste 4: Obter informações do usuário atual ===${NC}"
make_request "GET" "/auth/me" "" "$TOKEN"

# Teste 5: Listar todos os usuários (requer admin)
echo -e "\n${GREEN}=== Teste 5: Listar todos os usuários ===${NC}"
make_request "GET" "/users" "" "$TOKEN"

# Teste 6: Renovar token
echo -e "\n${GREEN}=== Teste 6: Renovar token ===${NC}"
make_request "POST" "/auth/refresh" "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# Teste 7: Revogar token
echo -e "\n${GREEN}=== Teste 7: Revogar token ===${NC}"
make_request "POST" "/auth/revoke" "{\"refreshToken\":\"$REFRESH_TOKEN\"}" "$TOKEN"

echo -e "\n${BLUE}=== Testes concluídos ===${NC}"