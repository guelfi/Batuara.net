# 🚀 Guia Rápido de Importação - Postman

## ✅ Arquivos para Importar

### 1. Collection Principal
**Arquivo:** `Batuara-API-Collection.json`
- ✅ Testada e funcionando
- ✅ 9 endpoints configurados
- ✅ Testes automatizados incluídos
- ✅ Variáveis de credenciais definidas localmente

### 2. Environment
**Arquivo:** `Batuara-API-Environment.json`
- ✅ Variáveis pré-configuradas
- ✅ Variáveis para email e senha (defina localmente)
- ✅ URLs corretas

## 📥 Como Importar

### Passo 1: Abrir Postman
1. Abra o aplicativo Postman
2. Clique em **"Import"** (canto superior esquerdo)

### Passo 2: Importar Arquivos
1. Arraste os 2 arquivos para a área de import:
   - `Batuara-API-Collection.json`
   - `Batuara-API-Environment.json`
2. Clique em **"Import"**

### Passo 3: Selecionar Environment
1. No canto superior direito, clique no dropdown de environments
2. Selecione **"Batuara API - Environment"**

## 🧪 Primeiro Teste

### Teste Rápido:
1. Abra a collection **"Casa de Caridade Batuara - API Collection"**
2. Execute o request **"2. Login Admin ✅ FUNCIONANDO"**
3. Deve retornar status **200** com tokens

### Resultado Esperado:
```json
{
  "accessToken": "<JWT_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "user": {
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

## 🔑 Credenciais
Defina as credenciais do administrador localmente no Postman (não incluídas neste repositório).

## ⚡ Execução Rápida

Para testar todos os endpoints:
1. Clique nos **3 pontos (...)** ao lado da collection
2. Selecione **"Run collection"**
3. Clique em **"Run"**

## 🚨 Pré-requisitos

Certifique-se de que:
- ✅ API está rodando em http://localhost:3003
- ✅ Banco de dados está configurado
- ✅ Usuário admin existe no banco

---

**🎉 Pronto para usar! Collection 100% funcional!**
