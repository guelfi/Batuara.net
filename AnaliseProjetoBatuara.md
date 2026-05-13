# 📊 Análise Completa do Projeto Batuara.net

## 🎯 Visão Geral

O **Batuara.net** é uma plataforma web completa para a Casa de Caridade Caboclo Batuara, um centro espiritual dedicado aos ensinamentos de Umbanda e Kardecismo. O projeto é um monorepo que entrega três aplicações principais integradas:

- **Batuara.API** - API REST em .NET 8
- **PublicWebsite** - Website público em React 19
- **AdminDashboard** - Painel administrativo em React 19

O sistema está em fase funcional com módulos administrativos e públicos integrados, operando com backend .NET 8, banco PostgreSQL, autenticação JWT e módulos CMS reais.

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Alto Nível

```
                    +---------------------------------------------+
                    |              Nginx (Reverse Proxy)          |
                    |                                             |
                    |  /batuara-public/  -> Public Website        |
                    |  /batuara-admin/   -> Admin Dashboard       |
                    |  /batuara-api/     -> API .NET              |
                    +---------------------------------------------+
                         |                |                |
              +----------+                |                +---------+
              v                           v                          v
     +-----------------+      +--------------------+      +-----------------+
     |  Public Website |      |   Admin Dashboard  |      |    API .NET 8   |
     |  React + MUI    |      |   React + MUI      |      |   ASP.NET Core  |
     |  Port: 3000     |      |   Port: 3001       |      |   Port: 8080    |
     +-----------------+      +--------------------+      +--------+--------+
                                                                    |
                                                           +--------v--------+
                                                           |   PostgreSQL    |
                                                           |   Port: 5432    |
                                                           +-----------------+
```

### Regras Arquiteturais Importantes

- A API usa **PathBase `/batuara-api`**
- Os frontends operam como SPA servidas por Nginx
- O AdminDashboard consome rotas administrativas em `/batuara-api/api/*`
- O PublicWebsite consome rotas públicas em `/batuara-api/api/public/*`
- `SiteSettings` é o núcleo institucional compartilhado entre AdminDashboard e PublicWebsite

---

## 📁 Estrutura do Repositório

```
Batuara.net/
├── src/
│   ├── Backend/
│   │   ├── Batuara.API/              # API principal (controllers, middleware, config)
│   │   ├── Batuara.Application/      # Camada de aplicação (interfaces, models, DTOs)
│   │   ├── Batuara.Domain/           # Camada de domínio (entidades de negócio)
│   │   ├── Batuara.Infrastructure/   # Infraestrutura (EF Core, DbContext, serviços)
│   │   ├── Batuara.Auth/             # Módulo de autenticação
│   │   └── Batuara.Infrastructure.Tests/ # Testes de infraestrutura
│   └── Frontend/
│       ├── PublicWebsite/            # Website público da casa
│       └── AdminDashboard/           # Dashboard administrativo
├── docs/                             # Documentação completa
├── nginx/                            # Configurações do reverse proxy
├── scripts/                          # Scripts de automação
├── docker-compose.local.yml          # Orquestração para ambiente local
├── docker-compose.production.yml     # Orquestração para produção
├── Dockerfile.api                    # Build da API .NET
├── Dockerfile.frontend               # Build dos frontends
└── Dockerfile.admin                  # Build específico do admin
```

---

## 🔧 Stack Tecnológica

### Backend (.NET 8)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| .NET | 8.0 | Runtime e SDK |
| ASP.NET Core | 8.0 | Framework web / API REST |
| Entity Framework Core | 9.0 | ORM / acesso a dados |
| PostgreSQL | 16 | Banco de dados relacional |
| Serilog | 4.3 | Logging estruturado |
| FluentValidation | 11.11 | Validação de requisições |
| BCrypt.Net | 4.1 | Hash de senhas |
| JWT Bearer | 8.0 | Autenticação por token |
| AutoMapper | 16.1 | Mapeamento de objetos |
| Swagger/OpenAPI | 6.9 | Documentação da API |

### Frontend (React 19)

**AdminDashboard:**
- React 19.2.4
- TypeScript 6.0.2
- Material UI 7.3.9
- TanStack Query 5.96.2
- Axios 1.14.0
- React Router 7.14.0
- React Hook Form 7.72.1
- date-fns 4.1.0
- MUI X Data Grid 8.28.2
- MUI X Date Pickers 8.27.2

**PublicWebsite:**
- React 19.2.4
- TypeScript 6.0.2
- Material UI 7.3.9
- TanStack Query 5.96.2
- Axios 1.14.0
- React Router 7.14.0
- date-fns 4.1.0
- QRCode 1.5.4
- Playwright 1.55.0 (testes visuais)

### Infraestrutura

- Docker + Docker Compose (containerização e orquestração)
- Nginx (reverse proxy e servir arquivos estáticos)
- GitHub Actions (CI/CD)
- Oracle Cloud Infrastructure (servidor de produção - Always Free Tier)

---

## 🧩 Módulos Funcionais Implementados

### ✅ Autenticação e Segurança

- Login com JWT
- Refresh token automático
- Logout
- Verificação de sessão
- Perfil do usuário
- Alteração de senha
- Validação de força do JWT Secret
- Interceptor de refresh token no frontend

### ✅ Gestão de Conteúdo Institucional (SiteSettings)

**Campos gerenciados:**
- História institucional (título, subtítulo, HTML, missão)
- Informações de contato (e-mail, telefones, WhatsApp)
- Endereço estruturado (rua, número, complemento, bairro, cidade, estado, CEP)
- Mapa incorporado
- Redes sociais (Facebook, Instagram, YouTube, WhatsApp)
- Dados de doação (PIX, dados bancários)

**Características especiais:**
- Editor textual em tela cheia no AdminDashboard
- Sem preview dividido
- Sem suporte a imagem e vídeo (removido recentemente)
- Fallback automático para campos obrigatórios
- Fonte única de verdade para localização pública

### ✅ Calendário de Atendimentos

**Tipos de atendimento:**
- Kardecismo
- Umbanda
- Palestra
- Curso
- Festa

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Leitura pública com filtros
- Controle de capacidade máxima
- Registro opcional
- Horários de início e término
- Observações e descrições

### ✅ Eventos

**Tipos de eventos:**
- Festa
- Evento
- Celebração
- Bazar
- Palestra

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Catálogo público
- Imagens opcionais
- Localização
- Data e horário
- Ativação/desativação

### ✅ Conteúdo Espiritual

**Tipos:**
- Oração
- Ensinamento
- Doutrina
- Hino
- Ritual

**Categorias:**
- Umbanda
- Kardecismo
- Geral
- Orixás

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Leitura pública
- Destaque opcional
- Ordem de exibição

### ✅ Orixás

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Catálogo público
- Cores, elementos, características
- Ensinamento específico da Batuara
- Imagens opcionais
- Ordem de exibição

### ✅ Guias e Entidades

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Leitura pública
- Especialidades
- Foto opcional
- Dados de contato
- Ordem de exibição

### ✅ Linhas da Umbanda

**Funcionalidades:**
- CRUD completo no AdminDashboard
- Leitura pública
- Características e entidades
- Dias de trabalho
- Interpretação da Batuara
- Ordem de exibição

### ✅ Filhos da Casa

**Funcionalidades:**
- CRUD administrativo
- Integração com dashboard
- Controle de contribuições mensais
- Orixás de cabeça (frente, costas, roda)
- Dados pessoais e de contato
- Status de pagamento

### ✅ Contato Público

**Funcionalidades:**
- Formulário de contato no site público
- Recebimento de mensagens
- Status de gerenciamento (Novo, Em Progresso, Resolvido, Arquivado)
- Notas administrativas

### ✅ Dashboard Administrativo

**Métricas:**
- Eventos ativos até o fim do ano
- Atendimentos espirituais até o fim do ano
- Filhos da Casa ativos
- Atividade do mês corrente
- Log de atividades recentes

---

## 🗄️ Modelo de Dados

### Entidades Principais

- **User** - Usuários do sistema
- **RefreshToken** - Tokens de refresh JWT
- **SiteSettings** - Configurações institucionais (singleton)
- **Event** - Eventos especiais
- **CalendarAttendance** - Atendimentos do calendário
- **Orixa** - Orixás e suas características
- **Guide** - Guias e Entidades
- **UmbandaLine** - Linhas da Umbanda
- **SpiritualContent** - Conteúdos espirituais
- **HouseMember** - Filhos da Casa
- **HouseMemberContribution** - Contribuições mensais
- **ContactMessage** - Mensagens de contato

### Migrations Relevantes

| Migration | Descrição |
|-----------|-----------|
| `20250719202440_InitialCreate` | Criação inicial do banco |
| `20250723040014_UpdateModel` | Atualização do modelo |
| `20251119035519_MakeRevokeFieldsNullable` | Campos de revogação nullable |
| `20251119040325_AddReasonRevokedToRefreshToken` | Motivo de revogação |
| `20260401234426_AddSiteSettings` | Criação de SiteSettings |
| `20260402235355_ContentManagementModules` | Módulos de gestão de conteúdo |
| `20260403014603_AddHistoryMissionTextToSiteSettings` | Texto de missão na história |
| `20260403043437_RemoveHistoryMediaFromSiteSettings` | Remoção de mídia da história |
| `20260408023117_AddCalendarFestaTipo` | Tipo de festa no calendário |

---

## 🌐 Endpoints da API

### Autenticação

- `POST /batuara-api/api/auth/login` - Login
- `POST /batuara-api/api/auth/refresh` - Refresh token
- `POST /batuara-api/api/auth/logout` - Logout
- `GET /batuara-api/api/auth/me` - Perfil do usuário
- `PUT /batuara-api/api/auth/me` - Atualizar perfil
- `PUT /batuara-api/api/auth/change-password` - Alterar senha
- `GET /batuara-api/api/auth/verify` - Verificar token

### SiteSettings

- `GET /batuara-api/api/site-settings/public` - Dados públicos
- `GET /batuara-api/api/site-settings` - Dados completos (admin)
- `PUT /batuara-api/api/site-settings` - Atualizar configurações

### Calendário

- `GET /batuara-api/api/public/calendar/attendances` - Lista pública
- `GET /batuara-api/api/public/calendar/attendances/{id}` - Detalhe público
- `GET /batuara-api/api/calendar/attendances` - Lista admin
- `POST /batuara-api/api/calendar/attendances` - Criar
- `GET /batuara-api/api/calendar/attendances/{id}` - Detalhe admin
- `PUT /batuara-api/api/calendar/attendances/{id}` - Atualizar
- `DELETE /batuara-api/api/calendar/attendances/{id}` - Deletar

### Eventos

- `GET /batuara-api/api/public/events` - Lista pública
- `GET /batuara-api/api/public/events/{id}` - Detalhe público
- `GET /batuara-api/api/events` - Lista admin
- `POST /batuara-api/api/events` - Criar
- `GET /batuara-api/api/events/{id}` - Detalhe admin
- `PUT /batuara-api/api/events/{id}` - Atualizar
- `DELETE /batuara-api/api/events/{id}` - Deletar

### Orixás, Guias, Linhas, Conteúdos

Padrão similar para todos:
- `GET /batuara-api/api/public/{resource}` - Lista pública
- `GET /batuara-api/api/public/{resource}/{id}` - Detalhe público
- `GET /batuara-api/api/{resource}` - Lista admin
- `POST /batuara-api/api/{resource}` - Criar
- `GET /batuara-api/api/{resource}/{id}` - Detalhe admin
- `PUT /batuara-api/api/{resource}/{id}` - Atualizar
- `DELETE /batuara-api/api/{resource}/{id}` - Deletar

### Operacionais

- `GET /batuara-api/health` - Health check
- `GET /batuara-api/swagger` - Documentação Swagger

---

## 🎨 Estrutura dos Frontends

### AdminDashboard

**Organização:**
```
src/
├── components/
│   ├── common/        # Componentes compartilhados
│   ├── content/       # Componentes de conteúdo
│   ├── dashboard/     # Componentes do dashboard
│   ├── forms/         # Formulários reutilizáveis
│   └── layout/        # Layout e navegação
├── contexts/          # Contextos React
├── hooks/             # Hooks customizados
├── pages/             # Páginas principais
│   ├── CalendarPage.tsx
│   ├── DashboardPage.tsx
│   ├── EventsPage.tsx
│   ├── GuidesPage.tsx
│   ├── HistoryPage.tsx
│   ├── LocationPage.tsx
│   ├── MembersPage.tsx
│   ├── OrixasPage.tsx
│   ├── ProfilePage.tsx
│   ├── SpiritualContentPage.tsx
│   ├── UmbandaLinesPage.tsx
│   └── ...
├── services/          # Serviços API
├── styles/            # Estilos globais
├── theme/             # Tema MUI
└── types/             # Definições TypeScript
```

**Páginas principais:**
- Dashboard (visão geral)
- Calendário (gestão de atendimentos)
- Eventos (gestão de eventos)
- Orixás (gestão de orixás)
- Guias e Entidades
- Linhas da Umbanda
- Conteúdos Espirituais
- Filhos da Casa
- Nossa História (editor institucional)
- Localização
- Doações e Contato
- Perfil do Usuário
- Preferências

### PublicWebsite

**Organização:**
```
src/
├── components/
│   ├── common/        # Componentes compartilhados
│   ├── layout/        # Layout e navegação
│   └── sections/      # Seções da página
│       ├── AboutSection.tsx
│       ├── CalendarSection.tsx
│       ├── ContactSection.tsx
│       ├── DonationsSection.tsx
│       ├── EventsSection.tsx
│       ├── GuiasEntidadesSection.tsx
│       ├── HeroSection.tsx
│       ├── LocationSection.tsx
│       ├── OrixasSection.tsx
│       ├── PrayersSection.tsx
│       └── UmbandaSection.tsx
├── hooks/             # Hooks customizados
├── services/          # Serviços API
├── styles/            # Estilos globais
├── theme/             # Tema MUI
└── types/             # Definições TypeScript
```

**Seções principais:**
- Hero (banner principal)
- Sobre Nós
- Calendário
- Eventos
- Orixás
- Guias e Entidades
- Linhas da Umbanda
- Orações e Ensinamentos
- Localização
- Doações
- Contato

---

## ⚙️ Configuração e Deploy

### Variáveis de Ambiente Críticas

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DB_PASSWORD` | Senha do PostgreSQL | Sim |
| `JWT_SECRET` | Secret para tokens JWT | Sim |
| `ENVIRONMENT` | Ambiente (Development/Production) | Sim |
| `REACT_APP_API_URL_PUBLIC` | URL da API para PublicWebsite | Não |
| `REACT_APP_API_URL_ADMIN` | URL da API para AdminDashboard | Não |

### Deploy Local

**Procedimento padrão:**
```bash
$env:DB_PASSWORD='<senha>'
$env:JWT_SECRET='<secret>'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --build api publicwebsite admindashboard nginx
```

**URLs locais:**
- PublicWebsite: `http://localhost/batuara-public/`
- AdminDashboard: `http://localhost/batuara-admin/`
- Swagger: `http://localhost/batuara-api/swagger`
- Health: `http://localhost/batuara-api/health`

**Credencial local:**
- E-mail: `admin@batuara.org.br`
- Senha: `<USE_LOCAL_CREDENTIAL>`

### Troubleshooting Local

**Problema:** API aparentemente "healthy", mas navegador retorna 502

**Causa:** Nginx local mantém upstreams antigos após recriação dos containers

**Solução:**
```bash
$env:DB_PASSWORD='<senha>'
$env:JWT_SECRET='<secret>'
docker compose -p batuara-net-local -f docker-compose.local.yml up -d --force-recreate nginx
```

---

## 🔒 Padrões e Convenções

### Backend

**Arquitetura em camadas:**
- **Domain** - Entidades, Value Objects, Domain Events, Interfaces de repositório
- **Application** - DTOs, Services, Validators, Mappings
- **Infrastructure** - Implementações de repositório, DbContext, Migrations
- **API** - Controllers, Middleware, Configuração

**Padrões de código:**
- DDD (Domain-Driven Design)
- CQRS (separação de comandos e queries)
- Domain Events para notificações
- FluentValidation para validação
- AutoMapper para mapeamento
- Serilog para logging estruturado

### Frontend

**Padrões de código:**
- TypeScript para tipagem estática
- React Hooks para estado e efeitos
- TanStack Query para cache e state management de dados
- Material UI para componentes visuais
- Axios para requisições HTTP
- React Hook Form para formulários

**Organização:**
- Componentes funcionais
- Hooks customizados para lógica reutilizável
- Contextos para estado global
- Serviços centralizados para API
- Tipos TypeScript compartilhados

---

## 📋 Mudanças Recentes Importantes

### Nossa História (AdminDashboard)

- ✅ Remoção completa de upload de imagem e vídeo
- ✅ Remoção da interface dividida com preview
- ✅ Conteúdo padrão institucional incorporado ao editor
- ✅ Remoção do botão `Link` na toolbar do editor
- ✅ Correção do fluxo de salvamento para evitar erro `History title cannot be empty`

### SiteSettings e Dados Públicos

- ✅ `SiteSettings` consolidado como núcleo de dados institucionais
- ✅ Ajustados fallbacks para localização, e-mail institucional, Instagram e mapa
- ✅ Fonte única de verdade para localização pública

### PublicWebsite

- ✅ Localização pública ajustada para refletir os dados reais da API
- ✅ Rodapé alinhado com endereço/e-mail/Instagram institucionais
- ✅ Calendário público simplificado visualmente, sem contador numérico por dia

### Operação Local

- ✅ Procedimento validado para recuperação de 502 (recriar nginx)
- ✅ Health checks operacionais
- ✅ Swagger funcional

---

## ⚠️ Pontos de Atenção

### Riscos e Considerações

1. **Mudanças em SiteSettings** impactam simultaneamente:
   - DTOs da API
   - Validators
   - Telas admin
   - Seções públicas
   - Migrations
   - Fallback de conteúdo

2. **Rebuilds locais** podem exigir recriação do nginx

3. **Documentação histórica** pode citar mídia em "Nossa História" (atualmente removida)

4. **Tokens expirados** no localStorage podem causar spinner infinito no AdminDashboard

5. **JWT Secret placeholder** causa falha em produção (validação de força implementada)

### Boas Práticas

- Alterações funcionais devem atualizar documentação e migrations
- Mudanças em contratos públicos devem refletir no OpenAPI/Swagger
- Qualquer ajuste em `SiteSettings` precisa considerar todos os pontos de impacto
- Testar localmente antes de commitar
- Verificar health, swagger, publicwebsite e login após mudanças

---

## 📚 Documentação Disponível

| Documento | Descrição |
|-----------|-----------|
| `AGENT.md` | Guia de onboarding para IA e desenvolvedores |
| `README.md` | Visão geral e instruções de setup |
| `docs/STATUS-PROJETO.md` | Status atual dos módulos |
| `docs/Resumo-Executivo.md` | Resumo executivo para stakeholders |
| `docs/EFT-especificacao-funcional-tecnica.md` | Especificação funcional e técnica |
| `docs/DEPLOY.md` | Guia de deploy na Oracle Cloud |
| `docs/LOCAL_DEVELOPMENT_SETUP.md` | Setup do ambiente local |
| `docs/database-schema.md` | Schema do banco de dados |
| `docs/Backlog-Executavel.md` | Backlog de tarefas executáveis |
| `docs/TASK_HISTORY.md` | Histórico de tarefas |

---

## 🚀 Próximos Passos Recomendados

1. Consolidar a documentação viva com o estado atual dos módulos
2. Revisar o backlog restante para itens avançados de segurança e governança
3. Validar produção OCI com a mesma disciplina operacional aplicada localmente
4. Manter testes de regressão para `SiteSettings`, autenticação e proxy local
5. Implementar testes unitários e de integração mais abrangentes
6. Considerar internacionalização (i18n)
7. Melhorias de acessibilidade (a11y) no website público

---

## ✅ Conclusão

O projeto **Batuara.net** está em um estado funcional maduro, com:

- **Arquitetura sólida** em camadas (DDD)
- **Stack moderna** (.NET 8, React 19, MUI 7)
- **Módulos completos** de gestão de conteúdo e operacional
- **Integração consistente** entre frontend e backend
- **Documentação abrangente** para onboarding e operação
- **Procedimentos operacionais** validados para ambiente local

O sistema atende aos requisitos da Casa de Caridade Caboclo Batuara, proporcionando uma plataforma digital completa para gestão e divulgação das atividades da casa.

---

**Data da análise:** 06 de maio de 2026  
**Versão do documento:** 1.0  
**Analista:** Devin AI Assistant