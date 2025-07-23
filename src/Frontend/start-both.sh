#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando servidores de desenvolvimento ===${NC}"

# Limpar a tela
clear

# Iniciar o servidor do site público em segundo plano
echo -e "${BLUE}Iniciando o servidor do site público (http://localhost:3000)...${NC}"
cd PublicWebsite && npm start &
PUBLIC_PID=$!

# Aguardar um pouco para evitar conflitos de porta
sleep 5

# Iniciar o servidor do dashboard administrativo em segundo plano
echo -e "${BLUE}Iniciando o servidor do dashboard administrativo (http://localhost:3001)...${NC}"
cd ../AdminDashboard && ./start-with-port-check.sh &
ADMIN_PID=$!

# Função para lidar com o encerramento do script
cleanup() {
    echo -e "${GREEN}Encerrando servidores...${NC}"
    kill $PUBLIC_PID
    kill $ADMIN_PID
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}Ambos os servidores estão rodando!${NC}"
echo -e "${BLUE}Site público: http://localhost:3000${NC}"
echo -e "${BLUE}Dashboard administrativo: http://localhost:3001${NC}"
echo -e "${GREEN}Pressione Ctrl+C para encerrar ambos os servidores${NC}"

# Manter o script em execução
wait