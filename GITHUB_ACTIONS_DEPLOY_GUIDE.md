# Guia Completo: Deploy Automático via GitHub Actions para OCI

## 📋 Visão Geral

Este guia documenta o processo completo de configuração de deploy automático via GitHub Actions para Oracle Cloud Infrastructure (OCI), baseado na implementação bem-sucedida do projeto MobileMed.

## 🎯 Objetivos

- Automatizar deploy para OCI via GitHub Actions
- Configurar nginx para múltiplos projetos
- Gerenciar containers Docker automaticamente
- Implementar health checks e rollback

## 📁 Estrutura de Arquivos Necessários

```
.github/
└── workflows/
    └── deploy.yml
nginx/
└── [projeto].conf
docs/
└── OCI_DEPLOYMENT.md
```

## 🔧 1. Configuração do GitHub Actions Workflow

### Arquivo: `.github/workflows/deploy.yml`

```yaml
name: Deploy to OCI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.OCI_SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.OCI_HOST }} >> ~/.ssh/known_hosts

    - name: Deploy to OCI
      run: |
        ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.OCI_HOST }} << 'EOF'
          # Navegar para o diretório do projeto
          cd /home/ubuntu/[NOME_DO_PROJETO]
          
          # Fazer pull das últimas alterações
          git pull origin main
          
          # Parar containers existentes
          docker-compose down || true
          
          # Remover containers antigos
          docker container prune -f
          
          # Rebuild e start dos containers
          docker-compose up -d --build
          
          # Aguardar containers iniciarem
          sleep 30
          
          # Health check
          if curl -f http://localhost:[PORTA_FRONTEND]/health > /dev/null 2>&1; then
            echo "✅ Deploy realizado com sucesso!"
          else
            echo "❌ Falha no health check"
            exit 1
          fi
        EOF

    - name: Verify deployment
      run: |
        # Verificar se o serviço está respondendo
        if curl -f http://${{ secrets.OCI_HOST }}:[PORTA_FRONTEND] > /dev/null 2>&1; then
          echo "✅ Serviço está online e funcionando!"
        else
          echo "❌ Serviço não está respondendo"
          exit 1
        fi
```

## 🔐 2. Configuração de Secrets no GitHub

### Secrets necessários:

1. **OCI_SSH_PRIVATE_KEY**: Chave SSH privada para acesso à OCI
2. **OCI_HOST**: IP público da instância OCI
3. **OCI_USER**: Usuário para conexão SSH (geralmente 'ubuntu')

### Como configurar:

1. Vá para Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret com seu respectivo valor

## 🌐 3. Configuração do Nginx

### Arquivo: `nginx/[projeto].conf`

```nginx
server {
    listen 80;
    server_name [DOMINIO_OU_IP];

    # Configuração para o frontend
    location / {
        proxy_pass http://localhost:[PORTA_FRONTEND];
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuração para a API
    location /api/ {
        proxy_pass http://localhost:[PORTA_API]/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        
        # Handle preflight requests
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 🐳 4. Docker Compose Configuration

### Arquivo: `docker-compose.yml`

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./src/Web
      dockerfile: Dockerfile
    container_name: [projeto]-frontend
    ports:
      - "[PORTA_FRONTEND]:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    build:
      context: ./src/Api
      dockerfile: Dockerfile
    container_name: [projeto]-api
    ports:
      - "[PORTA_API]:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - database

  database:
    image: postgres:15
    container_name: [projeto]-db
    environment:
      - POSTGRES_DB=[nome_db]
      - POSTGRES_USER=[usuario_db]
      - POSTGRES_PASSWORD=[senha_db]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## ⚙️ 5. Configuração na OCI

### 5.1 Portas no Security List

Adicionar regras de entrada:
- **Porta [PORTA_FRONTEND]**: TCP, Source 0.0.0.0/0
- **Porta [PORTA_API]**: TCP, Source 0.0.0.0/0
- **Porta 80**: TCP, Source 0.0.0.0/0 (nginx)
- **Porta 443**: TCP, Source 0.0.0.0/0 (HTTPS)

### 5.2 Configuração do Nginx na OCI

```bash
# Copiar configuração do nginx
sudo cp nginx/[projeto].conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/[projeto].conf /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

## 🔍 6. Health Checks e Monitoramento

### Script de Health Check

```bash
#!/bin/bash
# health-check.sh

FRONTEND_URL="http://localhost:[PORTA_FRONTEND]"
API_URL="http://localhost:[PORTA_API]/health"

echo "🔍 Verificando saúde dos serviços..."

# Check Frontend
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FALHA"
    exit 1
fi

# Check API
if curl -f $API_URL > /dev/null 2>&1; then
    echo "✅ API: OK"
else
    echo "❌ API: FALHA"
    exit 1
fi

echo "🎉 Todos os serviços estão funcionando!"
```

## 📝 7. Checklist de Implementação

### Pré-requisitos:
- [ ] Instância OCI configurada
- [ ] Docker e Docker Compose instalados na OCI
- [ ] Nginx instalado e configurado na OCI
- [ ] Chave SSH configurada
- [ ] Repositório GitHub configurado

### Configuração:
- [ ] Criar arquivo `.github/workflows/deploy.yml`
- [ ] Configurar secrets no GitHub
- [ ] Criar configuração nginx específica do projeto
- [ ] Configurar `docker-compose.yml`
- [ ] Definir portas específicas do projeto
- [ ] Configurar Security List na OCI

### Testes:
- [ ] Testar deploy manual
- [ ] Verificar health checks
- [ ] Testar rollback em caso de falha
- [ ] Validar acesso externo

## 🚀 8. Exemplo de Implementação para Batuara.net

### Portas sugeridas:
- **Frontend**: 3000 (já em uso)
- **API**: 3001
- **Database**: 5432 (interno)

### Configuração específica:

```yaml
# .github/workflows/deploy.yml para Batuara.net
name: Deploy Batuara.net to OCI

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to OCI
      run: |
        ssh ubuntu@${{ secrets.OCI_HOST }} << 'EOF'
          cd /home/ubuntu/batuara
          git pull origin main
          docker-compose down
          docker-compose up -d --build
          sleep 30
          curl -f http://localhost:3000/health
        EOF
```

## 🔧 9. Troubleshooting

### Problemas Comuns:

1. **Falha na conexão SSH**
   - Verificar chave SSH e permissões (chmod 600)
   - Confirmar IP da OCI nos secrets

2. **Containers não iniciam**
   - Verificar logs: `docker-compose logs`
   - Verificar portas em uso: `netstat -tulpn`

3. **Nginx não redireciona**
   - Testar configuração: `sudo nginx -t`
   - Verificar logs: `sudo tail -f /var/log/nginx/error.log`

4. **Health check falha**
   - Verificar se serviços estão rodando
   - Testar endpoints manualmente

## 📚 10. Recursos Adicionais

- [Documentação GitHub Actions](https://docs.github.com/en/actions)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [OCI Documentation](https://docs.oracle.com/en-us/iaas/)

---

**Nota**: Este guia foi criado baseado na implementação bem-sucedida do projeto MobileMed. Adapte as configurações específicas (portas, nomes, etc.) conforme necessário para seu projeto.

**Autor**: Implementação baseada na experiência MobileMed  
**Data**: Janeiro 2025  
**Versão**: 1.0