# 📮 Postman Collection - Casa de Caridade Batuara API

Esta pasta contém a collection completa e atualizada do Postman para testar todos os endpoints da API Batuara.net.

## ✅ Status Atual - FUNCIONANDO PERFEITAMENTE
- **API**: ✅ 100% Funcional
- **Autenticação**: ✅ Corrigida e testada
- **Collection**: ✅ Atualizada em 23/07/2025
- **Credenciais**: ✅ Defina localmente no Postman
- **Login**: ✅ Testado com sucesso

## 📁 Arquivos

- **`Batuara-API-Collection.json`** - Collection principal com todos os endpoints (✅ TESTADA)
- **`Batuara-API-Environment.json`** - Variáveis de ambiente (defina email e senha localmente)
- **`create-admin-user.sql`** - Script SQL para criar usuário admin
- **`fix-user-data.sql`** - Script SQL para corrigir dados inconsistentes
- **`test-api.sh`** - Script bash para testes rápidos
- **`test-services.sh`** - Script para verificar status dos serviços
- **`manual-steps.md`** - Guia completo de configuração e testes

## 🚀 Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import** (botão no canto superior esquerdo)
3. Arraste os arquivos para a área de import:
   - `Batuara-API-Collection.json`
   - `Batuara-API-Environment.json`
4. Clique em **Import**

### 2. Configurar Environment

1. No canto superior direito, selecione o environment **"Batuara API - Environment"**
2. Defina as variáveis localmente conforme seu ambiente:
   - `base_url`: http://localhost:3003
  - `admin_email`: admin@example.com
  - `admin_password`: <defina no Postman>

### 3. Iniciar a API

Certifique-se de que a API está rodando:

```bash
cd ~/Projetos/BATUARA/Batuara.net/src/Backend/Batuara.API
dotnet run
```

A API deve estar acessível em: http://localhost:3003/swagger

## 🧪 Executando os Testes

### Ordem Recomendada

Execute os requests na seguinte ordem:

1. **Health Check** - Verifica se a API está funcionando
2. **Login Admin ✅ FUNCIONANDO** - Autentica e obtém tokens
3. **Get Current User** - Verifica dados do usuário logado
4. **Verify Token** - Valida o token JWT
5. **Get User by ID** - Busca usuário específico (Admin only)
6. **Refresh Token** - Renova o token de acesso
7. **Logout** - Encerra a sessão
8. **Test Invalid Token** - Testa segurança
9. **Test No Token** - Testa segurança

### Executar Collection Completa

1. Clique nos três pontos (...) ao lado do nome da collection
2. Selecione **Run collection**
3. Clique em **Run**

## 📊 Endpoints Disponíveis

### 🔐 Autenticação

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| GET | `/swagger` | Documentação da API | ✅ |
| POST | `/api/auth/login` | Login do usuário | ✅ TESTADO |
| GET | `/api/auth/me` | Dados do usuário atual | ✅ |
| GET | `/api/auth/verify` | Verificar token | ✅ |
| GET | `/api/auth/users/{id}` | Buscar usuário por ID | ✅ |
| POST | `/api/auth/refresh` | Renovar token | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |

## 🔑 Credenciais de Teste
Defina as credenciais do administrador localmente no Postman (não incluídas neste repositório).

## 🎯 Variáveis de Ambiente

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `base_url` | URL base da API | `http://localhost:3003` |
| `admin_email` | Email do admin | `admin@example.com` |
| `admin_password` | Senha do admin | `<defina no Postman>` |
| `access_token` | Token JWT (auto) | Preenchido após login |
| `refresh_token` | Token refresh (auto) | Preenchido após login |
| `user_id` | ID do usuário (auto) | Preenchido após login |

## 🧪 Testes Automatizados

Cada request inclui testes que verificam:

- ✅ **Status Code** - Códigos HTTP corretos
- ✅ **Response Structure** - Estrutura da resposta
- ✅ **Token Management** - Gerenciamento automático de tokens
- ✅ **Security** - Testes de segurança

## 🎉 Resultado dos Testes

### Login Bem-sucedido (exemplo):
```json
{
  "accessToken": "<JWT_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "tokenExpiration": "2025-07-24T00:38:35Z",
  "user": {
    "id": 5,
    "email": "admin@example.com",
    "name": "Administrador Batuara",
    "role": "Admin",
    "isActive": true
  }
}
```

## 🚨 Solução de Problemas

### ✅ Problemas Já Resolvidos
- Schema do banco corrigido
- Hash de senha validado
- Configuração JWT completa
- Entity Framework configurado

### Se a API não responder:
```bash
# Verificar se está rodando
ps aux | grep "dotnet run"

# Iniciar se necessário
cd ~/Projetos/BATUARA/Batuara.net/src/Backend/Batuara.API
dotnet run
```

### Testar manualmente:
```bash
curl http://localhost:3003/swagger
```

## 📝 Scripts Auxiliares

- **`test-api.sh`** - Teste rápido da API
- **`test-services.sh`** - Verificar todos os serviços
- **`manual-steps.md`** - Guia completo passo a passo

## 🔄 Acesso Mobile

A API também funciona em dispositivos móveis:
- **Local**: http://localhost:3003
- **Mobile**: http://192.168.15.119:3003

---

**🚀 Sistema 100% funcional e pronto para uso!**

**Desenvolvido para Casa de Caridade Batuara** 🙏
