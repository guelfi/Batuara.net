# 🚀 Guia de Desenvolvimento - Batuara.net

## 📋 Para Novos Desenvolvedores

### ✅ **Problema Resolvido: Pasta `build` ausente**

Se você baixou o projeto e não encontrou a pasta `build` ou o arquivo `index.html`, isso é **NORMAL**! 

### 🎯 **Como Executar o Projeto Corretamente**

#### **1. Clonar o Repositório**
```bash
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net
```

#### **2. Instalar Dependências**
```bash
cd src/Frontend/PublicWebsite
npm install
```

#### **3. Executar em Modo Desenvolvimento**
```bash
npm start
```
- ✅ Abre automaticamente em `http://localhost:3000`
- ✅ Hot reload automático
- ✅ Não precisa da pasta `build`

#### **4. (Opcional) Gerar Build de Produção**
```bash
npm run build
```
- ✅ Cria pasta `build/` com arquivos otimizados
- ✅ Gera `index.html` automaticamente
- ⚠️ Só necessário para deploy em produção

### 🔍 **Entendendo a Diferença**

| Modo | Comando | Pasta build | Uso |
|------|---------|-------------|-----|
| **Desenvolvimento** | `npm start` | ❌ Não precisa | Desenvolvimento local |
| **Produção** | `npm run build` | ✅ Criada automaticamente | Deploy em servidor |

### 📚 **Conceitos Importantes para Iniciantes**

#### **🔧 Modo Desenvolvimento**
- Código roda direto da pasta `src/`
- Webpack compila na memória
- Mudanças aparecem instantaneamente
- Ideal para desenvolvimento

#### **🚀 Modo Produção**
- Código é compilado e otimizado
- Arquivos minificados e comprimidos
- Pasta `build/` contém versão final
- Ideal para colocar no ar

### ⚠️ **Erros Comuns**

#### **❌ "Não encontro o index.html"**
**Solução:** Use `npm start`, não procure na pasta `build`

#### **❌ "Pasta build vazia"**
**Solução:** Execute `npm run build` para gerar

#### **❌ "localhost:3000 não abre"**
**Solução:** Verifique se executou `npm install` primeiro

### 🛠️ **Comandos Úteis**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm start

# Gerar build de produção
npm run build

# Executar testes
npm test

# Verificar dependências desatualizadas
npm outdated

# Limpar cache do npm
npm cache clean --force
```

### 📁 **Estrutura do Projeto React**

```
src/Frontend/PublicWebsite/
├── public/              # Arquivos estáticos
│   ├── index.html      # Template HTML base
│   ├── favicon.ico     # Ícone do site
│   └── manifest.json   # Configurações PWA
├── src/                # Código fonte React
│   ├── components/     # Componentes React
│   ├── assets/         # Imagens, fontes, etc.
│   ├── theme/          # Configurações Material-UI
│   └── App.tsx         # Componente principal
├── build/              # 🚫 NÃO EXISTE no GitHub
│   └── index.html      # 🚫 Gerado automaticamente
├── package.json        # Dependências e scripts
└── tsconfig.json       # Configurações TypeScript
```

### 🎓 **Dicas para Iniciantes em React**

#### **1. Sempre use `npm start` para desenvolvimento**
- Nunca abra arquivos HTML diretamente no navegador
- O servidor de desenvolvimento é essencial

#### **2. A pasta `build` não deve estar no Git**
- É gerada automaticamente
- Cada desenvolvedor gera a sua própria
- Evita conflitos de merge

#### **3. Hot Reload é seu amigo**
- Salve o arquivo e veja mudanças instantâneas
- Não precisa recarregar a página manualmente

#### **4. Use as ferramentas de desenvolvimento**
- F12 → React Developer Tools
- Console para debug
- Network tab para APIs

### 🔧 **Troubleshooting**

#### **Problema: "Module not found"**
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### **Problema: "Port 3000 already in use"**
```bash
# Matar processo na porta 3000
npx kill-port 3000
# Ou usar outra porta
npm start -- --port 3001
```

#### **Problema: "npm command not found"**
- Instale Node.js: https://nodejs.org/
- Verifique: `node --version` e `npm --version`

### 📞 **Precisa de Ajuda?**

1. **Documentação React**: https://react.dev/
2. **Material-UI**: https://mui.com/
3. **TypeScript**: https://www.typescriptlang.org/
4. **Issues do projeto**: https://github.com/guelfi/Batuara.net/issues

---

## 🎯 **Resumo para seu Amigo**

**✅ O que fazer:**
1. `git clone` do projeto
2. `cd src/Frontend/PublicWebsite`
3. `npm install`
4. `npm start`
5. Abrir `http://localhost:3000`

**❌ O que NÃO fazer:**
- Procurar pasta `build` no GitHub
- Abrir `index.html` diretamente no navegador
- Executar `npm run build` para desenvolvimento

**🎉 Resultado esperado:**
- Site abre em `localhost:3000`
- Mudanças no código aparecem automaticamente
- Tudo funciona perfeitamente!

---

*📅 Criado em: 26/07/2025*
*🎯 Para: Novos desenvolvedores React*