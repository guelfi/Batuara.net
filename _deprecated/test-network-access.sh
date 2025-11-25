#!/bin/bash

# Script para testar o acesso aos frontends pela rede local
# Execute este script após configurar o port forwarding no Windows

echo "=== Testando Acesso aos Frontends pela Rede Local ==="
echo

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}1. Verificando se os frontends estão rodando no WSL...${NC}"
echo "Porta 3000 (PublicWebsite):"
netstat -tulpn | grep :3000 || echo -e "${RED}❌ PublicWebsite não está rodando na porta 3000${NC}"

echo "Porta 3001 (AdminDashboard):"
netstat -tulpn | grep :3001 || echo -e "${RED}❌ AdminDashboard não está rodando na porta 3001${NC}"

echo
echo -e "${CYAN}2. Testando acesso local no WSL...${NC}"
echo "Testando PublicWebsite (localhost:3000):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | {
    read status
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ PublicWebsite acessível localmente${NC}"
    else
        echo -e "${RED}❌ PublicWebsite não acessível (HTTP $status)${NC}"
    fi
}

echo "Testando AdminDashboard (localhost:3001):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | {
    read status
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ AdminDashboard acessível localmente${NC}"
    else
        echo -e "${RED}❌ AdminDashboard não acessível (HTTP $status)${NC}"
    fi
}

echo
echo -e "${CYAN}3. Verificando configuração de port forwarding no Windows...${NC}"
echo "Execute no PowerShell do Windows (como Administrador):"
echo -e "${YELLOW}netsh interface portproxy show all${NC}"
echo
echo "Você deve ver algo como:"
echo "Listen on ipv4:             Connect to ipv4:"
echo "Address         Port        Address         Port"
echo "0.0.0.0         3000        172.17.158.1    3000"
echo "0.0.0.0         3001        172.17.158.1    3001"

echo
echo -e "${CYAN}4. URLs para testar no celular/outros dispositivos:${NC}"
echo -e "${GREEN}📱 PublicWebsite: http://192.168.15.120:3000${NC}"
echo -e "${GREEN}📱 AdminDashboard: http://192.168.15.120:3001${NC}"

echo
echo -e "${YELLOW}💡 Dicas de troubleshooting:${NC}"
echo "- Certifique-se de que o script PowerShell foi executado como Administrador"
echo "- Verifique se o Windows Defender Firewall não está bloqueando as portas"
echo "- Confirme que o celular está na mesma rede WiFi (192.168.15.x)"
echo "- Teste primeiro no navegador do Windows: http://192.168.15.120:3000"

echo
echo -e "${GREEN}Teste concluído!${NC}"