# Batuara Auth API

API de autenticação para o sistema Casa de Caridade Batuara, implementando autenticação JWT segura com refresh tokens.

## 🔐 Funcionalidades

- Autenticação com JWT (JSON Web Tokens)
- Refresh tokens para renovação de sessão
- Gerenciamento de usuários com diferentes níveis de acesso
- Proteção de endpoints baseada em roles
- Logging de segurança para auditoria

## 🚀 Tecnologias

- .NET 8 API
- Entity Framework Core com PostgreSQL
- BCrypt para hashing de senhas
- JWT para tokens de autenticação
- Serilog para logging estruturado
- Swagger para documentação da API

## 📋 Endpoints

### Autenticação

- `POST /api/auth/login` - Autenticação e geração de token
- `POST /api/auth/refresh` - Renovação de token
- `POST /api/auth/revoke` - Invalidação de token
- `GET /api/auth/verify` - Verificação de token
- `GET /api/auth/me` - Informações do usuário atual

### Usuários (requer role Admin)

- `GET /api/users` - Listar todos os usuários
- `GET /api/users/{id}` - Obter usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Excluir usuário
- `POST /api/users/{id}/change-password` - Alterar senha

## 🔧 Configuração

### Pré-requisitos

- .NET 8 SDK
- PostgreSQL 15+

### Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `appsettings.json` ou como variáveis de ambiente:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=batuara_auth;Username=postgres;Password=CHANGE_ME_USE_ENV_VAR"
  },
  "JwtSettings": {
    "Secret": "your-256-bit-secret-key-here-at-least-32-characters",
    "Issuer": "batuara-api",
    "Audience": "batuara-clients",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

### Executando Migrações

```bash
dotnet ef database update
```

## 🧪 Testes

### Testes Unitários

```bash
dotnet test
```

### Testes via Curl

```bash
# Login
curl -X POST https://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<sua-senha-admin>"}'

# Verificar token
curl -X GET https://localhost:5001/api/auth/verify \
  -H "Authorization: Bearer {seu-token-aqui}"

# Renovar token
curl -X POST https://localhost:5001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"{seu-refresh-token-aqui}"}'
```

## 📦 Implantação

### Docker

```bash
docker build -t batuara-auth-api .
docker run -p 5000:80 batuara-auth-api
```

## 🔒 Segurança

- Senhas armazenadas com BCrypt (não reversível)
- Tokens JWT com expiração curta (60 minutos)
- Refresh tokens com rotação automática
- Proteção contra CSRF e XSS
- Rate limiting para prevenir ataques de força bruta

## 📝 Logs

Os logs são armazenados em:

- `logs/application-.log` - Logs gerais
- `logs/error-.log` - Logs de erro
- `logs/security-.log` - Logs de segurança

## 🤝 Integração com Frontend

O AdminDashboard se conecta a esta API para autenticação e gerenciamento de usuários.

## 📄 Licença

Este projeto é desenvolvido para a Casa de Caridade Batuara.
