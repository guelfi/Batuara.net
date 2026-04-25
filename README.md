# Batuara.net

**Sistema digital da Casa de Caridade Caboclo Batuara** — um centro espiritual dedicado aos ensinamentos de Umbanda e Kardecismo, localizado no Brasil.

Este projeto oferece uma plataforma completa para a gestao e divulgacao das atividades da casa, incluindo um website publico para a comunidade e um dashboard administrativo para a equipe de gestao.

---

## Sobre o Projeto

A Casa de Caridade Caboclo Batuara e um espaco dedicado ao acolhimento espiritual, a caridade e a difusao dos valores de Umbanda e Kardecismo. O sistema Batuara.net foi criado para digitalizar e facilitar a gestao das atividades da casa, oferecendo:

- **Presenca online** para a comunidade conhecer a casa, seus valores e atividades
- **Calendario de eventos** com sessoes, palestras e atividades espirituais
- **Conteudo educativo** sobre Orixas, Linhas de Umbanda e ensinamentos espirituais
- **Gestao administrativa** com controle de eventos, doacoes, conteudo e usuarios
- **Sistema de doacoes** para apoiar o trabalho da casa

> *"Fora da caridade nao ha salvacao"*

---

## Stack Tecnologica

### Backend
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| .NET | 8.0 | Runtime e SDK |
| ASP.NET Core | 8.0 | Framework web / API REST |
| Entity Framework Core | 8.0 | ORM / acesso a dados |
| PostgreSQL | 16 | Banco de dados relacional |
| Serilog | 9.0 | Logging estruturado |
| FluentValidation | 11.3 | Validacao de requisicoes |
| BCrypt.Net | 4.0 | Hash de senhas |
| JWT Bearer | 8.0 | Autenticacao por token |
| Swagger / OpenAPI | 6.4 | Documentacao da API |

### Frontend
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| React | 18.2 | Biblioteca de UI |
| TypeScript | 4.9 | Tipagem estatica |
| Material-UI (MUI) | 5.14 | Componentes visuais |
| React Router | 6.18 | Navegacao SPA |
| React Hook Form | 7.48 | Formularios |
| Axios | 1.6 | Requisicoes HTTP |
| React Query | 5.8 | Cache e state management de dados |
| date-fns | 2.30 | Manipulacao de datas |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Docker + Docker Compose | Containerizacao e orquestracao |
| Nginx | Reverse proxy e servir arquivos estaticos |
| GitHub Actions | CI/CD (build, validacao e deploy automatico) |
| Oracle Cloud Infrastructure | Servidor de producao (Always Free Tier) |

---

## Arquitetura

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

### Estrutura do Repositorio

```
Batuara.net/
├── src/
│   ├── Backend/
│   │   ├── Batuara.API/              # API principal (controllers, middleware, config)
│   │   ├── Batuara.Application/      # Camada de aplicacao (interfaces, models, DTOs)
│   │   ├── Batuara.Domain/           # Camada de dominio (entidades de negocio)
│   │   └── Batuara.Infrastructure/   # Infraestrutura (EF Core, DbContext, servicos)
│   └── Frontend/
│       ├── PublicWebsite/            # Website publico da casa
│       └── AdminDashboard/           # Dashboard administrativo
├── .github/workflows/
│   ├── ci.yml                        # CI: build e validacao automatica
│   └── deploy-oci.yml                # CD: deploy automatico na OCI
├── scripts/
│   └── ci/deploy-rolling.sh          # Script de deploy com zero-downtime
├── nginx/batuara.conf                # Configuracao do reverse proxy
├── docker-compose.production.yml     # Orquestracao para producao
├── Dockerfile.api                    # Build da API .NET
├── Dockerfile.frontend               # Build do Public Website
├── Dockerfile.admin                  # Build do Admin Dashboard
├── ROADMAP.md                        # Registro de correcoes, melhorias e roadmap
└── docs/                             # Documentacao adicional
```

---

## Desenvolvimento Local

### Pre-requisitos

- **Node.js** 18+ e **npm** (para os frontends)
- **.NET SDK** 8.0 (para a API)
- **Docker** e **Docker Compose** (para PostgreSQL e deploy local)
- **Git**

### Clonagem e Setup

```bash
# Clonar o repositorio
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net
```

### Rodando os Frontends

Cada frontend pode ser executado independentemente. Abra terminais separados:

```bash
# Terminal 1 — Public Website
cd src/Frontend/PublicWebsite
npm install
npm start
# Acesse: http://localhost:3000/batuara-public/
```

```bash
# Terminal 2 — Admin Dashboard
cd src/Frontend/AdminDashboard
npm install --legacy-peer-deps
npm start
# Acesse: http://localhost:3001/batuara-admin/
```

### Rodando a API

```bash
# Terminal 3 — API .NET
cd src/Backend/Batuara.API
dotnet restore
dotnet run
# Acesse: http://localhost:5000/swagger
```

A API precisa de um PostgreSQL rodando. Use o Docker Compose para subir o banco:

```bash
# Na raiz do projeto
docker compose -f docker-compose.db.yml up -d
```

### Variaveis de Ambiente

Copie o arquivo de exemplo e ajuste conforme necessario:

```bash
cp .env.example .env
```

Variaveis principais:

| Variavel | Descricao | Valor Padrao |
|----------|-----------|--------------|
| `DB_PASSWORD` | Senha do PostgreSQL | (definir) |
| `JWT_SECRET` | Secret para tokens JWT | (gerar com `openssl rand -base64 64`) |
| `REACT_APP_API_URL` | URL da API para os frontends | `/batuara-api/api` |
| `ENVIRONMENT` | Ambiente de execucao | `development` |

---

## Deploy em Producao

### Deploy Automatizado (CI/CD)

O projeto possui CI/CD configurado com GitHub Actions:

1. **CI** — A cada push ou PR para `master`, executa build de todos os componentes
2. **CD** — Apos CI passar no `master`, faz deploy automatico na OCI via SSH

O fluxo e:
```
Push para master -> CI (build + validacao) -> CI passa -> CD dispara -> Deploy na OCI
```

### Deploy Manual com Docker Compose

```bash
# Na raiz do projeto
cp .env.production.example .env.production

# Editar .env.production com valores reais
# DB_PASSWORD, JWT_SECRET, etc.

# Build e iniciar todos os servicos
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Verificar status
docker compose -f docker-compose.production.yml ps
```

### GitHub Secrets para CI/CD

Para o deploy automatico funcionar, configure estes secrets no GitHub (`Settings > Secrets > Actions`):

| Secret | Descricao |
|--------|-----------|
| `OCI_SSH_PRIVATE_KEY` | Chave SSH privada para acessar o servidor |
| `OCI_HOST` | IP do servidor (ex: `129.153.86.168`) |
| `OCI_USER` | Usuario SSH (ex: `ubuntu`) |
| `DB_PASSWORD` | Senha do banco de dados PostgreSQL |
| `JWT_SECRET` | Secret JWT (gerar com `openssl rand -base64 64`) |

---

## Aplicacoes

### Public Website

Website publico da Casa de Caridade, com design responsivo e acessivel:

- Informacoes sobre a casa, missao e valores
- Calendario de eventos e sessoes espirituais
- Secoes educativas sobre Orixas e Linhas de Umbanda
- Conteudo espiritual e ensinamentos
- Sistema de doacoes
- Localizacao e informacoes de contato

### Admin Dashboard

Painel administrativo para a equipe de gestao da casa:

- Dashboard com estatisticas e visao geral
- Gerenciamento de eventos e sessoes
- Administracao de conteudo espiritual
- Gestao de Orixas e Linhas de Umbanda
- Controle de doacoes e relatorios
- Gestao de usuarios e permissoes
- Logs de atividade

### API

API REST documentada com Swagger, oferecendo:

- Autenticacao JWT (login, refresh, verify)
- CRUD completo para todas as entidades
- Health check com verificacao de conectividade ao banco
- Middleware de seguranca (CORS, CSP, HSTS)
- Validacao de requisicoes com FluentValidation

---

## Contribuindo

Contribuicoes sao bem-vindas! O projeto e open-source e aceita colaboracoes da comunidade.

### Como Contribuir

1. **Faca um fork** do repositorio no GitHub

2. **Clone o seu fork** localmente:
   ```bash
   git clone https://github.com/SEU_USUARIO/Batuara.net.git
   cd Batuara.net
   ```

3. **Configure o upstream** para manter seu fork atualizado:
   ```bash
   git remote add upstream https://github.com/guelfi/Batuara.net.git
   ```

4. **Crie uma branch** para sua contribuicao:
   ```bash
   # Atualize o master primeiro
   git checkout master
   git pull upstream master

   # Crie sua branch
   git checkout -b feature/minha-contribuicao
   ```

5. **Faca suas alteracoes**, seguindo as convencoes do projeto:
   - Commits com prefixo semantico: `fix:`, `feat:`, `docs:`, `refactor:`, `test:`
   - Siga o estilo de codigo existente nos arquivos

6. **Teste localmente** antes de enviar:
   ```bash
   # Frontend — verificar build
   cd src/Frontend/PublicWebsite && npm run build
   cd src/Frontend/AdminDashboard && npx react-scripts build

   # Backend — verificar build
   cd src/Backend/Batuara.API && dotnet build
   ```

7. **Push para o seu fork** e crie um Pull Request:
   ```bash
   git push origin feature/minha-contribuicao
   ```
   Depois, acesse o GitHub e clique em **"Compare & Pull Request"** para enviar seu PR para o repositorio principal.

### Mantendo seu Fork Atualizado

```bash
# Buscar atualizacoes do repositorio original
git fetch upstream

# Atualizar seu master local
git checkout master
git merge upstream/master

# Atualizar seu fork no GitHub
git push origin master
```

### Diretrizes para Pull Requests

- Descreva claramente o que foi alterado e por que
- Referencie issues relacionadas quando aplicavel
- Garanta que o CI passe antes de solicitar review
- PRs menores e focados sao preferiveis a PRs grandes
- Inclua screenshots para alteracoes visuais

### Areas para Contribuicao

- Melhorias de acessibilidade (a11y) no website publico
- Testes unitarios e de integracao
- Internacionalizacao (i18n)
- Otimizacao de performance
- Documentacao e tutoriais
- Design e UX improvements
- Correcao de bugs reportados nas Issues

---

## Documentacao

| Documento | Descricao |
|-----------|-----------|
| [ROADMAP.md](ROADMAP.md) | Registro completo de correcoes, melhorias e roadmap do projeto |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Guia de deploy na Oracle Cloud |
| [docs/LOCAL_DEVELOPMENT_SETUP.md](docs/LOCAL_DEVELOPMENT_SETUP.md) | Setup do ambiente de desenvolvimento |
| [docs/database-schema.md](docs/database-schema.md) | Schema do banco de dados PostgreSQL |
| [docs/seed-data.md](docs/seed-data.md) | Dados iniciais da Casa Batuara |

---

## Troubleshooting

### Problemas Comuns

**O Admin Dashboard mostra um spinner infinito:**
Isso pode ocorrer se houver tokens de autenticacao invalidos no localStorage. Abra o console do navegador e execute:
```javascript
localStorage.clear();
```
Recarregue a pagina. A tela de login deve aparecer.

**A API nao inicia em producao:**
Verifique se o `JWT_SECRET` nao e um placeholder. A API recusa iniciar com secrets inseguros em producao. Gere um novo:
```bash
export JWT_SECRET=$(openssl rand -base64 64)
```

**Erro de CORS no frontend:**
As origens permitidas sao configuradas em `Program.cs`. Em desenvolvimento, `localhost:3000` e `localhost:3001` sao permitidos. Para producao, adicione o dominio/IP do servidor.

**Build do frontend falha com erros de dependencia:**
Use a flag `--legacy-peer-deps` para o Admin Dashboard:
```bash
cd src/Frontend/AdminDashboard
npm install --legacy-peer-deps
```

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Casa de Caridade Caboclo Batuara**

- GitHub: [@guelfi](https://github.com/guelfi)
- Email: contato@batuara.net

---

*Desenvolvido com dedicacao para a Casa de Caridade Caboclo Batuara*

*"Fora da caridade nao ha salvacao"*
