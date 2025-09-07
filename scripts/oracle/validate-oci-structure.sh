#!/bin/bash

# Script para validar a estrutura do Batuara.net na OCI
# Verifica se todos os arquivos necessários estão no local correto

set -e

echo "🔍 Validando estrutura do Batuara.net na OCI..."

# Definir caminho base
BASE_DIR="/var/www/batuara_net"

# Verificar se o diretório base existe
if [ ! -d "$BASE_DIR" ]; then
    echo "❌ Diretório base não encontrado: $BASE_DIR"
    exit 1
fi

cd "$BASE_DIR"

echo "📁 Diretório atual: $(pwd)"
echo ""

# Arquivos essenciais que devem estar na raiz
ESSENTIAL_FILES=(
    "docker-compose.production.yml:Arquivo de produção do Docker Compose"
    "Dockerfile.api:Dockerfile da API"
    "Dockerfile.frontend:Dockerfile do Frontend"
    ".env.example:Arquivo de exemplo de variáveis de ambiente"
    ".env.production:Arquivo de produção de variáveis de ambiente"
    "Batuara.sln:Arquivo de solução do .NET"
    "README.md:Documentação principal"
)

# Diretórios essenciais
ESSENTIAL_DIRS=(
    "src:Código fonte"
    ".github:Configurações do GitHub"
    "scripts:Scripts de automação"
    "docs:Documentação"
    "tests:Testes"
)

# Arquivos específicos importantes
IMPORTANT_FILES=(
    ".github/workflows/deploy-oci.yml:Workflow de deploy"
    "scripts/oracle/port-manager.sh:Gerenciador de portas"
    "scripts/oracle/multi-project-manager.sh:Gerenciador multi-projeto"
    "src/Backend/Batuara.API/Batuara.API.csproj:Projeto da API"
    "src/Frontend/PublicWebsite/package.json:Configuração do website público"
    "src/Frontend/AdminDashboard/package.json:Configuração do dashboard admin"
)

echo "🔍 Verificando arquivos essenciais..."
FILES_OK=0
FILES_TOTAL=0

for item in "${ESSENTIAL_FILES[@]}"; do
    file=$(echo "$item" | cut -d':' -f1)
    desc=$(echo "$item" | cut -d':' -f2)
    FILES_TOTAL=$((FILES_TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo "✅ $file ($desc)"
        FILES_OK=$((FILES_OK + 1))
    else
        echo "❌ $file ($desc) - NÃO ENCONTRADO"
    fi
done

echo ""
echo "🔍 Verificando diretórios essenciais..."
DIRS_OK=0
DIRS_TOTAL=0

for item in "${ESSENTIAL_DIRS[@]}"; do
    dir=$(echo "$item" | cut -d':' -f1)
    desc=$(echo "$item" | cut -d':' -f2)
    DIRS_TOTAL=$((DIRS_TOTAL + 1))
    
    if [ -d "$dir" ]; then
        echo "✅ $dir/ ($desc)"
        DIRS_OK=$((DIRS_OK + 1))
    else
        echo "❌ $dir/ ($desc) - NÃO ENCONTRADO"
    fi
done

echo ""
echo "🔍 Verificando arquivos importantes..."
IMPORTANT_OK=0
IMPORTANT_TOTAL=0

for item in "${IMPORTANT_FILES[@]}"; do
    file=$(echo "$item" | cut -d':' -f1)
    desc=$(echo "$item" | cut -d':' -f2)
    IMPORTANT_TOTAL=$((IMPORTANT_TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo "✅ $file ($desc)"
        IMPORTANT_OK=$((IMPORTANT_OK + 1))
    else
        echo "⚠️  $file ($desc) - NÃO ENCONTRADO"
    fi
done

echo ""
echo "🔍 Verificando estrutura duplicada..."
DUPLICATE_ISSUES=0

# Verificar se existe subpasta Batuara.net com arquivos duplicados
if [ -d "Batuara.net" ]; then
    echo "⚠️  Pasta Batuara.net/ encontrada - possível duplicação"
    DUPLICATE_ISSUES=$((DUPLICATE_ISSUES + 1))
    
    # Listar conteúdo da pasta duplicada
    echo "📁 Conteúdo da pasta Batuara.net/:"
    ls -la "Batuara.net/" | head -10
    if [ $(ls -1 "Batuara.net/" | wc -l) -gt 10 ]; then
        echo "   ... e mais $(( $(ls -1 "Batuara.net/" | wc -l) - 10 )) itens"
    fi
else
    echo "✅ Nenhuma pasta Batuara.net/ duplicada encontrada"
fi

# Verificar arquivos soltos na raiz que podem ser duplicados
LOOSE_FILES=("*.sh" "*.md" "docker-compose*.yml")
echo ""
echo "🔍 Verificando arquivos soltos na raiz..."
for pattern in "${LOOSE_FILES[@]}"; do
    files=$(ls $pattern 2>/dev/null || true)
    if [ -n "$files" ]; then
        echo "📄 Arquivos $pattern encontrados:"
        echo "$files" | sed 's/^/   - /'
    fi
done

echo ""
echo "📊 RESUMO DA VALIDAÇÃO:"
echo "═══════════════════════════════════════"
echo "📁 Arquivos essenciais: $FILES_OK/$FILES_TOTAL"
echo "📁 Diretórios essenciais: $DIRS_OK/$DIRS_TOTAL"
echo "📁 Arquivos importantes: $IMPORTANT_OK/$IMPORTANT_TOTAL"
echo "🔄 Problemas de duplicação: $DUPLICATE_ISSUES"

# Calcular score geral
TOTAL_CHECKS=$((FILES_TOTAL + DIRS_TOTAL))
TOTAL_OK=$((FILES_OK + DIRS_OK))
SCORE=$((TOTAL_OK * 100 / TOTAL_CHECKS))

echo "📈 Score geral: $SCORE%"

if [ $SCORE -eq 100 ] && [ $DUPLICATE_ISSUES -eq 0 ]; then
    echo "🎉 ESTRUTURA PERFEITA! Tudo está no lugar correto."
    exit 0
elif [ $SCORE -ge 80 ] && [ $DUPLICATE_ISSUES -eq 0 ]; then
    echo "✅ ESTRUTURA BOA. Alguns arquivos opcionais podem estar faltando."
    exit 0
elif [ $DUPLICATE_ISSUES -gt 0 ]; then
    echo "⚠️  ESTRUTURA COM DUPLICAÇÃO. Execute o script de limpeza."
    echo "💡 Comando: bash scripts/oracle/cleanup-oci-structure.sh"
    exit 1
else
    echo "❌ ESTRUTURA COM PROBLEMAS. Verifique os arquivos faltantes."
    exit 1
fi