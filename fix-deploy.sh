#!/bin/bash

# Script para corrigir problemas de deploy do Batuara.net
# Execute este script no servidor na pasta /var/www/batuara_net

set -e

echo "🔧 Iniciando correção do deploy Batuara.net..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se estamos na pasta correta
if [ ! -f "Batuara.sln" ]; then
    error "Arquivo Batuara.sln não encontrado. Execute este script na pasta /var/www/batuara_net"
    exit 1
fi

log "✅ Pasta correta identificada"

# 2. Criar index.html se não existir no PublicWebsite
PUBLIC_INDEX="src/Frontend/PublicWebsite/public/index.html"
if [ ! -f "$PUBLIC_INDEX" ]; then
    warn "Arquivo index.html não encontrado em PublicWebsite, criando..."
    mkdir -p "src/Frontend/PublicWebsite/public"
    cat > "$PUBLIC_INDEX" << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Casa de Caridade Caboclo Batuara - Site oficial" />
    <title>Casa de Caridade Caboclo Batuara</title>
</head>
<body>
    <noscript>Você precisa habilitar JavaScript para executar esta aplicação.</noscript>
    <div id="root"></div>
</body>
</html>
EOF
    log "✅ index.html criado para PublicWebsite"
else
    log "✅ index.html já existe em PublicWebsite"
fi

# 3. Criar index.html se não existir no AdminDashboard
ADMIN_INDEX="src/Frontend/AdminDashboard/public/index.html"
if [ ! -f "$ADMIN_INDEX" ]; then
    warn "Arquivo index.html não encontrado em AdminDashboard, criando..."
    mkdir -p "src/Frontend/AdminDashboard/public"
    cat > "$ADMIN_INDEX" << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Casa de Caridade Caboclo Batuara - Painel Administrativo" />
    <title>Batuara Admin - Painel Administrativo</title>
</head>
<body>
    <noscript>Você precisa habilitar JavaScript para executar esta aplicação.</noscript>
    <div id="root"></div>
</body>
</html>
EOF
    log "✅ index.html criado para AdminDashboard"
else
    log "✅ index.html já existe em AdminDashboard"
fi

# 4. Verificar se existe favicon.ico, se não criar um básico
for dir in "src/Frontend/PublicWebsite/public" "src/Frontend/AdminDashboard/public"; do
    if [ ! -f "$dir/favicon.ico" ]; then
        warn "favicon.ico não encontrado em $dir, criando um básico..."
        # Criar um favicon básico (1x1 pixel transparente)
        echo -e '\x00\x00\x01\x00\x01\x00\x01\x01\x00\x00\x01\x00\x18\x00\x30\x00\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x01\x00\x00\x00\x02\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xFF\xFF\x00' > "$dir/favicon.ico"
        log "✅ favicon.ico básico criado em $dir"
    fi
done

# 5. Verificar se os package.json existem
for dir in "src/Frontend/PublicWebsite" "src/Frontend/AdminDashboard"; do
    if [ ! -f "$dir/package.json" ]; then
        error "package.json não encontrado em $dir"
        exit 1
    fi
    log "✅ package.json encontrado em $dir"
done

# 6. Criar Dockerfile otimizado para frontend
cat > "Dockerfile.frontend" << 'EOF'
# Dockerfile otimizado para frontends React (Create React App)
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de dependências primeiro (para cache)
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código fonte
COPY . .

# Argumento para URL da API
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:stable-alpine

# Copia arquivos buildados
COPY --from=build /app/build /usr/share/nginx/html

# Configuração nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

log "✅ Dockerfile.frontend criado"

# 7. Backup do docker-compose.yml original
if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup
    log "✅ Backup do docker-compose.yml criado"
fi

# 8. Criar docker-compose.yml corrigido
cat > "docker-compose.yml" << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: batuara-db
    restart: unless-stopped
    env_file:
      - ./.env
    environment:
      - POSTGRES_DB=batuara_db
      - POSTGRES_USER=batuara_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - batuara-db-data:/var/lib/postgresql/data
    networks: [batuara-net]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U batuara_user -d batuara_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: batuara-api
    restart: unless-stopped
    env_file:
      - ./.env
    depends_on:
      db:
        condition: service_healthy
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=batuara_db;Username=batuara_user;Password=${DB_PASSWORD}
      - ASPNETCORE_URLS=http://+:8080
    networks: [batuara-net]
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  public-website:
    build:
      context: ./src/Frontend/PublicWebsite
      dockerfile: ../../../Dockerfile.frontend
      args:
        REACT_APP_API_URL: ${VITE_API_BASE_URL_TEST}:8003/api
    container_name: batuara-public-website
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    networks:
      - batuara-net
      - proxy-net
    expose: [80]
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

  admin-dashboard:
    build:
      context: ./src/Frontend/AdminDashboard
      dockerfile: ../../../Dockerfile.frontend
      args:
        REACT_APP_API_URL: ${VITE_API_BASE_URL_TEST}:8004/api
    container_name: batuara-admin-dashboard
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    networks:
      - batuara-net
      - proxy-net
    expose: [80]
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

networks:
  batuara-net:
    driver: bridge
  proxy-net:
    external: true

volumes:
  batuara-db-data:
    driver: local
EOF

log "✅ docker-compose.yml corrigido criado"

# 9. Verificar sintaxe do docker-compose
if docker-compose config > /dev/null 2>&1; then
    log "✅ Sintaxe do docker-compose.yml válida"
else
    error "❌ Erro na sintaxe do docker-compose.yml"
    exit 1
fi

# 10. Limpar containers e imagens antigas se existirem
log "🧹 Limpando containers antigos..."
docker-compose down --remove-orphans 2>/dev/null || true
docker system prune -f 2>/dev/null || true

log "🎉 Correções aplicadas com sucesso!"
log "📋 Próximos passos:"
log "   1. Execute: docker-compose build --no-cache"
log "   2. Execute: docker-compose up -d"
log "   3. Verifique os logs: docker-compose logs -f"

echo ""
echo "🚀 Script de correção concluído!"