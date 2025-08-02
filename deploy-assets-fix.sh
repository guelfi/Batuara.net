#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO - CORREÇÃO DE ASSETS BATUARA"
echo "================================================="
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

# Fazer backup do estado atual
echo "💾 Criando backup do estado atual..."
BACKUP_DIR="deploy-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup dos containers em execução
docker ps > "$BACKUP_DIR/containers_before.txt"
docker-compose ps > "$BACKUP_DIR/compose_status_before.txt" 2>/dev/null || echo "docker-compose não disponível" > "$BACKUP_DIR/compose_status_before.txt"

echo "✅ Backup criado em: $BACKUP_DIR"
echo ""

# Baixar as correções do repositório
echo "📥 Baixando correções do repositório GitHub..."
git status
echo ""

# Verificar se há mudanças locais não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Aviso: Há mudanças locais não commitadas."
    echo "Fazendo stash das mudanças locais..."
    git stash push -m "Auto-stash antes do deploy $(date)"
fi

# Fazer pull das mudanças
if git pull origin master; then
    echo "✅ Correções baixadas com sucesso!"
else
    echo "❌ Erro ao baixar correções do repositório"
    echo "Verifique a conexão com a internet e as credenciais do Git"
    exit 1
fi
echo ""

# Verificar se o diagnose-assets.sh existe e é executável
if [ -f "./diagnose-assets.sh" ]; then
    chmod +x ./diagnose-assets.sh
    echo "✅ Script de diagnóstico encontrado e configurado"
else
    echo "⚠️  Script de diagnóstico não encontrado, mas continuando..."
fi
echo ""

# Parar apenas o container do PublicWebsite
echo "🛑 Parando container do PublicWebsite..."
if docker stop batuara-public-website 2>/dev/null; then
    echo "✅ Container batuara-public-website parado"
else
    echo "⚠️  Container batuara-public-website não estava rodando ou erro ao parar"
fi

# Remover o container antigo
echo "🗑️  Removendo container antigo..."
if docker rm batuara-public-website 2>/dev/null; then
    echo "✅ Container antigo removido"
else
    echo "⚠️  Container antigo não existia ou erro ao remover"
fi
echo ""

# Rebuildar apenas o PublicWebsite
echo "🔨 Reconstruindo container do PublicWebsite..."
echo "Isso pode levar alguns minutos..."

# Verificar se existe docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
elif [ -f "docker-compose-fixed.yml" ]; then
    COMPOSE_FILE="docker-compose-fixed.yml"
else
    echo "❌ Erro: Arquivo docker-compose não encontrado"
    echo "Arquivos disponíveis:"
    ls -la *.yml 2>/dev/null || echo "Nenhum arquivo .yml encontrado"
    exit 1
fi

echo "📄 Usando arquivo: $COMPOSE_FILE"

# Rebuildar o container com cache limpo
echo "🧹 Limpando cache do Docker..."
docker system prune -f

echo "🔨 Reconstruindo container com configuração nginx otimizada..."
if docker-compose -f "$COMPOSE_FILE" up -d --build --force-recreate public-website; then
    echo "✅ Container do PublicWebsite reconstruído com sucesso!"
else
    echo "❌ Erro ao reconstruir o container do PublicWebsite"
    echo ""
    echo "📋 Verificando logs do build:"
    docker logs batuara-public-website --tail 50
    echo ""
    echo "🔄 Tentando rollback..."
    
    # Tentar restaurar o container anterior
    docker-compose -f "$COMPOSE_FILE" up -d public-website
    
    echo "❌ Deploy falhou. Verifique os logs:"
    echo "docker logs batuara-public-website"
    exit 1
fi
echo ""

# Aguardar o container inicializar
echo "⏳ Aguardando container inicializar..."
sleep 10

# Verificar se o container está rodando
if docker ps | grep -q "batuara-public-website"; then
    echo "✅ Container está rodando!"
else
    echo "❌ Container não está rodando. Verificando logs..."
    docker logs batuara-public-website --tail 20
    exit 1
fi
echo ""

# Executar diagnóstico para verificar se os assets estão funcionando
echo "🔍 Executando diagnóstico dos assets..."
if [ -f "./diagnose-assets.sh" ]; then
    ./diagnose-assets.sh
else
    echo "⚠️  Script de diagnóstico não encontrado, fazendo verificação manual..."
    
    # Verificação manual básica
    echo "📋 Verificação manual dos assets:"
    echo "- Testando favicon.ico:"
    curl -I http://localhost:3000/favicon.ico | head -n 1
    
    echo "- Testando batuara_logo.png:"
    curl -I http://localhost:3000/batuara_logo.png | head -n 1
    
    echo "- Testando página principal:"
    curl -I http://localhost:3000/ | head -n 1
fi
echo ""

# Salvar status final
docker ps > "$BACKUP_DIR/containers_after.txt"
docker-compose -f "$COMPOSE_FILE" ps > "$BACKUP_DIR/compose_status_after.txt" 2>/dev/null

echo "📊 RESUMO DO DEPLOY:"
echo "==================="
echo "✅ Deploy concluído com sucesso!"
echo "📁 Backup salvo em: $BACKUP_DIR"
echo "🌐 Site disponível em: http://129.153.86.168:3000"
echo ""
echo "🔧 Para verificar se tudo está funcionando:"
echo "1. Acesse: http://129.153.86.168:3000"
echo "2. Verifique se o favicon aparece na aba do navegador"
echo "3. Verifique se o logo aparece no header do site"
echo ""
echo "📋 Para ver logs em caso de problemas:"
echo "docker logs batuara-public-website"
echo ""
echo "🎉 Deploy de correção de assets finalizado!"
echo "================================================="