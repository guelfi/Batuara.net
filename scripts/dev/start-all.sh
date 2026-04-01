#!/bin/bash

echo "🏠 Iniciando Batuara.net - Sistema Completo"
echo "=========================================="
echo ""

echo "🔧 Verificando dependências..."

# Verificar se dotnet está instalado
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET não está instalado. Instale o .NET 6.0 ou superior."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js/npm não está instalado."
    exit 1
fi

echo "✅ Dependências verificadas!"
echo ""

echo "🚀 Iniciando API na porta 3003..."
cd src/Backend/Batuara.API

# Verificar se a porta 3003 está em uso
if lsof -i :3003 > /dev/null 2>&1; then
    echo "⚠️  Porta 3003 está em uso. Tentando encerrar processo..."
    lsof -ti :3003 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Definir a URL da aplicação
export ASPNETCORE_URLS="http://localhost:3003"

# Iniciar API em background
dotnet run --project Batuara.API.csproj > ../../../api.log 2>&1 &
API_PID=$!
cd ../../..

echo "API iniciada (PID: $API_PID)"
echo "Aguardando API inicializar... (10 segundos)"
sleep 10

echo ""
echo "📱 Iniciando PublicWebsite na porta 3000..."
cd src/Frontend/PublicWebsite
npm start > ../../../publicwebsite.log 2>&1 &
PUBLICWEBSITE_PID=$!
cd ../../..

echo "PublicWebsite iniciado (PID: $PUBLICWEBSITE_PID)"
sleep 5

echo ""
echo "🔧 Iniciando AdminDashboard na porta 3001..."
cd src/Frontend/AdminDashboard
npm start > ../../../admindashboard.log 2>&1 &
ADMINDASHBOARD_PID=$!
cd ../../..

echo "AdminDashboard iniciado (PID: $ADMINDASHBOARD_PID)"

echo ""
echo "✅ Sistema Batuara.net iniciado!"
echo "================================================"
echo "🚀 API: http://localhost:3003"
echo "   📋 Swagger: http://localhost:3003/swagger"
echo "📱 PublicWebsite: http://localhost:3000"
echo "🔧 AdminDashboard: http://localhost:3001"
echo ""
echo "💡 Credenciais do Dashboard:"
echo "   Email: <email-admin>"
echo "   Senha: <senha-admin>"
echo ""
echo "📋 Logs disponíveis em:"
echo "   API: api.log"
echo "   PublicWebsite: publicwebsite.log"
echo "   AdminDashboard: admindashboard.log"
echo ""
echo "🛑 Para parar o sistema:"
echo "   kill $API_PID $PUBLICWEBSITE_PID $ADMINDASHBOARD_PID"
echo "   ou execute: ./stop-all.sh"

# Criar script de parada completo
cat > stop-all.sh << EOF
#!/bin/bash
echo "🛑 Parando sistema Batuara.net..."

if kill $API_PID 2>/dev/null; then
    echo "✅ API parada (PID: $API_PID)"
else
    echo "⚠️  API já estava parada ou PID não encontrado"
fi

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
rm -f api.log publicwebsite.log admindashboard.log

echo "✅ Sistema parado completamente!"
EOF

chmod +x stop-all.sh

echo ""
echo "Aguardando inicialização completa... (15 segundos)"
sleep 15

echo ""
echo "🔍 Verificando status do sistema..."

if curl -s http://localhost:3003/health > /dev/null 2>&1 || curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo "✅ API está respondendo em http://localhost:3003"
else
    echo "❌ API não está respondendo - verifique api.log"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ PublicWebsite está respondendo em http://localhost:3000"
else
    echo "❌ PublicWebsite não está respondendo - verifique publicwebsite.log"
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ AdminDashboard está respondendo em http://localhost:3001"
else
    echo "❌ AdminDashboard não está respondendo - verifique admindashboard.log"
fi

echo ""
echo "🎉 Teste geral concluído!"
echo "Acesse as aplicações nos links acima para testar."

read -p "Pressione Enter para continuar..."
