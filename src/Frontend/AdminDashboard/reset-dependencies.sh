#!/bin/bash

echo "Removendo node_modules..."
rm -rf node_modules

echo "Removendo package-lock.json..."
rm -f package-lock.json

echo "Limpando cache do npm..."
npm cache clean --force

echo "Reinstalando dependências..."
npm install

echo "Concluído! Tente iniciar o AdminDashboard novamente com 'npm start'"