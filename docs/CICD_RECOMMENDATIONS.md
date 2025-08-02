# 🤖 Recomendações de CI/CD para Batuara.net

Este documento apresenta as melhores opções de CI/CD para automatizar o processo de deploy do projeto Batuara.net.

## 🎯 Objetivo

Automatizar o fluxo: **Commit → GitHub → Deploy Automático → Verificação**

## 🏆 Opções Recomendadas

### 1. **GitHub Actions** (⭐ RECOMENDADO)

**Por que escolher:**
- ✅ Gratuito para repositórios públicos
- ✅ Integração nativa com GitHub
- ✅ Fácil configuração
- ✅ Comunidade ativa
- ✅ Marketplace com actions prontas

**Configuração:**

```yaml
# .github/workflows/deploy-oracle.yml
name: Deploy to Oracle

on:
  push:
    branches: [ master ]
  workflow_dispatch: # Permite execução manual

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Deploy to Oracle
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.ORACLE_HOST }}
        username: ${{ secrets.ORACLE_USER }}
        key: ${{ secrets.ORACLE_SSH_KEY }}
        script: |
          cd /var/www/batuara_net/Batuara.net
          ./update-production.sh
          
    - name: Notify on success
      if: success()
      run: echo "Deploy realizado com sucesso!"
      
    - name: Notify on failure
      if: failure()
      run: echo "Deploy falhou! Verificar logs."
```

**Configuração de Secrets:**
```
ORACLE_HOST: 129.153.86.168
ORACLE_USER: ubuntu
ORACLE_SSH_KEY: [sua chave SSH privada]
```

### 2. **GitLab CI/CD**

**Vantagens:**
- ✅ CI/CD integrado
- ✅ Docker Registry incluído
- ✅ Pipelines visuais
- ✅ Gratuito até 400 minutos/mês

**Configuração:**

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - master

deploy:
  stage: deploy
  script:
    - ssh ubuntu@129.153.86.168 "cd /var/www/batuara_net/Batuara.net && ./update-production.sh"
  only:
    - master
```

### 3. **Jenkins** (Para Controle Total)

**Vantagens:**
- ✅ Controle total sobre o processo
- ✅ Plugins extensivos
- ✅ Self-hosted
- ✅ Pipelines complexas

**Configuração:**

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/guelfi/Batuara.net.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'docker-compose -f docker-compose.production.yml build --no-cache'
            }
        }
        
        stage('Deploy') {
            steps {
                sshagent(['oracle-ssh-key']) {
                    sh '''
                        ssh ubuntu@129.153.86.168 "
                            cd /var/www/batuara_net/Batuara.net &&
                            ./update-production.sh
                        "
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deploy realizado com sucesso!'
        }
        failure {
            echo 'Deploy falhou!'
        }
    }
}
```

### 4. **Watchtower** (Deploy Automático por Imagem)

**Conceito:**
- Monitora mudanças nas imagens Docker
- Atualiza containers automaticamente
- Simples de configurar

**Configuração:**

```yaml
# docker-compose.production.yml (adicionar)
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 --cleanup
    restart: unless-stopped
```

## 🚀 Implementação Recomendada (GitHub Actions)

### Passo 1: Configurar SSH Key

```bash
# No seu computador local
ssh-keygen -t rsa -b 4096 -C "github-actions@batuara.net"

# Copiar chave pública para Oracle
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@129.153.86.168

# Copiar chave privada para GitHub Secrets
cat ~/.ssh/id_rsa
```

### Passo 2: Configurar Secrets no GitHub

1. Ir para: `Settings → Secrets and variables → Actions`
2. Adicionar secrets:
   - `ORACLE_HOST`: `129.153.86.168`
   - `ORACLE_USER`: `ubuntu`
   - `ORACLE_SSH_KEY`: [conteúdo da chave privada]

### Passo 3: Criar Workflow

```bash
# Criar diretório
mkdir -p .github/workflows

# Criar arquivo de workflow
cat > .github/workflows/deploy-oracle.yml << 'EOF'
name: 🚀 Deploy to Oracle

on:
  push:
    branches: [ master ]
    paths-ignore:
      - 'docs/**'
      - '*.md'
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v3
      
    - name: 🚀 Deploy to Oracle
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.ORACLE_HOST }}
        username: ${{ secrets.ORACLE_USER }}
        key: ${{ secrets.ORACLE_SSH_KEY }}
        script: |
          cd /var/www/batuara_net/Batuara.net
          ./update-production.sh
          
    - name: ✅ Verify deployment
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.ORACLE_HOST }}
        username: ${{ secrets.ORACLE_USER }}
        key: ${{ secrets.ORACLE_SSH_KEY }}
        script: |
          cd /var/www/batuara_net/Batuara.net
          ./monitor-assets.sh
EOF
```

### Passo 4: Testar o Workflow

```bash
# Fazer um commit de teste
git add .github/workflows/deploy-oracle.yml
git commit -m "feat: adicionar CI/CD com GitHub Actions"
git push origin master

# Verificar no GitHub: Actions tab
```

## 📊 Comparação das Opções

| Ferramenta | Custo | Facilidade | Controle | Integração GitHub |
|------------|-------|------------|----------|-------------------|
| GitHub Actions | Gratuito* | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitLab CI/CD | Gratuito* | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Jenkins | Gratuito | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Watchtower | Gratuito | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

*Gratuito com limitações

## 🔔 Notificações e Monitoramento

### Slack Integration

```yaml
# Adicionar ao workflow
- name: 📢 Notify Slack on success
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "🎉 Deploy do Batuara.net realizado com sucesso!"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

- name: 🚨 Notify Slack on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "❌ Deploy do Batuara.net falhou!"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

```yaml
- name: 📧 Send email on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "❌ Deploy Batuara.net Failed"
    body: "O deploy do Batuara.net falhou. Verifique os logs no GitHub Actions."
    to: admin@batuara.net
```

## 🛡️ Segurança e Boas Práticas

### 1. Ambientes Separados

```yaml
# Diferentes workflows para diferentes ambientes
# .github/workflows/deploy-staging.yml (para testes)
# .github/workflows/deploy-production.yml (para produção)
```

### 2. Aprovação Manual para Produção

```yaml
deploy-production:
  needs: deploy-staging
  environment: production # Requer aprovação manual
  runs-on: ubuntu-latest
```

### 3. Rollback Automático

```yaml
- name: 🔄 Rollback on health check failure
  if: failure()
  uses: appleboy/ssh-action@v0.1.5
  with:
    host: ${{ secrets.ORACLE_HOST }}
    username: ${{ secrets.ORACLE_USER }}
    key: ${{ secrets.ORACLE_SSH_KEY }}
    script: |
      cd /var/www/batuara_net/Batuara.net
      # Executar rollback usando backup mais recente
      BACKUP_TAG=$(docker images --format "{{.Tag}}" batuara-publicwebsite | grep backup | head -1)
      if [ ! -z "$BACKUP_TAG" ]; then
        docker-compose -f docker-compose.production.yml down
        docker tag batuara-publicwebsite:$BACKUP_TAG batuara-publicwebsite:latest
        docker tag batuara-admindashboard:$BACKUP_TAG batuara-admindashboard:latest
        docker-compose -f docker-compose.production.yml up -d
      fi
```

## 📈 Métricas e Monitoramento

### 1. Deploy Frequency
- Quantos deploys por semana/mês
- Tempo médio de deploy

### 2. Success Rate
- Porcentagem de deploys bem-sucedidos
- Tempo médio para rollback

### 3. Health Monitoring
- Uptime das aplicações
- Response time
- Error rate

## 🎯 Roadmap de Implementação

### Fase 1: Básico (1-2 semanas)
- [ ] Configurar GitHub Actions
- [ ] Automatizar deploy básico
- [ ] Configurar notificações

### Fase 2: Melhorias (2-4 semanas)
- [ ] Adicionar testes automatizados
- [ ] Implementar rollback automático
- [ ] Configurar ambientes separados

### Fase 3: Avançado (1-2 meses)
- [ ] Monitoramento avançado
- [ ] Métricas de performance
- [ ] Blue-green deployment

---

## 🎯 Recomendação Final

**Para o Batuara.net, recomendo começar com GitHub Actions** porque:

1. ✅ **Gratuito** para o projeto
2. ✅ **Fácil de configurar** e manter
3. ✅ **Integração perfeita** com GitHub
4. ✅ **Comunidade ativa** e documentação
5. ✅ **Escalável** para futuras necessidades

**Próximo passo:** Implementar o workflow básico e evoluir gradualmente.

---

**Criado para**: Projeto Batuara.net  
**Última atualização**: Agosto 2025  
**Status**: Pronto para implementação