# Testes da API de Autenticação Batuara

Este documento descreve como testar a API de autenticação da Casa de Caridade Batuara usando diferentes métodos.

## Pré-requisitos

- API em execução na porta 3003
- PostgreSQL configurado com o banco de dados CasaBatuara
- Usuário admin criado (feito automaticamente pelo seed)

## Métodos de Teste

### 1. Usando o Script Curl

O script `test-api.sh` fornece uma maneira rápida de testar os principais endpoints da API usando curl:

```bash
# Tornar o script executável
chmod +x test-api.sh

# Executar os testes
./test-api.sh
```

O script testará:
- Login com credenciais corretas
- Login com credenciais incorretas
- Verificação de token
- Obtenção de informações do usuário atual
- Listagem de usuários
- Renovação de token
- Revogação de token

### 2. Usando o Postman

A collection do Postman fornece uma interface gráfica para testar todos os endpoints da API:

1. Importe o arquivo `BatuaraPostmanCollection.json` no Postman
2. Importe o arquivo `BatuaraPostmanEnvironment.json` como ambiente
3. Selecione o ambiente "Batuara API Environment"
4. Execute os testes na seguinte ordem:
   - Autenticação > Login
   - Autenticação > Verificar Token
   - Autenticação > Obter Usuário Atual
   - Usuários > Listar Usuários
   - Usuários > Obter Usuário por ID
   - Usuários > Criar Usuário
   - Usuários > Atualizar Usuário
   - Autenticação > Renovar Token
   - Autenticação > Revogar Token

### 3. Usando Comandos Curl Individuais

#### Login
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@casabatuara.org.br","password":"admin123"}'
```

#### Verificar Token
```bash
curl -X GET http://localhost:3003/api/auth/verify \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Obter Usuário Atual
```bash
curl -X GET http://localhost:3003/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Listar Usuários
```bash
curl -X GET http://localhost:3003/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Renovar Token
```bash
curl -X POST http://localhost:3003/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"SEU_REFRESH_TOKEN_AQUI"}'
```

#### Revogar Token
```bash
curl -X POST http://localhost:3003/api/auth/revoke \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"SEU_REFRESH_TOKEN_AQUI"}'
```

## Validação dos Testes

Os testes são considerados bem-sucedidos quando:

1. O login retorna um token JWT válido
2. O token pode ser verificado
3. As informações do usuário podem ser recuperadas
4. Os usuários podem ser listados (com permissão de admin)
5. O token pode ser renovado
6. O token pode ser revogado

## Solução de Problemas

### Erro de Conexão com o Banco de Dados
- Verifique se o PostgreSQL está em execução
- Verifique se as credenciais no arquivo `appsettings.json` estão corretas
- Verifique se o banco de dados `CasaBatuara` existe

### Erro de Autenticação
- Verifique se o usuário admin foi criado corretamente
- Verifique se a senha está correta
- Verifique se o token JWT está sendo enviado corretamente no cabeçalho Authorization

### Erro de Autorização
- Verifique se o usuário tem a role necessária para acessar o endpoint
- Verifique se o token não expirou