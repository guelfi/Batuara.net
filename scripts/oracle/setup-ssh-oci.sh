#!/bin/bash

# Script para configurar SSH com OCI
# Autor: Sistema de Deploy Multi-Projeto
# Data: $(date +%Y-%m-%d)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações OCI
OCI_HOST="129.153.86.168"
OCI_USER="ubuntu"
SSH_KEY="ssh-key-2025-08-28.key"

echo -e "${BLUE}=== Configuração SSH para OCI ===${NC}"
echo -e "Host: ${GREEN}$OCI_HOST${NC}"
echo -e "Usuário: ${GREEN}$OCI_USER${NC}"
echo -e "Chave: ${GREEN}$SSH_KEY${NC}"
echo

# Verificar se a chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ Chave SSH não encontrada: $SSH_KEY${NC}"
    echo -e "${YELLOW}Certifique-se de que o arquivo está no diretório raiz do projeto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Chave SSH encontrada${NC}"

# Configurar permissões da chave
echo -e "${BLUE}🔧 Configurando permissões da chave SSH...${NC}"
chmod 600 "$SSH_KEY"
echo -e "${GREEN}✅ Permissões configuradas${NC}"

# Testar conexão SSH
echo -e "${BLUE}🔍 Testando conexão SSH...${NC}"
if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$OCI_USER@$OCI_HOST" "echo 'Conexão SSH funcionando!'" 2>/dev/null; then
    echo -e "${GREEN}✅ Conexão SSH estabelecida com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha na conexão SSH${NC}"
    echo -e "${YELLOW}Verifique:${NC}"
    echo -e "  - Se a chave SSH está correta"
    echo -e "  - Se o IP está acessível: $OCI_HOST"
    echo -e "  - Se o usuário está correto: $OCI_USER"
    exit 1
fi

# Configurar SSH config (opcional)
echo
read -p "Deseja configurar um alias SSH 'oci-batuara'? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SSH_CONFIG="$HOME/.ssh/config"
    
    # Criar diretório .ssh se não existir
    mkdir -p "$HOME/.ssh"
    
    # Verificar se já existe configuração
    if grep -q "Host oci-batuara" "$SSH_CONFIG" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Configuração 'oci-batuara' já existe em $SSH_CONFIG${NC}"
    else
        echo -e "${BLUE}📝 Adicionando configuração SSH...${NC}"
        cat >> "$SSH_CONFIG" << EOF

# Batuara.net OCI Server
Host oci-batuara
  HostName $OCI_HOST
  User $OCI_USER
  IdentityFile $(pwd)/$SSH_KEY
  StrictHostKeyChecking no
EOF
        echo -e "${GREEN}✅ Configuração SSH adicionada${NC}"
        echo -e "${BLUE}Agora você pode conectar usando: ${GREEN}ssh oci-batuara${NC}"
    fi
fi

# Verificar Docker no servidor
echo
echo -e "${BLUE}🐳 Verificando Docker no servidor OCI...${NC}"
if ssh -i "$SSH_KEY" "$OCI_USER@$OCI_HOST" "docker --version && docker-compose --version" 2>/dev/null; then
    echo -e "${GREEN}✅ Docker e Docker Compose estão instalados${NC}"
else
    echo -e "${YELLOW}⚠️  Docker ou Docker Compose não encontrados no servidor${NC}"
    echo -e "${BLUE}Você pode instalar usando:${NC}"
    echo -e "  ssh -i $SSH_KEY $OCI_USER@$OCI_HOST"
    echo -e "  sudo apt update && sudo apt install -y docker.io docker-compose"
fi

# Verificar espaço em disco
echo
echo -e "${BLUE}💾 Verificando espaço em disco...${NC}"
ssh -i "$SSH_KEY" "$OCI_USER@$OCI_HOST" "df -h /" 2>/dev/null || echo -e "${YELLOW}⚠️  Não foi possível verificar espaço em disco${NC}"

echo
echo -e "${GREEN}🎉 Configuração SSH concluída!${NC}"
echo -e "${BLUE}Próximos passos:${NC}"
echo -e "  1. Configure os GitHub Secrets com o conteúdo da chave SSH"
echo -e "  2. Execute o deploy: git push origin main"
echo -e "  3. Monitore os logs: ./scripts/oracle/multi-project-manager.sh logs"
echo