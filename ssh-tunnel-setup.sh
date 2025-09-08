#!/bin/bash

# Script para configurar SSH tunneling sem privilégios administrativos
# Permite acesso aos frontends via localhost no Windows

echo "=== Configuração de SSH Tunneling para Frontends ==="
echo "Este script configura túneis SSH para acessar os frontends do WSL no Windows"
echo ""

# Verificar se o SSH está disponível
if ! command -v ssh &> /dev/null; then
    echo "❌ SSH não está instalado. Instalando..."
    sudo apt update && sudo apt install -y openssh-client
fi

# Obter IP do WSL
WSL_IP=$(hostname -I | awk '{print $1}')
echo "📍 IP do WSL: $WSL_IP"

# Verificar se os frontends estão rodando
echo "🔍 Verificando frontends..."
if netstat -tuln | grep -q ":3000.*LISTEN"; then
    echo "✅ PublicWebsite rodando na porta 3000"
else
    echo "❌ PublicWebsite não está rodando na porta 3000"
fi

if netstat -tuln | grep -q ":3001.*LISTEN"; then
    echo "✅ AdminDashboard rodando na porta 3001"
else
    echo "❌ AdminDashboard não está rodando na porta 3001"
fi

echo ""
echo "=== Instruções para SSH Tunneling ==="
echo "1. Abra o PowerShell no Windows como usuário normal (não precisa ser admin)"
echo "2. Execute os seguintes comandos:"
echo ""
echo "   # Para PublicWebsite (porta 3000):"
echo "   ssh -L 3000:$WSL_IP:3000 $USER@$WSL_IP -N"
echo ""
echo "   # Para AdminDashboard (porta 3001):"
echo "   ssh -L 3001:$WSL_IP:3001 $USER@$WSL_IP -N"
echo ""
echo "3. Após executar os comandos, acesse:"
echo "   - PublicWebsite: http://localhost:3000"
echo "   - AdminDashboard: http://localhost:3001"
echo ""
echo "=== Alternativa: Acesso Direto via IP WSL ==="
echo "Você também pode acessar diretamente via:"
echo "   - PublicWebsite: http://$WSL_IP:3000"
echo "   - AdminDashboard: http://$WSL_IP:3001"
echo ""
echo "=== Configuração do SSH (se necessário) ==="
echo "Se o SSH não estiver configurado, execute:"
echo "   sudo systemctl enable ssh"
echo "   sudo systemctl start ssh"
echo ""
echo "✨ Configuração concluída!"