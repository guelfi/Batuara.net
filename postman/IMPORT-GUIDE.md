# 🚀 Guia Rápido de Importação - Postman

## ✅ Arquivos para Importar

### 1. Collection Principal
**Arquivo:** `Batuara-API-Collection.json`
- ✅ Testada e funcionando
- ✅ 9 endpoints configurados
- ✅ Testes automatizados incluídos
- ✅ Credenciais validadas

### 2. Environment
**Arquivo:** `Batuara-API-Environment.json`
- ✅ Variáveis pré-configuradas
- ✅ Credenciais funcionais
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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "email": "admin@batuara.org",
    "role": "Admin"
  }
}
```

## 🔑 Credenciais (Já Configuradas)

- **Email:** admin@batuara.org
- **Senha:** Admin@123
- **Status:** ✅ FUNCIONANDO

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