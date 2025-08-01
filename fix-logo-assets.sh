#!/bin/bash

echo "🔧 CORREÇÃO DOS ASSETS - LOGO BATUARA"
echo "======================================"

# Fazer commit das alterações
echo "📝 Fazendo commit das correções..."
git add .
git commit -m "fix: corrigir importação do logo no Header.tsx para funcionar corretamente no build de produção"

# Fazer push para o repositório
echo "📤 Enviando alterações para o repositório..."
git push origin main

echo ""
echo "✅ Correções enviadas para o repositório!"
echo ""
echo "🚀 PRÓXIMOS PASSOS NO SERVIDOR ORACLE:"
echo "1. Execute: cd /home/ubuntu/Batuara.net"
echo "2. Execute: git pull origin main"
echo "3. Execute: ./deploy.sh"
echo ""
echo "Isso irá:"
echo "- Baixar as correções do repositório"
echo "- Rebuildar o container do PublicWebsite"
echo "- Aplicar as correções dos assets"
echo ""
echo "Após o deploy, o logo aparecerá corretamente no header!"