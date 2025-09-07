#!/bin/bash
echo "🛑 Parando sistema Batuara.net..."

if kill 4701 2>/dev/null; then
    echo "✅ API parada (PID: 4701)"
else
    echo "⚠️  API já estava parada ou PID não encontrado"
fi

if kill 4709 2>/dev/null; then
    echo "✅ PublicWebsite parado (PID: 4709)"
else
    echo "⚠️  PublicWebsite já estava parado ou PID não encontrado"
fi

if kill 4734 2>/dev/null; then
    echo "✅ AdminDashboard parado (PID: 4734)"
else
    echo "⚠️  AdminDashboard já estava parado ou PID não encontrado"
fi

echo "🧹 Limpando arquivos de log..."
rm -f api.log publicwebsite.log admindashboard.log

echo "✅ Sistema parado completamente!"
