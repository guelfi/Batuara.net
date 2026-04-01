#!/bin/bash

echo "🏠 Casa de Caridade Batuara - Frontend Development Setup"
echo "======================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js 16+ antes de continuar.${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${RED}❌ Node.js versão 16+ é necessária. Versão atual: $(node -v)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"
}

# Função para instalar dependências
install_dependencies() {
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    
    # Instalar dependências do site público
    echo -e "${YELLOW}🌐 Instalando dependências do site público...${NC}"
    cd public-website
    if npm install; then
        echo -e "${GREEN}✅ Dependências do site público instaladas${NC}"
    else
        echo -e "${RED}❌ Erro ao instalar dependências do site público${NC}"
        exit 1
    fi
    cd ..
    
    # Instalar dependências do dashboard
    echo -e "${YELLOW}🔧 Instalando dependências do dashboard administrativo...${NC}"
    cd AdminDashboard
    if npm install; then
        echo -e "${GREEN}✅ Dependências do dashboard instaladas${NC}"
    else
        echo -e "${RED}❌ Erro ao instalar dependências do dashboard${NC}"
        exit 1
    fi
    cd ..
    
    # Instalar concurrently para executar ambos
    echo -e "${YELLOW}⚙️ Instalando ferramentas de desenvolvimento...${NC}"
    if npm install; then
        echo -e "${GREEN}✅ Ferramentas instaladas${NC}"
    else
        echo -e "${RED}❌ Erro ao instalar ferramentas${NC}"
        exit 1
    fi
}

# Função para iniciar os servidores
start_servers() {
    echo -e "${BLUE}🚀 Iniciando servidores de desenvolvimento...${NC}"
    echo ""
    echo -e "${GREEN}📱 Site Público:${NC} http://localhost:3000"
    echo -e "${GREEN}🔧 Dashboard Admin:${NC} http://localhost:3001"
    echo ""
    echo -e "${YELLOW}💡 Credenciais do Dashboard:${NC}"
    echo -e "   Email: <email-admin>"
    echo -e "   Senha: <senha-admin>"
    echo ""
    echo -e "${BLUE}🔄 Iniciando ambos os projetos...${NC}"
    echo "   (Use Ctrl+C para parar ambos os servidores)"
    echo ""
    
    npm run start:all
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${BLUE}Escolha uma opção:${NC}"
    echo "1) 🌐 Executar apenas o Site Público (porta 3000)"
    echo "2) 🔧 Executar apenas o Dashboard Admin (porta 3001)"
    echo "3) 🚀 Executar ambos simultaneamente"
    echo "4) 📦 Apenas instalar dependências"
    echo "5) ❌ Sair"
    echo ""
    read -p "Digite sua escolha (1-5): " choice
    
    case $choice in
        1)
            echo -e "${GREEN}🌐 Iniciando Site Público...${NC}"
            cd public-website && npm start
            ;;
        2)
            echo -e "${GREEN}🔧 Iniciando Dashboard Admin...${NC}"
            cd AdminDashboard && PORT=3001 npm start
            ;;
        3)
            start_servers
            ;;
        4)
            install_dependencies
            echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
            ;;
        5)
            echo -e "${BLUE}👋 Até logo!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida. Tente novamente.${NC}"
            show_menu
            ;;
    esac
}

# Execução principal
main() {
    check_node
    
    # Verificar se as dependências já estão instaladas
    if [ ! -d "public-website/node_modules" ] || [ ! -d "AdminDashboard/node_modules" ] || [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Dependências não encontradas. Instalando...${NC}"
        install_dependencies
    else
        echo -e "${GREEN}✅ Dependências já instaladas${NC}"
    fi
    
    show_menu
}

# Executar script principal
main
