# Backup do Banco de Dados - Batuara.net

## Arquivo de Backup

- **Arquivo:** `backup_batuara_20260403.dump`
- **Data:** 2026-04-03
- **Tamanho:** ~68 KB
- **Formato:** PostgreSQL Custom Dump (compressão)

## Tabelas Incluídas

| Tabela | Descrição |
|--------|-----------|
| CalendarAttendances | Atendimentos do calendário |
| ContactMessages | Mensagens de contato |
| Events | Eventos e festas |
| Guides | Guias e entidades |
| HouseMemberContributions | Contribuições dos membros |
| HouseMembers | Membros da casa |
| Orixas | Cadastro de Orixás |
| SiteSettings | Configurações do site |
| SpiritualContents | Conteúdos espirituais |
| UmbandaLines | Linhas da Umbanda |
| refresh_tokens | Tokens de refresh |
| users | Usuários do sistema |

## Restauração do Backup

### Localmente (via Docker)

```bash
# Parar containers (opcional - não afeta o volume de dados)
docker compose -p batuara-net-local -f docker-compose.local.yml stop

# Restaurar o banco
docker exec -i batuara-net-local-db psql -U batuara_user -d batuara_db < backup_batuara_20260403.dump
```

### Em Outro Ambiente

```bash
# Criar banco se não existir
docker exec -i batuara-net-local-db psql -U batuara_user -c "CREATE DATABASE batuara_db;"

# Restaurar
docker exec -i batuara-net-local-db pg_restore -U batuara_user -d batuara_db -c backup_batuara_20260403.dump
```

## Criar Novo Backup

```bash
# Via Docker (dentro do container)
docker exec batuara-net-local-db pg_dump -U batuara_user -d batuara_db -F c -b -v -f /var/lib/postgresql/backup_YYYYMMDD.dump

# Copiar para host
docker cp batuara-net-local-db:/var/lib/postgresql/backup_YYYYMMDD.dump ./database/
```

## Notas

- O backup inclui dados validados para produção
- Contiene todos os dados de SiteSettings, Events, Orixas, Guides, etc.
- Não inclui dados de migrations (__EFMigrationsHistory)
