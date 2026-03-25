#!/bin/bash

set -euo pipefail

# ============================================
# Cron Setup - Batuara.net Backup
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-postgres.sh"
CRON_USER="${CRON_USER:-root}"
LOG_DIR="/var/log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

echo "=========================================="
echo "  Setup Cron - Batuara.net Backup"
echo "=========================================="
echo ""

if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "ERRO: Script de backup não encontrado: $BACKUP_SCRIPT"
    exit 1
fi

chmod +x "$BACKUP_SCRIPT"
log "Script de backup configurado: $BACKUP_SCRIPT"

CRON_SCHEDULE="${CRON_SCHEDULE:-0 3 * * *}"

CRON_CONFIG="

# Batuara.net PostgreSQL Backup
# Backup diário às 03:00
$CRON_SCHEDULE root $BACKUP_SCRIPT >> $LOG_DIR/batuara-backup.log 2>&1
"

log "Expressão cron: $CRON_SCHEDULE"

if [ -f /etc/crontab ]; then
    if grep -q "batuara-backup" /etc/crontab 2>/dev/null; then
        log "Cron já configurado. Removendo configuração anterior..."
        grep -v "batuara-backup" /etc/crontab > /tmp/crontab.tmp
        mv /tmp/crontab.tmp /etc/crontab
    fi

    echo "$CRON_CONFIG" >> /etc/crontab
    log "Cron configurado em /etc/crontab"
else
    log "AVISO: /etc/crontab não encontrado. Configure manualmente:"
    echo ""
    echo "Adicione esta linha ao crontab:"
    echo "$CRON_CONFIG"
    echo ""
fi

mkdir -p "$LOG_DIR"
touch "$LOG_DIR/batuara-backup.log"

echo ""
log "Configuração concluída!"
echo ""
echo "Testar backup manualmente:"
echo "  $BACKUP_SCRIPT"
echo ""
echo "Verificar logs:"
echo "  tail -f $LOG_DIR/batuara-backup.log"
echo ""
echo "Verificar backups:"
echo "  ls -lh /var/backups/batuara/"
echo ""
echo "Desabilitar backup (remover do cron):"
echo "  grep -v 'batuara-backup' /etc/crontab > /tmp/crontab.tmp && mv /tmp/crontab.tmp /etc/crontab"
echo ""
