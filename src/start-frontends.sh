#!/bin/bash

# Script simplificado para inicializar apenas os frontends
# Casa de Caridade Caboclo Batuara - Desenvolvimento Local

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🏠 Casa de Caridade Caboclo Batuara${NC}"
echo -e "${BLUE}Iniciando frontends para testes de navegabilidade...${NC}\n"

# Verificar se estamos no diretório correto
if [ ! -d "Frontend/AdminDashboard" ] || [ ! -d "Frontend/PublicWebsite" ]; then
    echo -e "${RED}❌ Execute este script a partir do diretório src/${NC}"
    exit 1
fi

# Função para finalizar processos nas portas
cleanup_ports() {
    echo -e "${YELLOW}🧹 Liberando portas 3000 e 3001...${NC}"
    lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Função para iniciar um frontend
start_frontend() {
    local name=$1
    local dir=$2
    local port=$3
    
    echo -e "${BLUE}🚀 Iniciando ${name} na porta ${port}...${NC}"
    cd "$dir"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências do ${name}...${NC}"
        npm install
    fi
    
    PORT=$port npm start &
    local pid=$!
    echo -e "${GREEN}✅ ${name} iniciado (PID: ${pid})${NC}"
    cd - > /dev/null
}

# Limpar portas
cleanup_ports

# Iniciar frontends
start_frontend "PublicWebsite" "Frontend/PublicWebsite" 3000
start_frontend "AdminDashboard" "Frontend/AdminDashboard" 3001

echo -e "\n${GREEN}🎉 Frontends iniciados com sucesso!${NC}"
echo -e "${BLUE}📱 PublicWebsite:${NC} http://localhost:3000"
echo -e "${BLUE}🔧 AdminDashboard:${NC} http://localhost:3001"
echo -e "\n${YELLOW}💡 Pressione Ctrl+C para parar todos os serviços${NC}"

# Aguardar interrupção
trap 'echo -e "\n${YELLOW}🛑 Parando serviços...${NC}"; cleanup_ports; echo -e "${GREEN}✅ Serviços parados!${NC}"; exit 0' INT

# Manter o script rodando
while true; do
    sleep 1
done