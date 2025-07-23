# 📮 Postman Collection - Casa de Caridade Batuara API

Esta pasta contém a collection completa do Postman para testar todos os endpoints da API Batuara.net.

## 📁 Arquivos

- **`Batuara-API-Collection.json`** - Collection principal com todos os endpoints
- **`Batuara-API-Environment.json`** - Variáveis de ambiente para desenvolvimento
- **`README.md`** - Este arquivo com instruções

## 🚀 Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import** (botão no canto superior esquerdo)
3. Arraste os arquivos `Batuara-API-Collection.json` e `Batuara-API-Environment.json` para a área de import
4. Clique em **Import**

### 2. Configurar Environment

1. No canto superior direito, selecione o environment **"Batuara API - Development"**
2. Certifique-se de que a variável `base_url` está definida como `http://localhost:3003`

### 3. Iniciar a API

Antes de executar os testes, certifique-se de que a API está rodando:

```bash
cd Batuara.net/src/Backend/Batuara.API
./start-api.sh
```

A API deve estar acessível em: http://localhost:3003

## 🧪 Executando os Testes

### Ordem Recomendada

Execute os requests na seguinte ordem para um fluxo completo de testes:

1. **Health Check** - Verifica se a API está funcionando
2. **Register Admin User** - Cria o primeiro usuário administrador
3. **Login** - Autentica e obtém tokens
4. **Get Current User** - Verifica dados do usuário logado
5. **Verify Token** - Valida o token JWT
6. **Refresh Token** - Renova o token de acesso
7. **Get User by ID** - Busca usuário específico (Admin only)
8. **Logout** - Encerra a sessão
9. **Test Invalid Token** - Testa comportamento com token inválido
10. **Test Missing Token** - Testa comportamento sem token

### Executar Collection Completa

Para executar todos os testes automaticamente:

1. Clique nos três pontos (...) ao lado do nome da collection
2. Selecione **Run collection**
3. Configure as opções desejadas
4. Clique em **Run Batuara API Collection**

## 📊 Endpoints Disponíveis

### 🔐 Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/login` | Login do usuário | Não |
| POST | `/api/auth/register` | Registrar novo usuário | Admin |
| POST | `/api/auth/refresh` | Renovar token | Refresh Token |
| POST | `/api/auth/logout` | Logout | JWT |
| GET | `/api/auth/me` | Dados do usuário atual | JWT |
| GET | `/api/auth/users/{id}` | Buscar usuário por ID | Admin |
| GET | `/api/auth/verify` | Verificar token | JWT |

## 🔑 Credenciais de Teste

### Usuário Administrador
- **Email:** `admin@batuara.org`
- **Senha:** `Admin@123`
- **Role:** Admin (1)

### Usuário Editor (para criar via Register)
- **Email:** `editor@batuara.org`
- **Senha:** `Editor@123`
- **Role:** Editor (2)

## 🎯 Variáveis de Ambiente

As seguintes variáveis são utilizadas na collection:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `base_url` | URL base da API | `http://localhost:3003` |
| `access_token` | Token JWT (preenchido automaticamente) | - |
| `refresh_token` | Token de refresh (preenchido automaticamente) | - |
| `user_id` | ID do usuário (preenchido automaticamente) | - |
| `admin_email` | Email do admin | `admin@batuara.org` |
| `admin_password` | Senha do admin | `Admin@123` |

## 🧪 Testes Automatizados

Cada request inclui testes automatizados que verificam:

- **Status Code** - Se a resposta tem o código HTTP esperado
- **Response Structure** - Se a resposta contém os campos obrigatórios
- **Data Validation** - Se os dados retornados são válidos
- **Token Management** - Se os tokens são gerenciados corretamente
- **Error Handling** - Se os erros são tratados adequadamente

### Exemplos de Testes

```javascript
// Teste de status code
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
});

// Teste de estrutura da resposta
pm.test("Response contains tokens", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('accessToken');
    pm.expect(responseJson).to.have.property('refreshToken');
});

// Armazenar tokens automaticamente
pm.environment.set('access_token', responseJson.accessToken);
```

## 🚨 Solução de Problemas

### API não está respondendo
- Verifique se a API está rodando em `http://localhost:3003`
- Execute `./start-api.sh` no diretório da API
- Verifique os logs da API para erros

### Erro 401 Unauthorized
- Verifique se o token está sendo enviado corretamente
- Execute o request de Login para obter um novo token
- Verifique se o token não expirou

### Erro 403 Forbidden
- Verifique se o usuário tem as permissões necessárias
- Alguns endpoints requerem role de Admin

### Erro de CORS
- Verifique se a API está configurada para aceitar requests do Postman
- A configuração de CORS está em `appsettings.json`

## 📝 Notas Importantes

1. **Primeiro Usuário:** Para criar o primeiro usuário administrador, você pode precisar desabilitar temporariamente a autorização no endpoint de register ou criar o usuário diretamente no banco de dados.

2. **Tokens:** Os tokens são gerenciados automaticamente pela collection. O access token é armazenado e usado automaticamente nos requests subsequentes.

3. **Refresh Token:** O refresh token pode ser enviado via header `X-Refresh-Token` ou cookie. A collection usa o header por simplicidade.

4. **Roles:** 
   - 1 = Admin (acesso total)
   - 2 = Editor (acesso limitado)
   - 3 = Viewer (apenas leitura)

5. **Segurança:** Em produção, use senhas mais seguras e configure HTTPS.

## 🔄 Atualizações

Esta collection será atualizada conforme novos endpoints forem adicionados à API. Verifique regularmente por atualizações.

---

**Desenvolvido para Casa de Caridade Batuara** 🙏