#!/bin/bash

echo "🔧 CORREÇÃO COMPLETA DE FAVICON E LOGO"
echo "======================================"
echo "Corrigindo problemas de favicon e logo em ambos os projetos"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "src/Frontend/PublicWebsite" ] || [ ! -d "src/Frontend/AdminDashboard" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Batuara.net"
    exit 1
fi

echo "📁 Verificando assets existentes..."

# Verificar assets do PublicWebsite
echo "PublicWebsite assets:"
ls -la src/Frontend/PublicWebsite/public/ | grep -E "(favicon|logo|\.png|\.ico)"

echo ""
echo "AdminDashboard assets:"
ls -la src/Frontend/AdminDashboard/public/ | grep -E "(favicon|logo|\.png|\.ico)"

echo ""
echo "🔄 Copiando assets necessários..."

# Copiar favicon.png como favicon.ico para ambos os projetos
cp src/Frontend/PublicWebsite/public/favicon.png src/Frontend/PublicWebsite/public/favicon.ico
cp src/Frontend/PublicWebsite/public/favicon.png src/Frontend/AdminDashboard/public/favicon.ico

# Copiar logo para AdminDashboard
cp src/Frontend/PublicWebsite/public/batuara_logo.png src/Frontend/AdminDashboard/public/

# Copiar outros assets necessários
cp src/Frontend/PublicWebsite/public/logo192.png src/Frontend/AdminDashboard/public/ 2>/dev/null || echo "logo192.png não encontrado, ignorando..."
cp src/Frontend/PublicWebsite/public/logo512.png src/Frontend/AdminDashboard/public/ 2>/dev/null || echo "logo512.png não encontrado, ignorando..."

echo "✅ Assets copiados!"
echo ""

echo "📄 Verificando arquivos index.html..."

# Verificar se os index.html estão corretos
echo "PublicWebsite index.html favicon reference:"
grep -n "favicon" src/Frontend/PublicWebsite/public/index.html

echo ""
echo "AdminDashboard index.html favicon reference:"
grep -n "favicon" src/Frontend/AdminDashboard/public/index.html

echo ""
echo "📊 Resultado final:"
echo "PublicWebsite assets:"
ls -la src/Frontend/PublicWebsite/public/ | grep -E "(favicon|logo|\.png|\.ico)"

echo ""
echo "AdminDashboard assets:"
ls -la src/Frontend/AdminDashboard/public/ | grep -E "(favicon|logo|\.png|\.ico)"

echo ""
echo "✅ Correção completa finalizada!"
echo ""
echo "🚀 Próximos passos:"
echo "1. Teste localmente: npm start em ambos os projetos"
echo "2. Faça commit das mudanças: git add . && git commit -m 'fix: corrigir favicon e assets em ambos os projetos'"
echo "3. Faça push: git push origin master"
echo "4. Execute deploy no servidor: ./deploy-assets-fix.sh"