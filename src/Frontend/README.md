# Frontend - Casa de Caridade Batuara

Este diretório contém os dois projetos frontend da Casa de Caridade Batuara:

## 🌐 Site Público (`PublicWebsite`)
Interface pública para visitantes da Casa de Caridade Batuara.

**Funcionalidades:**
- Página inicial com informações da casa
- Seção sobre a história e missão
- Calendário de eventos e atendimentos
- Informações sobre Orixás e Linhas de Umbanda
- Orações e conteúdo espiritual
- Sistema de doações via PIX
- Formulário de contato

## 🔧 Dashboard Administrativo (`AdminDashboard`)
Interface administrativa para gerenciamento do conteúdo.

**Funcionalidades:**
- Sistema de autenticação
- Dashboard com estatísticas
- Gerenciamento de eventos
- Administração do calendário
- Controle de conteúdo espiritual
- Gerenciamento de Orixás e Linhas de Umbanda

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Executar Ambos os Projetos com um Comando
```bash
# Na raiz do diretório Frontend
./start-both.sh
```

### Site Público
```bash
cd PublicWebsite
npm install
npm start
```
Acesse: http://localhost:3000

### Dashboard Administrativo
```bash
cd AdminDashboard
npm install
PORT=3001 npm start
```
Acesse: http://localhost:3001

## 🔐 Autenticação (Dashboard)

Para acessar o dashboard administrativo, use as credenciais:
- **Email**: `<email-admin>`
- **Senha**: `<senha-admin>`

*Nota: Estas são credenciais de desenvolvimento. Em produção, use credenciais seguras.*

## 🎨 Temas e Design

Ambos os projetos utilizam Material-UI v5 com tema personalizado baseado nas cores da Casa Batuara:

- **Azul Primário**: #1976d2 (Azul de Yemanjá)
- **Laranja Secundário**: #f57c00 (Laranja de Iansã)
- **Verde**: #388e3c (Verde de Oxóssi)
- **Amarelo**: #f9a825 (Amarelo de Oxum)

## 📱 Responsividade

Ambas as interfaces são totalmente responsivas e funcionam em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Material-UI v5** para componentes
- **React Router v6** para navegação
- **TanStack Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Date-fns** para manipulação de datas
- **Axios** para requisições HTTP

## 📂 Estrutura dos Projetos

```
Frontend/
├── PublicWebsite/          # Site público
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── theme/          # Configuração do tema
│   │   ├── types/          # Tipos TypeScript
│   │   ├── data/           # Dados mock
│   │   └── App.tsx         # Componente principal
│   └── public/             # Arquivos estáticos
│
└── AdminDashboard/         # Dashboard administrativo
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas do dashboard
    │   ├── contexts/       # Contextos (Auth, etc.)
    │   ├── services/       # Serviços de API
    │   ├── theme/          # Configuração do tema
    │   └── types/          # Tipos TypeScript
    └── public/             # Arquivos estáticos
```

## 🔄 Integração com Backend

Os projetos estão preparados para integração com a API backend:

- **Site Público**: Principalmente leitura de dados
- **Dashboard**: CRUD completo para todas as entidades

**Endpoints esperados:**
- `/api/events` - Gerenciamento de eventos
- `/api/calendar/attendances` - Horários de atendimento
- `/api/orixas` - Informações sobre Orixás
- `/api/umbanda-lines` - Linhas de Umbanda
- `/api/spiritual-contents` - Conteúdo espiritual
- `/api/auth/*` - Autenticação

## 📝 Notas de Desenvolvimento

### Modo de Desenvolvimento sem Backend
Atualmente, o Dashboard Admin está configurado para funcionar sem o backend, usando dados mockados para desenvolvimento. Isso permite visualizar e testar a interface sem depender da API.

### Credenciais de Desenvolvimento
- Email: `<email-admin>`
- Senha: `<senha-admin>`

## 🧪 Testes

Para executar os testes:

```bash
# Site Público
cd PublicWebsite && npm test

# Dashboard
cd AdminDashboard && npm test
```

## 📦 Build para Produção

```bash
# Site Público
cd PublicWebsite && npm run build

# Dashboard
cd AdminDashboard && npm run build
```

Os arquivos de build estarão nas pastas `build/` de cada projeto.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento da Casa de Caridade Batuara.
