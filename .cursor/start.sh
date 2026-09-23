#!/usr/bin/env bash
# Cloud Agent start phase for Batuara.net.
# Idempotent per-boot reconciliation: starts PostgreSQL, ensures the dev role,
# database and schema exist, then returns. Long-running app processes (API and
# the two React dev servers) are launched from the `terminals` entries.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

DB_NAME="CasaBatuara"
DB_PASSWORD="batuara_dev"

echo "==> Ensuring PostgreSQL is running"
if ! $SUDO pg_lsclusters -h 2>/dev/null | grep -q online; then
  $SUDO pg_ctlcluster 16 main start || true
fi
# Wait for readiness.
for _ in $(seq 1 30); do
  if $SUDO -u postgres pg_isready >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Ensuring dev role password and database"
$SUDO -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD '${DB_PASSWORD}';" >/dev/null
if ! $SUDO -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  $SUDO -u postgres createdb "${DB_NAME}"
fi

echo "==> Applying dev schema if missing"
SCHEMA_SQL="$REPO_ROOT/.cursor/generated/dev-schema.sql"
HAS_USERS="$(PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U postgres -d "${DB_NAME}" -tAc \
  "SELECT to_regclass('batuara.users') IS NOT NULL" 2>/dev/null || echo f)"
if [ "$HAS_USERS" != "t" ]; then
  if [ -f "$SCHEMA_SQL" ]; then
    PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U postgres -d "${DB_NAME}" -q -f "$SCHEMA_SQL"
    echo "    schema applied"
  else
    echo "    WARNING: $SCHEMA_SQL not found; run .cursor/install.sh first" >&2
  fi
else
  echo "    schema already present"
fi

echo "==> Start phase complete (apps run in the API / PublicWebsite / AdminDashboard terminals)"
