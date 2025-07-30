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
- **ScrollToTopButton** - Sistema de navegação avançado
- **React Query** - Gerenciamento de estado (planejado)
- **React Router v6** - Roteamento
- **Jest + React Testing Library** - Testes unitários

## 🎨 Design System

O projeto utiliza **Material Design** com a paleta de cores baseada em **Yemanjá** (azul oceano), orixá principal da Casa Batuara.

### Cores Principais
- **Primary**: Azul de Yemanjá (tons oceânicos)
- **Secondary**: Cores dos Orixás utilizadas harmoniosamente
- **Neutral**: Tons de cinza e branco

## 📊 Funcionalidades

### Site Público
- ✅ Interface responsiva com Material Design
- ✅ **Sistema de navegação avançado com ScrollToTopButton**
- ✅ **Navegação suave entre seções com offsets otimizados**
- ✅ **Performance otimizada com throttling de eventos**
- ✅ Seções educativas sobre Orixás e Umbanda
- ✅ Calendário dinâmico de atendimentos
- ✅ Eventos e festas atualizados automaticamente
- ✅ Sistema de doações PIX
- ✅ Informações de contato e localização
- ✅ **Responsividade completa mobile/desktop**

### Dashboard Administrativo
- 🔄 Gerenciamento de eventos e festas (em desenvolvimento)
- 🔄 Administração do calendário de atendimentos (planejado)
- 🔄 Gestão de conteúdo espiritual (planejado)
- 🔄 Sistema de autenticação seguro (planejado)
- 🔄 Logs de auditoria (planejado)

## 🧪 Qualidade e Testes

- **Cobertura de Testes**: Meta 80%+ (em implementação)
- **Testes Unitários**: xUnit + Jest + React Testing Library
- **Testes de Acessibilidade**: axe-core (planejado)
- **Testes Cross-Browser**: Playwright (planejado)
- **Testes E2E**: Cypress (planejado)
- **Análise de Código**: SonarQube (planejado)
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

- [Especificação ScrollToTopButton](.kiro/specs/scroll-to-top-button/)
- [Próxima Fase do Projeto](.kiro/specs/project-next-phase/)
- [Roadmap de Desenvolvimento](ROADMAP_DESENVOLVIMENTO.md)
- [Contexto da Sessão](SESSION_CONTEXT.md)
- [Arquitetura e Design](docs/architecture.md) (planejado)
- [API Documentation](docs/api.md) (planejado)

## 🤝 Contribuição

Este projeto segue rigorosamente as práticas de:
- **Clean Architecture**
- **Domain-Driven Design (DDD)**
- **Princípios SOLID**
- **Clean Code**
- **Test-Driven Development (TDD)**

## 📄 Licença

Este projeto é desenvolvido para a Casa de Caridade Batuara.

## 🎯 Status Atual do Projeto

### ✅ Implementado (26/07/2025)
- **ScrollToTopButton** com navegação expandida
- **Navegação suave** entre todas as seções
- **Offsets otimizados** para mobile e desktop
- **Performance otimizada** com throttling
- **Responsividade completa**
- **Estados visuais dinâmicos**
- **🎨 Otimização de Interface**: Viewport optimization completa
- **📱 Cards Reestruturados**: Orixás e Guias/Entidades otimizados
- **⚡ Espaçamentos Reduzidos**: 25-50% de redução em padding
- **📋 Documentação**: [Otimizações de Interface](OTIMIZACOES_INTERFACE.md)

### 🔄 Em Desenvolvimento
- Testes unitários e de acessibilidade
- Backend .NET Core 8 LTS
- APIs de contato e eventos
- Sistema de autenticação

### 📋 Próximas Fases
1. **Testes e Qualidade** (2-3 semanas)
2. **Backend e APIs** (3-4 semanas)
3. **Sistema Administrativo** (4-5 semanas)
4. **Performance e SEO** (2-3 semanas)

**Estimativa Total**: 4-6 meses para conclusão completa

---

**Casa de Caridade Batuara** - Fundada em 07 de março de 1973  
*Última atualização: 26/07/2025*