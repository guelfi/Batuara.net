#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Iniciando servidor do AdminDashboard ===${NC}"

# Limpar a tela
clear

# Definir a porta
export PORT=3001

# Iniciar o servidor do dashboard administrativo
echo -e "${BLUE}Iniciando o servidor do dashboard administrativo (http://localhost:3001)...${NC}"
cd AdminDashboard && npm start

echo -e "${GREEN}Servidor encerrado.${NC}"