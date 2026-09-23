#!/usr/bin/env bash
# ============================================================
# sync-db-from-oci-native.sh
# Sincroniza o banco COMPLETO de produção (OCI) para o
# PostgreSQL NATIVO deste ambiente Cloud Agent.
#
# Diferente de scripts/sync-db-from-oci.sh (que assume containers
# Docker local e remoto), aqui o restore é feito no PostgreSQL
# nativo criado por .cursor/start.sh (banco "CasaBatuara").
#
# Pré-requisitos:
#   - Secret OCI_SSH_PRIVATE_KEY (Runtime Secret) com o PEM completo
#     da chave SSH da OCI. Injetado como variável de ambiente no boot
#     de uma NOVA VM de Cloud Agent (agentes já em execução não a recebem).
#   - PostgreSQL local rodando (feito por .cursor/start.sh).
#
# Variáveis opcionais (com padrões):
#   OCI_HOST=129.153.86.168  OCI_USER=ubuntu
#   OCI_DB_CONTAINER=batuara-net-db
#   PROD_DB_NAME=batuara_db  PROD_DB_USER=batuara_user
#   LOCAL_DB_NAME=CasaBatuara  LOCAL_DB_PASSWORD=batuara_dev
# ============================================================
set -euo pipefail

OCI_HOST="${OCI_HOST:-129.153.86.168}"
OCI_USER="${OCI_USER:-ubuntu}"
OCI_DB_CONTAINER="${OCI_DB_CONTAINER:-batuara-net-db}"
PROD_DB_NAME="${PROD_DB_NAME:-batuara_db}"
PROD_DB_USER="${PROD_DB_USER:-batuara_user}"
LOCAL_DB_NAME="${LOCAL_DB_NAME:-CasaBatuara}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-batuara_dev}"

if [ -z "${OCI_SSH_PRIVATE_KEY:-}" ]; then
  echo "ERRO: variável OCI_SSH_PRIVATE_KEY não definida." >&2
  echo "      Adicione-a como Runtime Secret e rode isto em um NOVO Cloud Agent." >&2
  exit 1
fi

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

KEYFILE="$(mktemp)"; chmod 600 "$KEYFILE"
DUMPFILE="$(mktemp --suffix=.dump)"
cleanup() { rm -f "$KEYFILE" "$DUMPFILE"; }
trap cleanup EXIT
printf '%s\n' "$OCI_SSH_PRIVATE_KEY" > "$KEYFILE"

SSH=(ssh -i "$KEYFILE" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
SCP=(scp -i "$KEYFILE" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

echo "==> Testando conexão SSH com ${OCI_USER}@${OCI_HOST}"
"${SSH[@]}" "${OCI_USER}@${OCI_HOST}" "echo OK" >/dev/null

echo "==> Gerando dump COMPLETO na OCI (pg_dump -Fc do banco ${PROD_DB_NAME})"
"${SSH[@]}" "${OCI_USER}@${OCI_HOST}" \
  "docker exec ${OCI_DB_CONTAINER} pg_dump -U ${PROD_DB_USER} -d ${PROD_DB_NAME} --no-owner --no-acl -Fc > /tmp/batuara_prod.dump && test -s /tmp/batuara_prod.dump && echo OK"

echo "==> Baixando dump para este ambiente"
"${SCP[@]}" "${OCI_USER}@${OCI_HOST}:/tmp/batuara_prod.dump" "$DUMPFILE"
"${SSH[@]}" "${OCI_USER}@${OCI_HOST}" "rm -f /tmp/batuara_prod.dump" >/dev/null 2>&1 || true
echo "    dump: $(du -h "$DUMPFILE" | awk '{print $1}')"

echo "==> Recriando banco local ${LOCAL_DB_NAME}"
$SUDO -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${LOCAL_DB_NAME}' AND pid<>pg_backend_pid();" >/dev/null 2>&1 || true
$SUDO -u postgres dropdb --if-exists "${LOCAL_DB_NAME}"
$SUDO -u postgres createdb "${LOCAL_DB_NAME}"

echo "==> Restaurando dump completo no PostgreSQL nativo (owner=postgres)"
# --no-owner/--no-acl mapeiam os objetos para o usuário atual (postgres),
# evitando erros de roles de produção inexistentes localmente.
PGPASSWORD="${LOCAL_DB_PASSWORD}" pg_restore --no-owner --no-acl \
  -h localhost -U postgres -d "${LOCAL_DB_NAME}" "$DUMPFILE" || true

echo "==> Validando integridade"
PGPASSWORD="${LOCAL_DB_PASSWORD}" psql -h localhost -U postgres -d "${LOCAL_DB_NAME}" -c '\dt batuara.*' || true
PGPASSWORD="${LOCAL_DB_PASSWORD}" psql -h localhost -U postgres -d "${LOCAL_DB_NAME}" -tc \
  'SELECT (SELECT count(*) FROM batuara.users) AS users, (SELECT count(*) FROM batuara."Orixas") AS orixas, (SELECT count(*) FROM batuara."Guides") AS guides, (SELECT count(*) FROM batuara."HouseMembers") AS house_members;' || true

echo ""
echo "==> Sincronização concluída. A chave SSH temporária foi removida (trap cleanup)."
echo "    Os usuários e senhas do AdminDashboard são exatamente os de PRODUÇÃO."
echo "    NÃO redefina nem altere essas credenciais."
echo "    O seed automático da API é idempotente (só popula tabelas vazias),"
echo "    então não altera os dados de produção. Reinicie a API para refletir"
echo "    os dados (terminal 'API')."
