# 🚀 Guia Rápido - Frontend Casa de Caridade Batuara

## Iniciar Ambos os Projetos
```bash
# Na pasta Frontend
./start-both.sh
```

## Acessar os Projetos
- 🌐 **Site Público**: http://localhost:3000
- 🔧 **Dashboard Admin**: http://localhost:3001

## Credenciais do Dashboard
- 📧 **Email**: admin@casabatuara.org.br
- 🔑 **Senha**: admin123

## Iniciar Projetos Separadamente

### Site Público
```bash
cd PublicWebsite
npm start
```

### Dashboard Admin
```bash
cd AdminDashboard
PORT=3001 npm start
```

## Observações Importantes
- O backend ainda não está implementado, então o Dashboard usa dados mockados
- As interfaces estão funcionando independentemente da API
- Todas as alterações feitas no Dashboard não serão persistidas até que o backend seja implementado

## Próximos Passos
1. Implementar o backend API (Task 3)
2. Conectar as interfaces ao backend
3. Implementar persistência de dados