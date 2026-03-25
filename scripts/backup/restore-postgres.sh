#!/bin/bash

set -euo pipefail

# ============================================
# Restore Script - Batuara.net PostgreSQL
# ============================================

BACKUP_DIR="${BACKUP_DIR:-/var/backups/batuara}"
DB_NAME="${DB_NAME:-batuara}"
DB_USER="${DB_USER:-postgres}"
DB_CONTAINER="${DB_CONTAINER:-batuara-postgres}"
LOG_FILE="/var/log/batuara-restore.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo "=========================================="
echo "  Restore do PostgreSQL - Batuara.net"
echo "=========================================="
echo ""

if [ -z "${1:-}" ]; then
    echo "Uso: $0 <arquivo_backup.sql.gz>"
    echo ""
    echo "Backups disponíveis em $BACKUP_DIR:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERRO: Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

log "=========================================="
log "Iniciando restore - $BACKUP_FILE"
log "=========================================="

log "ATENÇÃO: Todos os dados atuais serão substituídos!"
read -p "Continuar? (digite 'yes' para confirmar): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelado."
    exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log "ERRO: Container $DB_CONTAINER não está em execução"
    exit 1
fi

TEMP_FILE=$(mktemp)
log "Extraindo backup..."
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

if [ ! -s "$TEMP_FILE" ]; then
    log "ERRO: Backup está vazio ou corrompido"
    rm -f "$TEMP_FILE"
    exit 1
fi

log "Criando backup de segurança antes do restore..."
SECURITY_BACKUP="$BACKUP_DIR/security_$(date +%Y%m%d_%H%M%S).sql"
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$SECURITY_BACKUP"
log "Backup de segurança salvo em: $SECURITY_BACKUP"

log "Dropando banco existente..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

log "Restaurando dados..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$TEMP_FILE"

rm -f "$TEMP_FILE"

log "Verificando integridade..."
TABLES=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
log "Tabelas restauradas: $TABLES"

log "Restore concluído com sucesso!"
echo ""
echo "Backup de segurança mantido em: $SECURITY_BACKUP"
echo "Para remover o backup de segurança:"
echo "  rm $SECURITY_BACKUP"
echo ""
