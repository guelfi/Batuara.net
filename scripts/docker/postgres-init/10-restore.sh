#!/usr/bin/env bash
set -euo pipefail

restore_on_empty="${DB_RESTORE_ON_EMPTY:-}"
restore_enabled="false"
case "${restore_on_empty,,}" in
  1|true|yes|y) restore_enabled="true" ;;
esac

if [ "$restore_enabled" != "true" ]; then
  exit 0
fi

backup_dir="${DB_RESTORE_DIR:-/docker-entrypoint-initdb.d/backup}"
backup_file="${DB_RESTORE_FILE:-}"

if [ -z "$backup_file" ]; then
  if [ ! -d "$backup_dir" ]; then
    echo "DB restore enabled but backup dir not found: $backup_dir" >&2
    exit 1
  fi

  mapfile -t candidates < <(find "$backup_dir" -maxdepth 1 -type f \( -name '*.sql' -o -name '*.sql.gz' -o -name '*.dump' -o -name '*.backup' -o -name '*.tar' \) | sort)

  if [ "${#candidates[@]}" -eq 0 ]; then
    echo "DB restore enabled but no backup file found in: $backup_dir" >&2
    exit 1
  fi

  if [ "${#candidates[@]}" -gt 1 ]; then
    echo "DB restore enabled but multiple backup files were found. Set DB_RESTORE_FILE to choose exactly one:" >&2
    for f in "${candidates[@]}"; do
      echo " - $f" >&2
    done
    exit 1
  fi

  backup_file="${candidates[0]}"
fi

if [ ! -f "$backup_file" ]; then
  echo "DB restore enabled but backup file not found: $backup_file" >&2
  exit 1
fi

if [ ! -s "$backup_file" ]; then
  echo "DB restore enabled but backup file is empty: $backup_file" >&2
  exit 1
fi

db_user="${POSTGRES_USER:?POSTGRES_USER is required}"
db_name="${POSTGRES_DB:?POSTGRES_DB is required}"

existing_tables="$(psql -U "$db_user" -d "$db_name" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type='BASE TABLE';" | tr -d '[:space:]' || true)"
existing_tables="${existing_tables:-0}"
if [ "$existing_tables" -gt 0 ]; then
  echo "Database already contains ${existing_tables} user tables. Skipping restore."
  exit 0
fi

case "$backup_file" in
  *.dump|*.backup|*.tar)
    pg_restore --list "$backup_file" > /dev/null
    pg_restore --exit-on-error --no-owner --no-acl -U "$db_user" -d "$db_name" "$backup_file"
    ;;
  *.sql.gz)
    gunzip -t "$backup_file"
    if ! gunzip -c "$backup_file" | grep -m 1 -qiE "CREATE[[:space:]]+TABLE|COPY[[:space:]]+"; then
      echo "DB restore enabled but backup does not look like a PostgreSQL SQL dump: $backup_file" >&2
      exit 1
    fi
    gunzip -c "$backup_file" | psql -v ON_ERROR_STOP=1 -U "$db_user" -d "$db_name"
    ;;
  *.sql)
    if ! grep -m 1 -qiE "CREATE[[:space:]]+TABLE|COPY[[:space:]]+" "$backup_file"; then
      echo "DB restore enabled but backup does not look like a PostgreSQL SQL dump: $backup_file" >&2
      exit 1
    fi
    psql -v ON_ERROR_STOP=1 -U "$db_user" -d "$db_name" < "$backup_file"
    ;;
  *)
    echo "Unsupported backup file extension: $backup_file" >&2
    exit 1
    ;;
esac

schema="${DB_RESTORE_SCHEMA:-batuara}"
min_tables="${DB_RESTORE_MIN_TABLES:-1}"
tables="$(psql -U "$db_user" -d "$db_name" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${schema}' AND table_type='BASE TABLE';" | tr -d '[:space:]' || true)"
tables="${tables:-0}"

if [ "$tables" -lt "$min_tables" ]; then
  echo "Restore validation failed: schema '${schema}' has ${tables} tables (min ${min_tables})" >&2
  exit 1
fi

expected_tables="${DB_RESTORE_EXPECT_TABLES:-}"
if [ -n "$expected_tables" ]; then
  IFS=',' read -ra tbls <<< "$expected_tables"
  for raw in "${tbls[@]}"; do
    t="$(echo "$raw" | xargs)"
    if [ -z "$t" ]; then
      continue
    fi
    exists="$(psql -U "$db_user" -d "$db_name" -tAc "SELECT to_regclass('${schema}.\"${t}\"') IS NOT NULL;" | tr -d '[:space:]' || true)"
    if [ "${exists,,}" != "t" ] && [ "${exists,,}" != "true" ]; then
      echo "Restore validation failed: expected table not found: ${schema}.\"${t}\"" >&2
      exit 1
    fi
  done
fi

exit 0
