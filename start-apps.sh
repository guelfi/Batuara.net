#!/bin/bash

echo "🏠 Iniciando Batuara.net Frontend Applications"
echo "============================================="
echo ""

echo "📱 PublicWebsite estará disponível em: http://localhost:3000"
echo "🔧 AdminDashboard estará disponível em: http://localhost:3001"
echo ""
echo "⚠️  Certifique-se de que as dependências estão instaladas:"
echo "   cd src/Frontend/PublicWebsite && npm install"
echo "   cd src/Frontend/AdminDashboard && npm install"
echo ""
echo "💡 Credenciais do Dashboard:"
echo "   Email: admin@casabatuara.org.br"
echo "   Senha: admin123"
echo ""

echo "Iniciando PublicWebsite na porta 3000..."
cd src/Frontend/PublicWebsite
npm start > ../../../publicwebsite.log 2>&1 &
PUBLICWEBSITE_PID=$!
cd ../../..

echo "PublicWebsite iniciado (PID: $PUBLICWEBSITE_PID)"
sleep 5

echo "Iniciando AdminDashboard na porta 3001..."
cd src/Frontend/AdminDashboard
npm start > ../../../admindashboard.log 2>&1 &
ADMINDASHBOARD_PID=$!
cd ../../..

echo "AdminDashboard iniciado (PID: $ADMINDASHBOARD_PID)"

echo ""
echo "✅ Aplicações iniciadas em background!"
echo "📱 PublicWebsite: http://localhost:3000 (PID: $PUBLICWEBSITE_PID)"
echo "🔧 AdminDashboard: http://localhost:3001 (PID: $ADMINDASHBOARD_PID)"
echo ""
echo "📋 Logs disponíveis em:"
echo "   PublicWebsite: publicwebsite.log"
echo "   AdminDashboard: admindashboard.log"
echo ""
echo "🛑 Para parar as aplicações:"
echo "   kill $PUBLICWEBSITE_PID $ADMINDASHBOARD_PID"
echo "   ou execute: ./stop-apps.sh"

# Criar script de parada
cat > stop-apps.sh << EOF
#!/bin/bash
echo "Parando aplicações Batuara.net..."
if kill $PUBLICWEBSITE_PID 2>/dev/null; then
    echo "✅ PublicWebsite parado (PID: $PUBLICWEBSITE_PID)"
else
    echo "⚠️  PublicWebsite já estava parado ou PID não encontrado"
fi

if kill $ADMINDASHBOARD_PID 2>/dev/null; then
    echo "✅ AdminDashboard parado (PID: $ADMINDASHBOARD_PID)"
else
    echo "⚠️  AdminDashboard já estava parado ou PID não encontrado"
fi

echo "🧹 Limpando arquivos de log..."
rm -f publicwebsite.log admindashboard.log

echo "✅ Aplicações paradas!"
EOF

chmod +x stop-apps.sh

echo ""
echo "Aguardando inicialização... (15 segundos)"
sleep 15

echo ""
echo "🔍 Verificando status das aplicações..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ PublicWebsite está respondendo em http://localhost:3000"
else
    echo "❌ PublicWebsite não está respondendo - verifique publicwebsite.log"
fi

if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ AdminDashboard está respondendo em http://localhost:3001"
else
    echo "❌ AdminDashboard não está respondendo - verifique admindashboard.log"
fi

read -p "Pressione Enter para continuar..."