# 💻 Configuração do Ambiente de Desenvolvimento Local - Batuara.net

Este guia descreve como configurar o ambiente de desenvolvimento local **sem Docker**, usando instalações nativas para máxima performance e facilidade de desenvolvimento.

## 📋 Pré-requisitos

### Ferramentas Essenciais

- **Node.js 18+** e **npm** (para React frontends)
- **Git** (controle de versão)
- **Editor de código** (VS Code recomendado)
- **.NET SDK 8+** (para API futura)

### Verificar Instalações

```bash
# Verificar versões instaladas
node --version    # deve ser 18+
npm --version     # deve ser 8+
git --version     # qualquer versão recente
dotnet --version  # deve ser 8+ (para API futura)
```

## 🚀 1. Configuração Inicial

### 1.1 Clonar o Repositório

```bash
# Clonar projeto
git clone https://github.com/guelfi/Batuara.net.git
cd Batuara.net

# Verificar estrutura
ls -la src/Frontend/
```

### 1.2 Instalar Dependências

```bash
# PublicWebsite
cd src/Frontend/PublicWebsite
npm install
cd ../../..

# AdminDashboard
cd src/Frontend/AdminDashboard
npm install
cd ../../..
```

## 🛠️ 2. Desenvolvimento Local

### 2.1 Iniciar PublicWebsite

```bash
# Terminal 1 - PublicWebsite
cd src/Frontend/PublicWebsite
npm start

# Aplicação estará disponível em:
# http://localhost:3000
```

### 2.2 Iniciar AdminDashboard

```bash
# Terminal 2 - AdminDashboard
cd src/Frontend/AdminDashboard
npm start

# Aplicação estará disponível em:
# http://localhost:3001
```

### 2.3 Desenvolvimento Simultâneo

```bash
# Você pode executar ambos simultaneamente:
# - PublicWebsite: http://localhost:3000
# - AdminDashboard: http://localhost:3001

# Hot-reload está ativo - mudanças no código são refletidas automaticamente
```

## 🧪 3. Testes e Validação

### 3.1 Testes Unitários

```bash
# PublicWebsite
cd src/Frontend/PublicWebsite
npm test

# AdminDashboard
cd src/Frontend/AdminDashboard
npm test
```

### 3.2 Build de Produção (Teste Local)

```bash
# Testar build do PublicWebsite
cd src/Frontend/PublicWebsite
npm run build
# Arquivos gerados em: build/

# Testar build do AdminDashboard
cd src/Frontend/AdminDashboard
npm run build
# Arquivos gerados em: build/
```

### 3.3 Servir Build Localmente

```bash
# Instalar servidor estático global (uma vez)
npm install -g serve

# Servir PublicWebsite build
cd src/Frontend/PublicWebsite
serve -s build -l 3000

# Servir AdminDashboard build (outro terminal)
cd src/Frontend/AdminDashboard
serve -s build -l 3001
```

## 🔧 4. Configuração do VS Code (Recomendado)

### 4.1 Extensões Recomendadas

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### 4.2 Configurações do Workspace

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 4.3 Tasks para Desenvolvimento

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start PublicWebsite",
      "type": "shell",
      "command": "npm start",
      "options": {
        "cwd": "${workspaceFolder}/src/Frontend/PublicWebsite"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Start AdminDashboard",
      "type": "shell",
      "command": "npm start",
      "options": {
        "cwd": "${workspaceFolder}/src/Frontend/AdminDashboard"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

## 📁 5. Estrutura de Desenvolvimento

### 5.1 Organização dos Arquivos

```
src/Frontend/PublicWebsite/
├── public/                 # Assets estáticos
│   ├── favicon.ico
│   ├── batuara_logo.png
│   └── bg.jpg
├── src/
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas
│   ├── styles/            # Estilos CSS
│   ├── utils/             # Utilitários
│   └── App.tsx            # Componente principal
├── package.json           # Dependências
└── tsconfig.json          # Configuração TypeScript

src/Frontend/AdminDashboard/
├── public/                # Assets estáticos
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas do dashboard
│   ├── services/         # Serviços (API calls)
│   └── App.tsx           # Componente principal
└── package.json          # Dependências
```

### 5.2 Fluxo de Trabalho

```bash
# 1. Fazer mudanças no código
# 2. Ver resultado imediatamente (hot-reload)
# 3. Testar funcionalidade
# 4. Executar testes (se houver)
# 5. Fazer commit quando satisfeito

# Exemplo de sessão de desenvolvimento:
cd src/Frontend/PublicWebsite
npm start  # deixar rodando

# Em outro terminal, fazer mudanças
code src/components/NewComponent.tsx

# Ver mudanças em http://localhost:3000
# Quando satisfeito, fazer commit
```

## 🔄 6. Integração com Produção

### 6.1 Testar Build Docker Localmente (Opcional)

```bash
# Simular ambiente de produção localmente
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Testar em:
# http://localhost:3000 (PublicWebsite)
# http://localhost:3001 (AdminDashboard)

# Limpar após teste
docker-compose -f docker-compose.production.yml down
```

### 6.2 Deploy para Produção

```bash
# Após desenvolvimento e testes locais:
git add .
git commit -m "feat: nova funcionalidade X"
git push origin master

# Na Oracle (produção):
./update-production.sh
```

## 🚨 7. Troubleshooting

### 7.1 Problemas Comuns

**Porta já em uso:**
```bash
# Encontrar processo usando a porta
lsof -ti:3000
kill -9 <PID>

# Ou usar porta diferente
npm start -- --port 3002
```

**Dependências desatualizadas:**
```bash
# Atualizar dependências
npm update

# Ou reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Cache do npm:**
```bash
# Limpar cache
npm cache clean --force
```

### 7.2 Performance

**Build lento:**
```bash
# Usar cache do npm
npm ci  # ao invés de npm install

# Limpar build anterior
rm -rf build/
npm run build
```

## 📊 8. Scripts Úteis

### 8.1 Package.json Scripts Recomendados

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:analyze": "npm run build && npx serve -s build",
    "clean": "rm -rf build node_modules package-lock.json",
    "fresh": "npm run clean && npm install"
  }
}
```

### 8.2 Comandos de Desenvolvimento

```bash
# Desenvolvimento diário
npm start                    # iniciar desenvolvimento
npm test                     # executar testes
npm run build               # testar build
npm run build:analyze       # analisar bundle

# Manutenção
npm run clean               # limpar tudo
npm run fresh               # reinstalar dependências
npm audit fix               # corrigir vulnerabilidades
```

## ✅ 9. Checklist de Configuração

```bash
# ✅ CONFIGURAÇÃO INICIAL
[ ] Node.js 18+ instalado
[ ] npm funcionando
[ ] Git configurado
[ ] VS Code com extensões
[ ] Repositório clonado
[ ] Dependências instaladas

# ✅ DESENVOLVIMENTO
[ ] PublicWebsite inicia em localhost:3000
[ ] AdminDashboard inicia em localhost:3001
[ ] Hot-reload funcionando
[ ] Builds de produção funcionam
[ ] Testes executam sem erro

# ✅ INTEGRAÇÃO
[ ] Commits funcionam
[ ] Push para GitHub funciona
[ ] Build Docker funciona (opcional)
```

---

## 🎯 Vantagens do Desenvolvimento Local

- **Performance**: Sem overhead do Docker
- **Hot-reload**: Mudanças instantâneas
- **Debug**: Ferramentas nativas do browser
- **Flexibilidade**: Fácil troca entre versões
- **Produtividade**: Desenvolvimento mais rápido

---

**Criado para**: Projeto Batuara.net  
**Ambiente**: Desenvolvimento Local (sem Docker)  
**Última atualização**: Agosto 2025