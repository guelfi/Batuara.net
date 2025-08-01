#!/bin/bash

# Gerador de configurações dinâmicas para deploy Batuara.net
# Este script detecta automaticamente o ambiente e gera configurações apropriadas

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[CONFIG]${NC} $1"
}

echo "🔧 Gerador de Configurações Batuara.net Deploy"
echo "=============================================="

# 1. Detectar IP público do servidor
log "Detectando IP público do servidor..."
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP_NAO_DETECTADO")

if [ "$PUBLIC_IP" = "IP_NAO_DETECTADO" ]; then
    warn "Não foi possível detectar o IP público automaticamente"
    read -p "Digite o IP público do servidor: " PUBLIC_IP
fi

info "IP público detectado: $PUBLIC_IP"

# 2. Gerar senha forte para banco de dados
log "Gerando senha forte para banco de dados..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
info "Senha do banco gerada (25 caracteres)"

# 3. Detectar informações do sistema
log "Coletando informações do sistema..."
HOSTNAME=$(hostname)
MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
DISK_GB=$(df -BG / | awk 'NR==2{print $2}' | sed 's/G//')
CPU_CORES=$(nproc)

info "Hostname: $HOSTNAME"
info "Memória: ${MEMORY_GB}GB"
info "Disco: ${DISK_GB}GB"
info "CPU Cores: $CPU_CORES"

# 4. Solicitar domínios (opcional)
echo ""
read -p "Você tem domínios configurados? (y/n): " HAS_DOMAINS

if [ "$HAS_DOMAINS" = "y" ] || [ "$HAS_DOMAINS" = "Y" ]; then
    read -p "Digite o domínio principal (ex: batuara.org.br): " MAIN_DOMAIN
    read -p "Digite o domínio admin (ex: admin.batuara.org.br): " ADMIN_DOMAIN
    PRODUCTION_MODE="true"
    info "Modo produção ativado com domínios"
else
    MAIN_DOMAIN="$PUBLIC_IP:8003"
    ADMIN_DOMAIN="$PUBLIC_IP:8004"
    PRODUCTION_MODE="false"
    info "Modo teste ativado com IP e portas"
fi

# 5. Criar arquivo .env
log "Criando arquivo .env..."
cat > .env << EOF
# Configurações geradas automaticamente em $(date)
# Servidor: $HOSTNAME ($PUBLIC_IP)
# Recursos: ${CPU_CORES} cores, ${MEMORY_GB}GB RAM, ${DISK_GB}GB disk

# Senha do banco de dados (gerada automaticamente)
DB_PASSWORD=$DB_PASSWORD

# Configurações do servidor
SERVER_IP=$PUBLIC_IP
SERVER_HOSTNAME=$HOSTNAME

# URLs da API
VITE_API_BASE_URL_TEST=http://$PUBLIC_IP
VITE_API_BASE_URL_PROD=https://$MAIN_DOMAIN

# Domínios
PUBLIC_WEBSITE_DOMAIN=$MAIN_DOMAIN
ADMIN_DASHBOARD_DOMAIN=$ADMIN_DOMAIN

# Modo de produção
PRODUCTION_MODE=$PRODUCTION_MODE

# Configurações de recursos
MEMORY_LIMIT=${MEMORY_GB}g
CPU_LIMIT=$CPU_CORES

# Configurações de backup
BACKUP_RETENTION_DAYS=7
BACKUP_SCHEDULE="0 2 * * *"
EOF

info "Arquivo .env criado com sucesso"

# 6. Criar arquivo de configuração do deploy
log "Criando configuração de deploy..."
cat > deploy-config.json << EOF
{
  "server": {
    "ip": "$PUBLIC_IP",
    "hostname": "$HOSTNAME",
    "resources": {
      "memory_gb": $MEMORY_GB,
      "disk_gb": $DISK_GB,
      "cpu_cores": $CPU_CORES
    }
  },
  "domains": {
    "main": "$MAIN_DOMAIN",
    "admin": "$ADMIN_DOMAIN",
    "production_mode": $PRODUCTION_MODE
  },
  "generated_at": "$(date -Iseconds)",
  "config_version": "1.0"
}
EOF

# 7. Atualizar arquivos HTML com configurações dinâmicas
log "Atualizando arquivos de deploy..."

# Substituir IP nos arquivos HTML se existirem
if [ -f "deploy-infra-compartilhada.html" ]; then
    sed -i "s/129\.153\.86\.168/$PUBLIC_IP/g" deploy-infra-compartilhada.html
    info "deploy-infra-compartilhada.html atualizado"
fi

if [ -f "deploy-batuara.html" ]; then
    sed -i "s/129\.153\.86\.168/$PUBLIC_IP/g" deploy-batuara.html
    info "deploy-batuara.html atualizado"
fi

# 8. Criar script de validação personalizado
log "Criando script de validação..."
cat > validate-environment.sh << 'EOF'
#!/bin/bash

# Script de validação personalizado
source .env

echo "🔍 Validando ambiente para Batuara.net"
echo "======================================"

# Validar conectividade
echo -n "Testando conectividade externa... "
if curl -s --connect-timeout 5 google.com > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FALHA"
fi

# Validar recursos
echo "📊 Recursos do sistema:"
echo "   IP: $SERVER_IP"
echo "   Hostname: $SERVER_HOSTNAME"
echo "   Memória: ${MEMORY_LIMIT}"
echo "   CPU: ${CPU_LIMIT} cores"

# Validar portas
echo -n "Verificando portas necessárias... "
PORTS_OK=true
for port in 80 443 8001 8002 8003 8004; do
    if ss -tuln | grep -q ":$port "; then
        echo "⚠️  Porta $port já está em uso"
        PORTS_OK=false
    fi
done

if [ "$PORTS_OK" = true ]; then
    echo "✅ Todas as portas estão disponíveis"
fi

echo ""
echo "🎯 Configuração pronta para deploy!"
EOF

chmod +x validate-environment.sh

# 9. Resumo final
echo ""
echo "🎉 Configuração concluída com sucesso!"
echo "====================================="
echo ""
echo "📁 Arquivos criados:"
echo "   ✅ .env (configurações principais)"
echo "   ✅ deploy-config.json (metadados)"
echo "   ✅ validate-environment.sh (validação)"
echo ""
echo "🌐 URLs de acesso (após deploy):"
echo "   🏠 Site público: http://$MAIN_DOMAIN"
echo "   ⚙️  Admin: http://$ADMIN_DOMAIN"
echo ""
echo "🔐 Informações importantes:"
echo "   📊 IP do servidor: $PUBLIC_IP"
echo "   🔑 Senha do banco: [gerada automaticamente no .env]"
echo "   🏷️  Modo: $([ "$PRODUCTION_MODE" = "true" ] && echo "Produção" || echo "Teste")"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute: ./validate-environment.sh"
echo "   2. Revise o arquivo .env se necessário"
echo "   3. Prossiga com o deploy usando os arquivos HTML"
echo ""

log "Configuração salva! Você pode executar este script novamente para reconfigurar."