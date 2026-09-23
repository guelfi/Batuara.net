#!/usr/bin/env bash
# Cloud Agent start phase for Batuara.net.
# Idempotente por boot: sobe o PostgreSQL, garante o papel/banco de dev e
# popula o banco. Em seguida retorna (os apps rodam nos `terminals`).
#
# Estratégia de dados (Opção A — dados de produção no boot):
#   - Se a variável OCI_SSH_PRIVATE_KEY estiver presente e o banco ainda não
#     tiver dados, restaura o banco COMPLETO de produção (scripts/sync-db-from-oci-native.sh).
#   - Se a chave não estiver presente (ou o sync falhar), cai no schema de dev
#     gerado pelo install (.cursor/generated/dev-schema.sql) e a API faz o seed.
#   - Se o banco já estiver populado (reinício do mesmo VM), mantém os dados.
# Um arquivo sentinela (.cursor/generated/.prod-synced) sinaliza que os dados
# vieram de produção; nesse caso o terminal da API desliga o seed para não
# alterar os dados reais.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

DB_NAME="CasaBatuara"
DB_PASSWORD="batuara_dev"
SCHEMA_SQL="$REPO_ROOT/.cursor/generated/dev-schema.sql"
PROD_SENTINEL="$REPO_ROOT/.cursor/generated/.prod-synced"

echo "==> Garantindo que o PostgreSQL está no ar"
if ! $SUDO pg_lsclusters -h 2>/dev/null | grep -q online; then
  $SUDO pg_ctlcluster 16 main start || true
fi
for _ in $(seq 1 30); do
  if $SUDO -u postgres pg_isready >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "==> Garantindo senha do papel e banco de dev"
$SUDO -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD '${DB_PASSWORD}';" >/dev/null
if ! $SUDO -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  $SUDO -u postgres createdb "${DB_NAME}"
fi

apply_dev_schema() {
  rm -f "$PROD_SENTINEL"
  if [ ! -f "$SCHEMA_SQL" ]; then
    echo "    AVISO: $SCHEMA_SQL não encontrado; execute .cursor/install.sh primeiro" >&2
    return 0
  fi
  # Recria o banco limpo para evitar estado parcial de uma tentativa anterior.
  $SUDO -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}' AND pid<>pg_backend_pid();" >/dev/null 2>&1 || true
  $SUDO -u postgres dropdb --if-exists "${DB_NAME}"
  $SUDO -u postgres createdb "${DB_NAME}"
  PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U postgres -d "${DB_NAME}" -q -f "$SCHEMA_SQL"
  echo "    schema de dev aplicado (a API fará o seed do admin e dados institucionais)"
}

HAS_USERS="$(PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U postgres -d "${DB_NAME}" -tAc \
  "SELECT to_regclass('batuara.users') IS NOT NULL" 2>/dev/null || echo f)"

if [ "$HAS_USERS" = "t" ]; then
  echo "==> Banco já populado; mantendo os dados atuais"
elif [ -n "${OCI_SSH_PRIVATE_KEY:-}" ]; then
  echo "==> Chave OCI presente: restaurando dados de PRODUÇÃO (Opção A)"
  if bash "$REPO_ROOT/scripts/sync-db-from-oci-native.sh"; then
    touch "$PROD_SENTINEL"
    echo "    dados de produção restaurados (o seed da API será desativado)"
  else
    echo "    AVISO: sync de produção falhou; aplicando schema+seed de dev" >&2
    apply_dev_schema
  fi
else
  echo "==> Chave OCI ausente: aplicando schema de dev (a API fará o seed)"
  apply_dev_schema
fi

echo "==> Start concluído (apps rodam nos terminais API / PublicWebsite / AdminDashboard)"
