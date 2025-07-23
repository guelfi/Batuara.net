# Casa de Caridade Batuara - Sistema Moderno

Sistema web moderno para a Casa de Caridade Batuara, desenvolvido com tecnologias atuais e seguindo as melhores práticas de desenvolvimento.

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, implementando os padrões **SOLID** e práticas de **Clean Code**.

### Estrutura do Projeto

```
batuara.net/
├── src/
│   ├── Backend/
│   │   ├── Batuara.Domain/          # Camada de Domínio (DDD)
│   │   ├── Batuara.Application/     # Camada de Aplicação (CQRS)
│   │   ├── Batuara.Infrastructure/  # Camada de Infraestrutura
│   │   └── Batuara.API/            # Camada de Apresentação (Web API)
│   └── Frontend/
│       ├── PublicWebsite/          # Site público em React
│       └── AdminDashboard/         # Dashboard administrativo
├── tests/                          # Testes unitários e integração
├── docs/                          # Documentação
├── logs/                          # Arquivos de log
└── scripts/                       # Scripts de automação
```

## 🚀 Tecnologias

### Backend
- **.NET Core 8 LTS** - Framework principal
- **PostgreSQL** - Banco de dados
- **Entity Framework Core** - ORM
- **Serilog** - Logging estruturado
- **MediatR** - Padrão CQRS
- **AutoMapper** - Mapeamento de objetos
- **FluentValidation** - Validação
- **xUnit** - Testes unitários

### Frontend
- **React 18+** com **TypeScript**
- **Material-UI (MUI) v5** - Design System
- **React Query** - Gerenciamento de estado
- **React Router v6** - Roteamento
- **Jest** - Testes unitários

## 🎨 Design System

O projeto utiliza **Material Design** com a paleta de cores baseada em **Yemanjá** (azul oceano), orixá principal da Casa Batuara.

### Cores Principais
- **Primary**: Azul de Yemanjá (tons oceânicos)
- **Secondary**: Cores dos Orixás utilizadas harmoniosamente
- **Neutral**: Tons de cinza e branco

## 📊 Funcionalidades

### Site Público
- ✅ Interface responsiva com Material Design
- ✅ Seções educativas sobre Orixás e Umbanda
- ✅ Calendário dinâmico de atendimentos
- ✅ Eventos e festas atualizados automaticamente
- ✅ Sistema de doações PIX
- ✅ Informações de contato e localização

### Dashboard Administrativo
- ✅ Gerenciamento de eventos e festas
- ✅ Administração do calendário de atendimentos
- ✅ Gestão de conteúdo espiritual
- ✅ Sistema de autenticação seguro
- ✅ Logs de auditoria

## 🧪 Qualidade e Testes

- **Cobertura de Testes**: Mínimo 90%
- **Testes Unitários**: xUnit + Jest
- **Testes de Integração**: TestServer + MSW
- **Análise de Código**: SonarQube
- **Logging**: Estruturado com Serilog

## 📝 Logging

Sistema de logging estruturado com diferentes níveis e arquivos organizados:

```
logs/
├── application-{date}.log    # Logs gerais
├── error-{date}.log         # Logs de erro
├── audit-{date}.log         # Logs de auditoria
├── performance-{date}.log   # Logs de performance
└── security-{date}.log      # Logs de segurança
```

## 🚀 Como Executar

### Pré-requisitos
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

### Backend
```bash
cd src/Backend/Batuara.API
dotnet restore
dotnet run
```

### Frontend (Site Público)
```bash
cd src/Frontend/PublicWebsite
npm install
npm start
```

### Frontend (Dashboard Admin)
```bash
cd src/Frontend/AdminDashboard
npm install
npm start
```

### Testes
```bash
# Backend
dotnet test

# Frontend
npm test
```

## 📚 Documentação

- [Especificação Completa](.kiro/specs/batuara-modernization/)
- [Arquitetura e Design](docs/architecture.md)
- [Guia de Desenvolvimento](docs/development-guide.md)
- [API Documentation](docs/api.md)

## 🤝 Contribuição

Este projeto segue rigorosamente as práticas de:
- **Clean Architecture**
- **Domain-Driven Design (DDD)**
- **Princípios SOLID**
- **Clean Code**
- **Test-Driven Development (TDD)**

## 📄 Licença

Este projeto é desenvolvido para a Casa de Caridade Batuara.

---

**Casa de Caridade Batuara** - Fundada em 07 de março de 1973