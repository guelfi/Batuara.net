#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando API de Autenticação Batuara ===${NC}"

# Verificar se o dotnet está instalado
if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}Erro: dotnet não está instalado. Por favor, instale o .NET SDK.${NC}"
    exit 1
fi

# Verificar se o PostgreSQL está em execução
echo -e "${YELLOW}Verificando conexão com o PostgreSQL...${NC}"
if ! command -v pg_isready &> /dev/null; then
    echo -e "${YELLOW}Aviso: pg_isready não encontrado, não é possível verificar o status do PostgreSQL.${NC}"
else
    if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${RED}Erro: PostgreSQL não está em execução na porta 5432.${NC}"
        echo -e "${YELLOW}Por favor, inicie o PostgreSQL antes de continuar.${NC}"
        exit 1
    else
        echo -e "${GREEN}PostgreSQL está em execução.${NC}"
    fi
fi

# Restaurar pacotes
echo -e "${YELLOW}Restaurando pacotes...${NC}"
dotnet restore

# Compilar o projeto
echo -e "${YELLOW}Compilando o projeto...${NC}"
dotnet build --no-restore

# Verificar se há migrações pendentes
echo -e "${YELLOW}Verificando migrações...${NC}"
if [ ! -d "Migrations" ] || [ -z "$(ls -A Migrations)" ]; then
    echo -e "${YELLOW}Nenhuma migração encontrada. Criando migração inicial...${NC}"
    dotnet ef migrations add InitialCreate
fi

# Aplicar migrações
echo -e "${YELLOW}Aplicando migrações...${NC}"
dotnet ef database update

# Iniciar a API
echo -e "${GREEN}Iniciando a API na porta 3003...${NC}"
echo -e "${BLUE}Acesse a documentação Swagger em: http://localhost:3003/swagger${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para encerrar.${NC}"
dotnet run --urls="http://localhost:3003"