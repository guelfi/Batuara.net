#!/bin/bash
echo "🛑 Parando sistema Batuara.net..."

if kill 66373 2>/dev/null; then
    echo "✅ API parada (PID: 66373)"
else
    echo "⚠️  API já estava parada ou PID não encontrado"
fi

if kill 66382 2>/dev/null; then
    echo "✅ PublicWebsite parado (PID: 66382)"
else
    echo "⚠️  PublicWebsite já estava parado ou PID não encontrado"
fi

if kill 66410 2>/dev/null; then
    echo "✅ AdminDashboard parado (PID: 66410)"
else
    echo "⚠️  AdminDashboard já estava parado ou PID não encontrado"
fi

echo "🧹 Limpando arquivos de log..."
rm -f api.log publicwebsite.log admindashboard.log

echo "✅ Sistema parado completamente!"
