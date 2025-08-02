# 🔄 Fluxo de Desenvolvimento e Atualização - Batuara.net

Este documento descreve o processo completo de desenvolvimento, teste e deploy das funcionalidades do projeto Batuara.net.

## 📋 Visão Geral do Fluxo

```
💻 Desenvolvimento Local → 🧪 Testes Locais → 📤 GitHub → 🚀 Deploy Oracle → ✅ Verificação
```

## 🛠️ 1. Fase de Desenvolvimento Local

### 1.1 Ambiente de Desenvolvimento

```bash
# Estrutura do projeto local
Batuara.net/
├── src/Frontend/PublicWebsite/     # Site público (React + npm)
├── src/Frontend/AdminDashboard/    # Dashboard administrativo (React + npm)
├── src/Backend/API/                # API .NET (futuro)
├── docs/                           # Documentação
├── docker-compose.production.yml   # Para produção (Oracle)
├── Dockerfile.frontend             # Build dos frontends (produção)
└── update-production.sh            # Script de deploy

# Pré-requisitos para desenvolvimento local:
# - Node.js 18+ e npm
# - Git
# - Editor de código (VS Code recomendado)
# - .NET SDK 8+ (para API futura)
```

### 1.2 Comandos para Desenvolvimento Local

```bash
# Desenvolvimento local (SEM Docker - ambiente nativo)

# PublicWebsite - Terminal 1
cd src/Frontend/PublicWebsite
npm install  # primeira vez
npm start    # inicia em http://localhost:3000

# AdminDashboard - Terminal 2
cd src/Frontend/AdminDashboard
npm install  # primeira vez
npm start    # inicia em http://localhost:3001

# API .NET (quando implementada) - Terminal 3
cd src/Backend/API
dotnet run   # inicia em http://localhost:8080
```

### 1.3 Testes Locais

```bash
# Testes em ambiente de desenvolvimento (nativo)
# PublicWebsite
cd src/Frontend/PublicWebsite
npm test              # executar testes unitários
npm run build         # testar build de produção
npm run build:analyze # analisar bundle (se configurado)

# AdminDashboard
cd src/Frontend/AdminDashboard
npm test              # executar testes unitários
npm run build         # testar build de produção

# Teste de build Docker (opcional - simular produção)
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
./monitor-assets.sh   # verificar se tudo funciona
docker-compose -f docker-compose.production.yml down  # limpar
```

## 📤 2. Atualização do GitHub

### 2.1 Commits Seguros e Pontuais

```bash
# Verificar mudanças
git status
git diff

# Adicionar arquivos específicos (não usar git add .)
git add src/Frontend/PublicWebsite/src/components/NewComponent.tsx
git add src/Frontend/AdminDashboard/src/pages/NewPage.tsx

# Commit descritivo
git commit -m "feat: adicionar nova funcionalidade X

- Implementar componente Y no PublicWebsite
- Adicionar página Z no AdminDashboard
- Atualizar documentação relacionada
- Testes locais realizados com sucesso"

# Push para GitHub
git push origin master
```

### 2.2 Tipos de Commit Recomendados

```bash
# Novas funcionalidades
git commit -m "feat: descrição da funcionalidade"

# Correções de bugs
git commit -m "fix: correção do problema X"

# Melhorias de performance
git commit -m "perf: otimização do componente Y"

# Atualizações de documentação
git commit -m "docs: atualizar guia de instalação"

# Refatoração de código
git commit -m "refactor: reorganizar estrutura do componente Z"
```

## 🚀 3. Deploy na Oracle (Produção)

### 3.1 Script de Atualização Automatizado

Vou criar um script que automatiza todo o processo:

```bash
# Na Oracle, usar o script de atualização
./update-production.sh
```

### 3.2 Processo Manual (Passo a Passo)

```bash
# 1. Conectar na Oracle
ssh ubuntu@129.153.86.168

# 2. Navegar para o projeto
cd /var/www/batuara_net/Batuara.net

# 3. Fazer backup dos containers atuais (opcional)
docker tag batuara-publicwebsite batuara-publicwebsite:backup-$(date +%Y%m%d_%H%M%S)
docker tag batuara-admindashboard batuara-admindashboard:backup-$(date +%Y%m%d_%H%M%S)

# 4. Parar aplicações
docker-compose -f docker-compose.production.yml down

# 5. Atualizar código
git pull origin master

# 6. Rebuild das imagens (OBRIGATÓRIO para novas funcionalidades)
docker-compose -f docker-compose.production.yml build --no-cache

# 7. Iniciar aplicações
docker-compose -f docker-compose.production.yml up -d

# 8. Verificar se tudo está funcionando
./monitor-assets.sh

# 9. Verificar logs
docker-compose -f docker-compose.production.yml logs -f
```

## 📋 4. Script de Atualização Automatizado

Vou criar um script que automatiza todo o processo de atualização:

```bash
#!/bin/bash
# update-production.sh - Script de atualização automatizada

echo "=== INICIANDO ATUALIZAÇÃO DE PRODUÇÃO ==="
echo "Data: $(date)"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Erro: docker-compose.production.yml não encontrado"
    echo "Execute este script no diretório raiz do projeto"
    exit 1
fi

# 1. Fazer backup das imagens atuais
echo "📦 Fazendo backup das imagens atuais..."
BACKUP_TAG="backup-$(date +%Y%m%d_%H%M%S)"
docker tag batuara-publicwebsite batuara-publicwebsite:$BACKUP_TAG 2>/dev/null || echo "⚠️ Imagem batuara-publicwebsite não encontrada"
docker tag batuara-admindashboard batuara-admindashboard:$BACKUP_TAG 2>/dev/null || echo "⚠️ Imagem batuara-admindashboard não encontrada"

# 2. Parar aplicações
echo "⏹️ Parando aplicações..."
docker-compose -f docker-compose.production.yml down

# 3. Atualizar código
echo "📥 Atualizando código do GitHub..."
git pull origin master

# 4. Verificar se houve mudanças
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer pull do GitHub"
    exit 1
fi

# 5. Rebuild das imagens
echo "🔨 Reconstruindo imagens Docker..."
docker-compose -f docker-compose.production.yml build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Erro no build das imagens"
    echo "🔄 Tentando restaurar backup..."
    docker tag batuara-publicwebsite:$BACKUP_TAG batuara-publicwebsite:latest 2>/dev/null
    docker tag batuara-admindashboard:$BACKUP_TAG batuara-admindashboard:latest 2>/dev/null
    docker-compose -f docker-compose.production.yml up -d
    exit 1
fi

# 6. Iniciar aplicações
echo "🚀 Iniciando aplicações..."
docker-compose -f docker-compose.production.yml up -d

# 7. Aguardar inicialização
echo "⏳ Aguardando inicialização (30 segundos)..."
sleep 30

# 8. Verificar saúde das aplicações
echo "🔍 Verificando saúde das aplicações..."
./monitor-assets.sh

if [ $? -eq 0 ]; then
    echo "✅ Atualização concluída com sucesso!"
    echo ""
    echo "🌐 URLs de acesso:"
    echo "   PublicWebsite: http://129.153.86.168:3000"
    echo "   AdminDashboard: http://129.153.86.168:3001/dashboard"
    echo ""
    echo "📊 Para monitorar:"
    echo "   docker-compose -f docker-compose.production.yml logs -f"
    echo "   ./monitor-assets.sh"
else
    echo "⚠️ Aplicações iniciadas, mas com alguns problemas detectados"
    echo "Verifique os logs: docker-compose -f docker-compose.production.yml logs"
fi

echo ""
echo "=== ATUALIZAÇÃO FINALIZADA ==="
```

## 🔄 5. Processo Completo de Atualização

### 5.1 Checklist de Atualização

```bash
# ✅ ANTES DO DEPLOY
[ ] Testes locais realizados
[ ] Commit feito no GitHub
[ ] Funcionalidade testada localmente
[ ] Documentação atualizada (se necessário)

# ✅ DURANTE O DEPLOY
[ ] Backup das imagens atuais
[ ] Parar aplicações
[ ] Atualizar código (git pull)
[ ] Rebuild das imagens
[ ] Iniciar aplicações
[ ] Verificar saúde das aplicações

# ✅ APÓS O DEPLOY
[ ] Testar funcionalidades no navegador
[ ] Verificar logs por erros
[ ] Confirmar que assets carregam
[ ] Testar em dispositivos móveis (se aplicável)
```

### 5.2 Comandos Rápidos para Verificação

```bash
# Status dos containers
docker-compose -f docker-compose.production.yml ps

# Logs em tempo real
docker-compose -f docker-compose.production.yml logs -f

# Verificação completa
./monitor-assets.sh

# Teste rápido de conectividade
curl -I http://localhost:3000
curl -I http://localhost:3001
```

## 🚨 6. Rollback em Caso de Problemas

### 6.1 Rollback Rápido

```bash
# Se algo der errado, voltar para a versão anterior
docker-compose -f docker-compose.production.yml down

# Restaurar imagens de backup
BACKUP_TAG="backup-YYYYMMDD_HHMMSS"  # Usar o tag do backup
docker tag batuara-publicwebsite:$BACKUP_TAG batuara-publicwebsite:latest
docker tag batuara-admindashboard:$BACKUP_TAG batuara-admindashboard:latest

# Iniciar com versão anterior
docker-compose -f docker-compose.production.yml up -d
```

### 6.2 Rollback do Código

```bash
# Se necessário, voltar o código também
git log --oneline -5  # Ver últimos commits
git reset --hard COMMIT_HASH_ANTERIOR
git push --force origin master  # ⚠️ Usar com cuidado!
```

## 🤖 7. Futuro: CI/CD Automatizado

### 7.1 Ferramentas Recomendadas

**Para projetos pequenos/médios:**
- **GitHub Actions** (gratuito, integrado ao GitHub)
- **GitLab CI/CD** (se migrar para GitLab)

**Para projetos maiores:**
- **Jenkins** (mais controle, self-hosted)
- **Docker Hub** + **Watchtower** (auto-deploy)

### 7.2 Estrutura CI/CD Futura

```yaml
# .github/workflows/deploy.yml (GitHub Actions)
name: Deploy to Oracle
on:
  push:
    branches: [ master ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Oracle
        run: |
          ssh ubuntu@129.153.86.168 'cd /var/www/batuara_net/Batuara.net && ./update-production.sh'
```

## 📊 8. Monitoramento Contínuo

### 8.1 Logs Importantes

```bash
# Logs das aplicações
tail -f /var/log/batuara-monitor.log

# Logs do Docker
journalctl -u docker.service -f

# Logs específicos dos containers
docker logs batuara-public-website -f
docker logs batuara-admin-dashboard -f
```

### 8.2 Alertas Automáticos (Futuro)

```bash
# Configurar alertas por email/Slack quando:
# - Aplicação não responde
# - Assets retornam 404
# - Uso de memória/CPU alto
# - Espaço em disco baixo
```

## 📝 9. Boas Práticas

### 9.1 Desenvolvimento

- ✅ Sempre testar localmente antes do commit
- ✅ Commits pequenos e frequentes
- ✅ Mensagens de commit descritivas
- ✅ Não commitar arquivos de configuração sensíveis
- ✅ Usar branches para features grandes (futuro)

### 9.2 Deploy

- ✅ Sempre fazer backup antes do deploy
- ✅ Verificar saúde das aplicações após deploy
- ✅ Manter logs de deploy para auditoria
- ✅ Testar em horários de menor tráfego
- ✅ Ter plano de rollback pronto

### 9.3 Monitoramento

- ✅ Verificar aplicações pelo menos 2x por dia
- ✅ Monitorar uso de recursos do servidor
- ✅ Manter backups regulares
- ✅ Documentar problemas e soluções

---

## 🎯 Resumo do Fluxo

1. **Desenvolvimento Local** → Implementar e testar
2. **GitHub** → Commit e push das mudanças
3. **Oracle** → `./update-production.sh` ou processo manual
4. **Verificação** → `./monitor-assets.sh` e testes no navegador
5. **Monitoramento** → Acompanhar logs e performance

---

**Criado para**: Projeto Batuara.net  
**Última atualização**: Agosto 2025  
**Próxima evolução**: Implementação de CI/CD automatizado