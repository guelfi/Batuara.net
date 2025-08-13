# 🚀 Gerenciador de Serviços Frontend

Este documento explica como usar o sistema de gerenciamento dos serviços frontend da Casa de Caridade Batuara.

## 📋 Serviços Disponíveis

- **🌐 PublicWebsite**: Site público (porta 3000)
- **🔧 AdminDashboard**: Dashboard administrativo (porta 3001)

## 🛠️ Como Usar

### Opção 1: Script PowerShell Completo (Recomendado)

```powershell
# Executar o gerenciador interativo
.\manage-services.ps1

# Ou usar comandos diretos:
.\manage-services.ps1 start    # Iniciar serviços
.\manage-services.ps1 stop     # Parar serviços
.\manage-services.ps1 status   # Ver status
.\manage-services.ps1 restart  # Reiniciar serviços
```

### Opção 2: Scripts NPM

```bash
# Iniciar todos os serviços
npm run start:all

# Parar serviços
npm run stop

# Ver status
npm run status

# Reiniciar serviços
npm run restart

# Abrir gerenciador interativo
npm run services
```

### Opção 3: Scripts Individuais

```bash
# Iniciar apenas o PublicWebsite (porta 3000)
npm run start:public

# Iniciar apenas o AdminDashboard (porta 3001)
npm run start:admin
```

## 🔧 Funcionalidades

### ✅ Verificação Automática de Portas
- Verifica se as portas 3000 e 3001 estão em uso
- Mata processos existentes automaticamente antes de iniciar

### 📊 Status dos Serviços
- Mostra quais serviços estão rodando
- Exibe PID dos processos
- Mostra URLs de acesso

### 🛑 Parada Segura
- Para todos os serviços de forma segura
- Verifica se os processos foram realmente encerrados

### 🔄 Reinicialização
- Para e inicia os serviços automaticamente
- Útil para aplicar mudanças no código

## 🌐 URLs de Acesso

Após iniciar os serviços:

- **Site Público**: http://localhost:3000
- **Dashboard Admin**: http://localhost:3001

## 📝 Exemplos de Uso

### Desenvolvimento Diário
```powershell
# Iniciar os serviços pela manhã
.\manage-services.ps1 start

# Verificar se estão rodando
.\manage-services.ps1 status

# Parar no final do dia
.\manage-services.ps1 stop
```

### Resolução de Problemas
```powershell
# Se algo não estiver funcionando, reinicie
.\manage-services.ps1 restart

# Ou pare e inicie manualmente
.\manage-services.ps1 stop
.\manage-services.ps1 start
```

## ⚠️ Observações Importantes

1. **Dependências**: Certifique-se de que as dependências estão instaladas:
   ```bash
   npm run install:all
   ```

2. **Portas**: Os serviços usam portas fixas (3000 e 3001). Se precisar mudar, edite o arquivo `manage-services.ps1`

3. **Windows**: Este sistema foi otimizado para Windows. Para outros sistemas, use os scripts bash equivalentes.

4. **Permissões**: Se houver erro de execução, execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 🐛 Solução de Problemas

### Erro "Porta já em uso"
```powershell
# O script resolve automaticamente, mas se persistir:
.\manage-services.ps1 stop
.\manage-services.ps1 start
```

### Erro "Dependências não encontradas"
```bash
npm run install:all
```

### Erro de Permissão PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```