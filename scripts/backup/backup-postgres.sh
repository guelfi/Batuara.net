#!/bin/bash

set -euo pipefail

# ============================================
# Backup Script - Batuara.net PostgreSQL
# ============================================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/var/backups/batuara}"
DB_NAME="${DB_NAME:-batuara}"
DB_USER="${DB_USER:-postgres}"
DB_CONTAINER="${DB_CONTAINER:-batuara-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
S3_BUCKET="${S3_BUCKET:-}"
LOG_FILE="/var/log/batuara-backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

mkdir -p "$BACKUP_DIR"
log "=========================================="
log "Iniciando backup do PostgreSQL - $TIMESTAMP"
log "=========================================="

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
TEMP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

log "Container: $DB_CONTAINER"
log "Database: $DB_NAME"
log "Output: $BACKUP_FILE"

if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log "Executando pg_dump..."
    docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$TEMP_FILE"
else
    log "ERRO: Container $DB_CONTAINER não está em execução"
    exit 1
fi

if [ ! -s "$TEMP_FILE" ]; then
    log "ERRO: Backup está vazio"
    exit 1
fi

gzip -c "$TEMP_FILE" > "$BACKUP_FILE"
rm -f "$TEMP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"

if [ -n "$S3_BUCKET" ]; then
    log "Enviando para S3: $S3_BUCKET"
    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/$(basename $BACKUP_FILE)"
        log "Upload para S3 concluído"
    else
        log "AVISO: AWS CLI não encontrado, pulando upload para S3"
    fi
fi

BACKUPS_TO_DELETE=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS 2>/dev/null | wc -l)
if [ "$BACKUPS_TO_DELETE" -gt 0 ]; then
    log "Removendo $BACKUPS_TO_DELETE backups antigos (retention: ${RETENTION_DAYS}d)..."
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
fi

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f | wc -l)
log "Total de backups: $TOTAL_BACKUPS"

log "Backup concluído com sucesso!"
echo ""
