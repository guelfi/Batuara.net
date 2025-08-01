#!/bin/bash

echo "🔄 ATUALIZAÇÃO AUTOMÁTICA DO SERVIDOR BATUARA"
echo "============================================="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo ""

# Definir diretório do projeto
PROJECT_DIR="/var/www/batuara_net"

# Verificar se estamos no diretório correto
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Erro: Diretório do projeto não encontrado: $PROJECT_DIR"
    echo "Execute este script no servidor Oracle onde o projeto está instalado."
    exit 1
fi

# Navegar para o diretório do projeto
echo "📁 Navegando para o diretório do projeto..."
cd "$PROJECT_DIR" || {
    echo "❌ Erro: Não foi possível acessar o diretório $PROJECT_DIR"
    exit 1
}

echo "✅ Diretório atual: $(pwd)"
echo ""

# Mostrar status atual do Git
echo "📋 Status atual do repositório:"
git status --porcelain
echo ""

# Fazer backup de mudanças locais se existirem
echo "💾 Verificando mudanças locais..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Encontradas mudanças locais não commitadas."
    echo "Fazendo backup (stash) das mudanças locais..."
    git stash push -m "Auto-backup antes da atualização $(date)"
    echo "✅ Backup das mudanças locais criado"
else
    echo "✅ Nenhuma mudança local encontrada"
fi
echo ""

# Baixar atualizações do repositório
echo "📥 Baixando atualizações do GitHub..."
echo "Repositório: $(git remote get-url origin)"
echo "Branch atual: $(git branch --show-current)"
echo ""

if git pull origin master; then
    echo "✅ Atualizações baixadas com sucesso!"
    
    # Mostrar o que foi atualizado
    echo ""
    echo "📄 Arquivos atualizados:"
    git log --oneline -5 --pretty=format:"  %h - %s (%cr)"
    echo ""
    
else
    echo "❌ Erro ao baixar atualizações do repositório"
    echo "Possíveis causas:"
    echo "- Problema de conexão com a internet"
    echo "- Conflitos de merge"
    echo "- Problemas de autenticação"
    echo ""
    echo "🔧 Para resolver manualmente:"
    echo "git status"
    echo "git pull origin master"
    exit 1
fi
echo ""

# Verificar se há scripts executáveis novos
echo "🔧 Verificando scripts disponíveis..."
SCRIPTS=(
    "deploy-assets-fix.sh"
    "diagnose-assets.sh" 
    "fix-favicon-complete.sh"
    "deploy.sh"
    "setup-database.sh"
)

echo "Scripts encontrados:"
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script" 2>/dev/null
        echo "  ✅ $script (executável)"
    else
        echo "  ❌ $script (não encontrado)"
    fi
done
echo ""

# Verificar status dos containers
echo "🐳 Status atual dos containers:"
if command -v docker >/dev/null 2>&1; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep batuara || echo "Nenhum container Batuara rodando"
else
    echo "Docker não encontrado"
fi
echo ""

# Sugerir próximos passos
echo "🎯 PRÓXIMOS PASSOS SUGERIDOS:"
echo "=============================="
echo ""
echo "Para aplicar correções de assets:"
echo "  ./deploy-assets-fix.sh"
echo ""
echo "Para diagnóstico completo:"
echo "  ./diagnose-assets.sh"
echo ""
echo "Para deploy completo:"
echo "  ./deploy.sh"
echo ""
echo "Para verificar logs dos containers:"
echo "  docker logs batuara-public-website"
echo "  docker logs batuara-admin-dashboard"
echo ""
echo "✅ Atualização do servidor concluída!"
echo "============================================="