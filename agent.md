# Batuara.net - Documentação para Onboarding

## 🏠 Visão Geral do Projeto

**Batuara.net** é um sistema completo para a Casa de Caridade Caboclo Batuara, composto por:
- **PublicWebsite**: Website público da Casa de Caridade
- **AdminDashboard**: Painel administrativo seguro para gerenciamento de conteúdo e operações
- **API Backend**: API RESTful em .NET 8 robusta para autenticação, autorização e gerenciamento de dados

## 🚀 Estado Atual do Projeto

### ✅ Funcionalidades Implementadas
- **Autenticação Completa**:
  - Login seguro com JWT e Refresh Tokens
  - Proteção de rotas por Roles (Admin, Moderator, Editor)
  - Gerenciamento de sessão com logout automático por inatividade
  - Proteção contra ataques de força bruta e CSRF
- **Gestão de Usuários**:
  - Perfil de usuário editável
  - Alteração segura de senha
  - Histórico de atividades
- **Interface Administrativa**:
  - Dashboard responsivo e moderno (Material-UI)
  - Distribuição inteligente de cards estatísticos
  - Feedback visual e tratamento de erros aprimorado
- **Infraestrutura**:
  - Deploy containerizado (Docker)
  - Monitoramento automático de assets
  - Scripts de manutenção e backup

## 🗂️ Estrutura de Diretórios

```
Batuara.net/
├── src/
│   ├── Frontend/
│   │   ├── PublicWebsite/             # Website público (React + TypeScript)
│   │   └── AdminDashboard/            # Dashboard administrativo (React + TypeScript)
│   ├── Backend/
│   │   ├── Batuara.API/               # API principal (.NET 8)
│   │   ├── Batuara.Auth/              # Serviço de autenticação e identidade
│   │   ├── Batuara.Application/       # Camada de aplicação (Use Cases)
│   │   ├── Batuara.Domain/            # Entidades e regras de negócio
│   │   └── Batuara.Infrastructure/    # Acesso a dados e serviços externos
├── specs/                             # Especificações e documentação técnica
│   └── AUTH/                          # Detalhes da implementação de Autenticação
├── scripts/                           # Scripts de desenvolvimento e deploy
├── docker-compose.yml                 # Configuração Docker para desenvolvimento
├── docker-compose.production.yml      # Configuração Docker para produção
└── docs/                              # Documentação completa
```

## 🌐 Aplicações Frontend

### PublicWebsite (Porta 3000)
- **Tecnologias**: React 18, TypeScript, Material-UI
- **Funcionalidades**:
  - Página inicial institucional
  - Calendário de eventos
  - Informações sobre Orixás e Linhas de Umbanda
  - Sistema de doações via PIX
  - Formulário de contato

### AdminDashboard (Porta 3001)
- **Tecnologias**: React 18, TypeScript, Material-UI, TanStack Query, Axios
- **Funcionalidades**:
  - **Autenticação**: Login, Logout, Recuperação de Senha, "Lembrar-me"
  - **Dashboard**: Visão geral com estatísticas e gráficos
  - **Gestão**: Eventos, Conteúdo Espiritual, Usuários
  - **Perfil**: Edição de dados, Segurança, Preferências

## ⚙️ Backend API

### Batuara.Auth & API (Porta 3003)
- **Tecnologias**: .NET 8, Entity Framework Core, PostgreSQL
- **Segurança**:
  - JWT (JSON Web Tokens) com rotação de Refresh Tokens
  - BCrypt para hash de senhas
  - Rate Limiting e Throttling
  - Proteção CSRF e XSS
  - Headers de segurança (HSTS, CSP, etc.)

**Endpoints Principais**:
- `POST /api/auth/login` - Autenticação
- `POST /api/auth/refresh` - Renovação de token
- `POST /api/auth/revoke` - Logout/Revogação
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/change-password` - Alteração de senha

## 🐳 Docker e Deploy

### Desenvolvimento
- `docker-compose.yml`: Ambiente isolado para dev
- Scripts em `./scripts/dev/` para facilitar o dia a dia

### Produção
- `docker-compose.production.yml`: Otimizado para performance
- Containers:
  - `batuara-public-website`
  - `batuara-admin-dashboard`
  - `batuara-api`
  - `batuara-db` (PostgreSQL)

## ▶️ Como Iniciar (Onboarding)

### 1. Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para execução local sem Docker)
- .NET 8 SDK (para execução local sem Docker)

### 2. Iniciar Tudo (Docker)
```bash
# Na raiz do projeto
./scripts/dev/start-all.sh
```

### 3. Acessar Aplicações
- **PublicWebsite**: http://localhost:3000
- **AdminDashboard**: http://localhost:3001
- **API Swagger**: http://localhost:3003/swagger

### 4. Credenciais Padrão (Dev)
- **Email**: `<email-admin>`
- **Senha**: `<senha-admin>`

## 📚 Documentação Adicional
- **Status do Projeto**: `/docs/STATUS-PROJETO.md`
- **Detalhes de Auth**: `/specs/AUTH/AUTH_IMPLEMENTATION_SUMMARY.md`
- **Deploy**: `/docs/DEPLOY.md`
