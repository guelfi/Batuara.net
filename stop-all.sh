#!/bin/bash
echo "🛑 Parando sistema Batuara.net..."

if kill 3352 2>/dev/null; then
    echo "✅ API parada (PID: 3352)"
else
    echo "⚠️  API já estava parada ou PID não encontrado"
fi

if kill 3361 2>/dev/null; then
    echo "✅ PublicWebsite parado (PID: 3361)"
else
    echo "⚠️  PublicWebsite já estava parado ou PID não encontrado"
fi

if kill 3388 2>/dev/null; then
    echo "✅ AdminDashboard parado (PID: 3388)"
else
    echo "⚠️  AdminDashboard já estava parado ou PID não encontrado"
fi

echo "🧹 Limpando arquivos de log..."
rm -f api.log publicwebsite.log admindashboard.log

echo "✅ Sistema parado completamente!"
