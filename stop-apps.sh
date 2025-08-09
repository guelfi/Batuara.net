#!/bin/bash
echo "Parando aplicações Batuara.net..."
if kill 63461 2>/dev/null; then
    echo "✅ PublicWebsite parado (PID: 63461)"
else
    echo "⚠️  PublicWebsite já estava parado ou PID não encontrado"
fi

if kill 63472 2>/dev/null; then
    echo "✅ AdminDashboard parado (PID: 63472)"
else
    echo "⚠️  AdminDashboard já estava parado ou PID não encontrado"
fi

echo "🧹 Limpando arquivos de log..."
rm -f publicwebsite.log admindashboard.log

echo "✅ Aplicações paradas!"
