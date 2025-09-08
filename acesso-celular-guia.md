# 📱 Guia de Acesso via Celular

## 🎯 IPs Disponíveis

### IP do WSL (Recomendado)
- **IP**: `172.17.158.1`
- **PublicWebsite**: http://172.17.158.1:3000
- **AdminDashboard**: http://172.17.158.1:3001
- ✅ **Mais confiável** - funciona diretamente

### IP do Windows (Alternativo)
- **IP**: `192.168.15.120`
- **PublicWebsite**: http://192.168.15.120:3000
- **AdminDashboard**: http://192.168.15.120:3001
- ⚠️ **Requer configuração** - pode precisar de port forwarding

## 📋 Pré-requisitos

1. **Celular e computador na mesma rede Wi-Fi**
2. **Frontends rodando** (já estão ativos)
3. **Firewall configurado** (pode precisar de ajustes)

## 🔧 Como Testar

### Passo 1: Teste Básico
1. Conecte o celular na mesma rede Wi-Fi do computador
2. Abra o navegador do celular
3. Tente acessar: `http://172.17.158.1:3000`

### Passo 2: Se não funcionar
1. **Verifique o firewall do Windows:**
   - Abra "Windows Defender Firewall"
   - Vá em "Configurações Avançadas"
   - Crie regras de entrada para portas 3000 e 3001

2. **Teste o IP alternativo:**
   - Tente: `http://192.168.15.120:3000`

## 🛠️ Soluções para Problemas Comuns

### Problema: "Site não pode ser acessado"
**Solução 1 - Firewall do Windows:**
```powershell
# Execute no PowerShell como Administrador (se possível)
New-NetFirewallRule -DisplayName "WSL Frontend 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "WSL Frontend 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

**Solução 2 - Usar ngrok (se tiver conta):**
```bash
# No WSL
ngrok http 3000
# Acesse a URL pública gerada
```

### Problema: Firewall corporativo
**Alternativas:**
1. **Acesso direto via cabo USB** (Android)
2. **Hotspot do celular** (conectar PC ao celular)
3. **Usar IP WSL diretamente** (mais provável de funcionar)

## ✅ Teste de Conectividade

### Do celular, teste estes comandos no navegador:

1. **Teste de ping** (se o celular permitir):
   - `http://172.17.158.1:3000/` 
   - Se carregar a página React, está funcionando!

2. **Verificar se as portas estão abertas:**
   - Use um app como "Network Analyzer" no celular
   - Escaneie o IP `172.17.158.1` nas portas 3000 e 3001

## 🎯 Recomendação Final

**Use o IP do WSL**: `172.17.158.1`
- Mais direto e confiável
- Não depende de configurações do Windows
- Funciona mesmo com restrições corporativas

**URLs para salvar nos favoritos:**
- 📊 **PublicWebsite**: http://172.17.158.1:3000
- ⚙️ **AdminDashboard**: http://172.17.158.1:3001

---

💡 **Dica**: Se ainda não funcionar, o problema pode ser o firewall corporativo. Neste caso, use ferramentas como ngrok com conta autenticada ou configure um hotspot no celular.