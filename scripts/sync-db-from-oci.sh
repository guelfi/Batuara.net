#!/usr/bin/env bash
# ============================================================
# sync-db-from-oci.sh - Sincroniza banco da OCI para dev local
# ============================================================
# Uso:
#   ./scripts/sync-db-from-oci.sh
#   ./scripts/sync-db-from-oci.sh --ssh-key /home/guelfi/Projetos/oci-key-2026-07-29
#   ./scripts/sync-db-from-oci.sh --full-database --dump-format custom --keep-local-backup
#
# Pré-requisitos:
#   - Docker com container local batuara-net-local-db
#   - Chave SSH da OCI
# ============================================================

set -euo pipefail

OCI_HOST="${OCI_HOST:-129.153.86.168}"
OCI_USER="${OCI_USER:-ubuntu}"
SSH_KEY="${SSH_KEY:-/home/guelfi/Projetos/oci-key-2026-07-29}"
OCI_CONTAINER="${OCI_CONTAINER:-batuara-net-db}"
LOCAL_CONTAINER="${LOCAL_CONTAINER:-batuara-net-local-db}"
DB_NAME="${DB_NAME:-batuara_db}"
DB_USER="${DB_USER:-batuara_user}"
DB_SCHEMA="${DB_SCHEMA:-batuara}"
DUMP_FORMAT="${DUMP_FORMAT:-sql-gzip}" # custom | sql-gzip
FULL_DATABASE=0
DUMP_ONLY=0
KEEP_LOCAL_BACKUP=0
OUTPUT_PATH=""

usage() {
  sed -n '2,12p' "$0"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --oci-host) OCI_HOST="$2"; shift 2 ;;
    --oci-user) OCI_USER="$2"; shift 2 ;;
    --ssh-key) SSH_KEY="$2"; shift 2 ;;
    --oci-container) OCI_CONTAINER="$2"; shift 2 ;;
    --local-container) LOCAL_CONTAINER="$2"; shift 2 ;;
    --db-name) DB_NAME="$2"; shift 2 ;;
    --db-user) DB_USER="$2"; shift 2 ;;
    --db-schema) DB_SCHEMA="$2"; shift 2 ;;
    --dump-format) DUMP_FORMAT="$2"; shift 2 ;;
    --full-database) FULL_DATABASE=1; shift ;;
    --dump-only) DUMP_ONLY=1; shift ;;
    --keep-local-backup) KEEP_LOCAL_BACKUP=1; shift ;;
    --output) OUTPUT_PATH="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Opção desconhecida: $1" >&2; exit 1 ;;
  esac
done

if [[ "$DUMP_FORMAT" != "custom" && "$DUMP_FORMAT" != "sql-gzip" ]]; then
  echo "DUMP_FORMAT inválido: $DUMP_FORMAT (use custom|sql-gzip)" >&2
  exit 1
fi

TEMP_EXT="sql.gz"
[[ "$DUMP_FORMAT" == "custom" ]] && TEMP_EXT="dump"
TEMP_BACKUP_FILE="${TMPDIR:-/tmp}/batuara_sync_$(date +%Y%m%d_%H%M%S).${TEMP_EXT}"
LOCAL_BACKUP_FILE="${OUTPUT_PATH:-$TEMP_BACKUP_FILE}"
REMOTE_PATH="/tmp/batuara_sync.${TEMP_EXT}"

step() { printf '\n==> %s\n' "$1"; }
ok() { printf '    [OK] %s\n' "$1"; }
fail() { printf '    [ERRO] %s\n' "$1" >&2; exit 1; }

SSH=(ssh -i "$SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
SCP=(scp -i "$SSH_KEY" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

echo ""
echo "============================================"
echo "  Sync DB: OCI -> Dev Local"
echo "  Host : $OCI_HOST"
if [[ "$FULL_DATABASE" -eq 1 ]]; then
  echo "  DB   : $DB_NAME (full database)"
else
  echo "  DB   : $DB_NAME (schema: $DB_SCHEMA)"
fi
echo "============================================"

step "Verificando pré-requisitos..."
[[ -f "$SSH_KEY" ]] || fail "Chave SSH não encontrada: $SSH_KEY"
chmod 600 "$SSH_KEY" 2>/dev/null || true

if [[ "$DUMP_ONLY" -eq 0 ]]; then
  if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_CONTAINER"; then
    fail "Container local '$LOCAL_CONTAINER' não está em execução. Execute: docker compose -f docker-compose.local.yml up -d"
  fi
fi
ok "Pré-requisitos OK"

step "Testando conexão SSH com OCI..."
"${SSH[@]}" -o ConnectTimeout=10 "${OCI_USER}@${OCI_HOST}" "echo OK" >/dev/null \
  || fail "Falha na conexão SSH"
ok "Conexão SSH OK"

if [[ "$FULL_DATABASE" -eq 1 ]]; then
  step "Gerando backup na OCI (full database)..."
  DUMP_SCOPE=""
else
  step "Gerando backup na OCI (schema: $DB_SCHEMA)..."
  DUMP_SCOPE="--schema=$DB_SCHEMA"
fi

if [[ "$DUMP_FORMAT" == "custom" ]]; then
  "${SSH[@]}" "${OCI_USER}@${OCI_HOST}" \
    "docker exec $OCI_CONTAINER pg_dump -U $DB_USER -d $DB_NAME $DUMP_SCOPE --no-owner --no-acl -Fc > $REMOTE_PATH && test -s $REMOTE_PATH && echo OK" \
    || fail "Falha ao gerar backup na OCI"
else
  "${SSH[@]}" "${OCI_USER}@${OCI_HOST}" \
    "docker exec $OCI_CONTAINER pg_dump -U $DB_USER -d $DB_NAME $DUMP_SCOPE --no-owner --no-acl | gzip > $REMOTE_PATH && test -s $REMOTE_PATH && echo OK" \
    || fail "Falha ao gerar backup na OCI"
fi
ok "Backup gerado em $REMOTE_PATH"

step "Baixando backup para local..."
mkdir -p "$(dirname "$LOCAL_BACKUP_FILE")"
"${SCP[@]}" "${OCI_USER}@${OCI_HOST}:${REMOTE_PATH}" "$LOCAL_BACKUP_FILE" \
  || fail "Falha ao baixar backup"
SIZE_KB=$(du -k "$LOCAL_BACKUP_FILE" | awk '{print $1}')
ok "Backup salvo em $LOCAL_BACKUP_FILE (${SIZE_KB}KB)"
"${SSH[@]}" "${OCI_USER}@${OCI_HOST}" "rm -f $REMOTE_PATH" >/dev/null 2>&1 || true

if [[ "$DUMP_ONLY" -eq 1 ]]; then
  step "DumpOnly habilitado: pulando restore local."
  echo ""
  echo "============================================"
  echo "  Dump concluído com sucesso!"
  echo "============================================"
  exit 0
fi

step "Restaurando no banco local..."
docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" \
  >/dev/null 2>&1 || true
docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null
docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" >/dev/null
ok "Banco '$DB_NAME' recriado"

if [[ "$DUMP_FORMAT" == "custom" ]]; then
  docker cp "$LOCAL_BACKUP_FILE" "${LOCAL_CONTAINER}:/tmp/restore.dump"
  docker exec "$LOCAL_CONTAINER" bash -c \
    "pg_restore --exit-on-error --no-owner --no-acl -U $DB_USER -d $DB_NAME /tmp/restore.dump"
  docker exec "$LOCAL_CONTAINER" rm -f /tmp/restore.dump >/dev/null 2>&1 || true
else
  docker cp "$LOCAL_BACKUP_FILE" "${LOCAL_CONTAINER}:/tmp/restore.sql.gz"
  docker exec "$LOCAL_CONTAINER" bash -c \
    "gunzip -c /tmp/restore.sql.gz | psql -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=0"
  docker exec "$LOCAL_CONTAINER" rm -f /tmp/restore.sql.gz >/dev/null 2>&1 || true
fi
ok "Dados restaurados"

step "Verificando integridade..."
TABLES=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_SCHEMA' AND table_type='BASE TABLE';")
ok "Tabelas no schema '$DB_SCHEMA': $TABLES"

MIG_COUNT=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
  "SELECT COUNT(*) FROM \"$DB_SCHEMA\".\"__EFMigrationsHistory\";" 2>/dev/null || echo "?")
ok "Migrations registradas: $MIG_COUNT"

USERS=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
  "SELECT COUNT(*) FROM $DB_SCHEMA.users;" 2>/dev/null || echo "?")
MEMBERS=$(docker exec "$LOCAL_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c \
  "SELECT COUNT(*) FROM \"$DB_SCHEMA\".\"HouseMembers\";" 2>/dev/null || echo "?")
ok "users=$USERS HouseMembers=$MEMBERS"

if [[ "$KEEP_LOCAL_BACKUP" -eq 0 && "$LOCAL_BACKUP_FILE" == "$TEMP_BACKUP_FILE" ]]; then
  rm -f "$TEMP_BACKUP_FILE"
fi

echo ""
echo "============================================"
echo "  Sync concluído com sucesso!"
echo "  Reinicie a API local:"
echo "  docker compose -f docker-compose.local.yml restart api"
echo "============================================"
echo ""
