#!/bin/bash

# Batuara.net Deploy Fixer - Sistema de correção automática inteligente
# Este script diagnostica e corrige automaticamente problemas comuns de deploy

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configurações
BACKUP_DIR="./deploy-backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./deploy-fix.log"

# Função para log
log() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[FIX]${NC} $1" | tee -a "$LOG_FILE"
}

# Função para criar backup
create_backup() {
    local file=$1
    if [ -f "$file" ]; then
        mkdir -p "$BACKUP_DIR"
        cp "$file" "$BACKUP_DIR/"
        log "Backup criado: $BACKUP_DIR/$(basename $file)"
    fi
}

# Função para verificar e criar index.html
fix_index_html() {
    local project_path=$1
    local project_name=$2
    local title=$3
    
    local public_dir="$project_path/public"
    local index_file="$public_dir/index.html"
    
    if [ ! -d "$public_dir" ]; then
        info "Criando diretório public para $project_name"
        mkdir -p "$public_dir"
    fi
    
    if [ ! -f "$index_file" ]; then
        info "Criando index.html para $project_name"
        cat > "$index_file" << EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="$title" />
    <title>$title</title>
</head>
<body>
    <noscript>Você precisa habilitar JavaScript para executar esta aplicação.</noscript>
    <div id="root"></div>
</body>
</html>
EOF
        success "index.html criado para $project_name"
    else
        log "index.html já existe para $project_name"
    fi
    
    # Criar favicon básico se não existir
    local favicon_file="$public_dir/favicon.ico"
    if [ ! -f "$favicon_file" ]; then
        info "Criando favicon básico para $project_name"
        # Criar um favicon 16x16 básico
        echo -e '\x00\x00\x01\x00\x01\x00\x10\x10\x00\x00\x01\x00\x20\x00\x68\x04\x00\x00\x16\x00\x00\x00' > "$favicon_file"
        success "favicon.ico criado para $project_name"
    fi
}

# Função para corrigir Dockerfile
fix_dockerfile() {
    local dockerfile_path="./Dockerfile.frontend"
    
    if [ ! -f "$dockerfile_path" ]; then
        info "Criando Dockerfile otimizado para React"
        cat > "$dockerfile_path" << 'EOF'
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

# Verifica se existe public/index.html, se não cria um básico
RUN if [ ! -f "public/index.html" ]; then \
    mkdir -p public && \
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Batuara.net</title></head><body><div id="root"></div></body></html>' > public/index.html; \
fi

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
        success "Dockerfile.frontend criado"
    else
        log "Dockerfile.frontend já existe"
    fi
}

# Função para corrigir docker-compose.yml
fix_docker_compose() {
    local compose_file="./docker-compose.yml"
    
    if [ -f "$compose_file" ]; then
        create_backup "$compose_file"
    fi
    
    info "Criando docker-compose.yml corrigido"
    cat > "$compose_file" << 'EOF'
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
    success "docker-compose.yml corrigido criado"
}

# Função para validar estrutura do projeto
validate_project_structure() {
    log "Validando estrutura do projeto..."
    
    local errors=0
    
    # Verificar arquivos essenciais
    local required_files=(
        "Batuara.sln"
        "src/Backend/Batuara.API/Batuara.API.csproj"
        "src/Frontend/PublicWebsite/package.json"
        "src/Frontend/AdminDashboard/package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Arquivo obrigatório não encontrado: $file"
            ((errors++))
        else
            log "✅ $file encontrado"
        fi
    done
    
    return $errors
}

# Função principal de diagnóstico e correção
main() {
    echo "🔧 Batuara.net Deploy Fixer v1.0"
    echo "================================="
    echo ""
    
    # Inicializar log
    echo "Deploy Fix iniciado em $(date)" > "$LOG_FILE"
    
    # 1. Validar se estamos na pasta correta
    if [ ! -f "Batuara.sln" ]; then
        error "Arquivo Batuara.sln não encontrado!"
        error "Execute este script na pasta raiz do projeto Batuara.net"
        exit 1
    fi
    
    log "✅ Pasta do projeto Batuara.net identificada"
    
    # 2. Validar estrutura do projeto
    if ! validate_project_structure; then
        error "Estrutura do projeto inválida. Verifique se todos os arquivos estão presentes."
        exit 1
    fi
    
    # 3. Criar diretório de backup
    mkdir -p "$BACKUP_DIR"
    log "Diretório de backup criado: $BACKUP_DIR"
    
    # 4. Corrigir arquivos index.html
    fix_index_html "src/Frontend/PublicWebsite" "PublicWebsite" "Casa de Caridade Caboclo Batuara"
    fix_index_html "src/Frontend/AdminDashboard" "AdminDashboard" "Batuara Admin - Painel Administrativo"
    
    # 5. Corrigir Dockerfile
    fix_dockerfile
    
    # 6. Corrigir docker-compose.yml
    fix_docker_compose
    
    # 7. Verificar sintaxe do docker-compose
    log "Validando sintaxe do docker-compose.yml..."
    if docker-compose config > /dev/null 2>&1; then
        success "✅ Sintaxe do docker-compose.yml válida"
    else
        error "❌ Erro na sintaxe do docker-compose.yml"
        exit 1
    fi
    
    # 8. Limpar containers antigos se existirem
    log "Limpando containers antigos..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    
    # 9. Relatório final
    echo ""
    echo "🎉 Correções aplicadas com sucesso!"
    echo "=================================="
    echo ""
    echo "📁 Backups salvos em: $BACKUP_DIR"
    echo "📋 Log detalhado em: $LOG_FILE"
    echo ""
    echo "✅ Correções aplicadas:"
    echo "   • index.html criado para PublicWebsite"
    echo "   • index.html criado para AdminDashboard"
    echo "   • Dockerfile.frontend otimizado"
    echo "   • docker-compose.yml corrigido"
    echo "   • Containers antigos limpos"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Execute: docker-compose build --no-cache"
    echo "   2. Execute: docker-compose up -d"
    echo "   3. Verifique os logs: docker-compose logs -f"
    echo ""
    echo "🔍 Para reverter as mudanças:"
    echo "   Execute: ./rollback-deploy.sh $BACKUP_DIR"
    echo ""
    
    # Criar script de rollback
    cat > "./rollback-deploy.sh" << EOF
#!/bin/bash
# Script de rollback automático
BACKUP_DIR=\$1
if [ -z "\$BACKUP_DIR" ]; then
    echo "Uso: \$0 <diretório_backup>"
    exit 1
fi

echo "Restaurando arquivos do backup: \$BACKUP_DIR"
if [ -d "\$BACKUP_DIR" ]; then
    cp \$BACKUP_DIR/* . 2>/dev/null || true
    echo "Rollback concluído!"
else
    echo "Diretório de backup não encontrado: \$BACKUP_DIR"
    exit 1
fi
EOF
    chmod +x "./rollback-deploy.sh"
    
    success "Script de correção concluído com sucesso!"
}

# Executar função principal
main "$@"