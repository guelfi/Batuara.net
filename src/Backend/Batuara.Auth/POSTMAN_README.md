# Instruções para Testes da API com Postman

Este diretório contém arquivos para testar a API de autenticação da Casa de Caridade Batuara usando o Postman.

## Arquivos Disponíveis

- `BatuaraPostmanCollection.json` - Collection do Postman com todos os endpoints da API
- `BatuaraPostmanEnvironment.json` - Ambiente do Postman com variáveis necessárias
- `POSTMAN_SETUP_GUIDE.md` - Guia detalhado para configuração manual (opcional)

## Como Importar a Collection e o Ambiente

### Passo 1: Abrir o Postman

Abra o aplicativo Postman em seu computador. Se você ainda não tem o Postman instalado, você pode baixá-lo em [postman.com](https://www.postman.com/downloads/).

### Passo 2: Importar a Collection

1. Clique no botão "Import" no canto superior esquerdo
2. Arraste o arquivo `BatuaraPostmanCollection.json` para a área de importação ou clique em "Upload Files" e selecione o arquivo
3. Clique em "Import" para confirmar

### Passo 3: Importar o Ambiente

1. Clique novamente no botão "Import" no canto superior esquerdo
2. Arraste o arquivo `BatuaraPostmanEnvironment.json` para a área de importação ou clique em "Upload Files" e selecione o arquivo
3. Clique em "Import" para confirmar

### Passo 4: Selecionar o Ambiente

1. No canto superior direito, clique no menu suspenso de ambientes
2. Selecione "Batuara Local" na lista de ambientes disponíveis

## Como Usar a Collection

### Fluxo de Testes Recomendado

Para testar a API de forma eficiente, siga este fluxo de requisições:

1. **Autenticação > Login** - Para obter um token de acesso
2. **Autenticação > Verificar Token** - Para confirmar que o token é válido
3. **Usuários > Listar Usuários** - Para verificar a listagem de usuários
4. **Usuários > Criar Usuário** - Para criar um novo usuário de teste
5. **Usuários > Obter Usuário por ID** - Para verificar os detalhes do usuário criado
6. **Usuários > Atualizar Usuário** - Para modificar o usuário criado
7. **Usuários > Alterar Senha** - Para alterar a senha do usuário
8. **Autenticação > Renovar Token** - Para obter um novo token
9. **Usuários > Excluir Usuário** - Para remover o usuário de teste
10. **Autenticação > Revogar Token** - Para invalidar o token atual

### Testes Automatizados

A collection inclui scripts de teste para verificar automaticamente as respostas da API. Você pode executar todos os testes de uma vez usando o Collection Runner:

1. Clique com o botão direito na collection "Batuara API"
2. Selecione "Run Collection"
3. Configure a ordem das requisições conforme o fluxo recomendado
4. Clique em "Run Batuara API"

### Variáveis de Ambiente

A collection usa as seguintes variáveis de ambiente:

- `baseUrl` - URL base da API (padrão: http://localhost:3003)
- `authToken` - Token JWT obtido após o login (preenchido automaticamente)
- `refreshToken` - Token de atualização obtido após o login (preenchido automaticamente)
- `createdUserId` - ID do usuário criado durante os testes (preenchido automaticamente)

## Casos de Teste Incluídos

A collection inclui testes para os seguintes cenários:

### Autenticação
- Login bem-sucedido
- Login com credenciais inválidas
- Verificação de token válido
- Verificação de token inválido
- Obtenção de informações do usuário atual
- Renovação de token
- Renovação com token inválido
- Revogação de token

### Usuários
- Listagem de usuários
- Tentativa de listagem sem autorização
- Obtenção de usuário por ID
- Tentativa de obtenção de usuário inexistente
- Criação de usuário
- Tentativa de criação com email duplicado
- Atualização de usuário
- Tentativa de atualização de usuário inexistente
- Alteração de senha
- Tentativa de alteração com senha atual incorreta
- Exclusão de usuário
- Tentativa de exclusão de usuário inexistente

## Solução de Problemas

Se você encontrar problemas ao usar a collection:

1. **Verifique se a API está em execução** - Certifique-se de que a API está rodando na porta 3003
2. **Verifique as variáveis de ambiente** - Confirme que a variável `baseUrl` está configurada corretamente
3. **Limpe os tokens** - Se os testes de autenticação falharem, tente limpar as variáveis `authToken` e `refreshToken` e execute o login novamente
4. **Verifique o banco de dados** - Certifique-se de que o banco de dados está configurado corretamente e que o usuário admin existe

## Personalização

Você pode personalizar a collection para atender às suas necessidades:

1. **Alterar a URL base** - Edite a variável `baseUrl` no ambiente para apontar para uma instância diferente da API
2. **Adicionar mais testes** - Duplique as requisições existentes e modifique conforme necessário
3. **Modificar os scripts de teste** - Edite os scripts na aba "Tests" de cada requisição para adicionar ou modificar verificações