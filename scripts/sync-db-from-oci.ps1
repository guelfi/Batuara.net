#!/usr/bin/env pwsh
# ============================================================
# sync-db-from-oci.ps1 - Sincroniza banco da OCI para dev local
# ============================================================
# Uso:
#   .\scripts\sync-db-from-oci.ps1
#   .\scripts\sync-db-from-oci.ps1 -OciHost 1.2.3.4 -SshKey "C:\path\key.key"
#
# Pré-requisitos:
#   - Docker rodando localmente com o container batuara-net-local-db
#   - Acesso SSH ao servidor OCI configurado
# ============================================================

param(
    [string]$OciHost    = "129.153.86.168",
    [string]$OciUser    = "ubuntu",
    [string]$SshKey     = "C:\Users\MarcoGuelfi\Projetos\ssh-key-2025-08-28.key",
    [string]$OciContainer  = "batuara-net-db",
    [string]$LocalContainer = "batuara-net-local-db",
    [string]$DbName     = "batuara_db",
    [string]$DbUser     = "batuara_user",
    [string]$DbSchema   = "batuara"
)

$ErrorActionPreference = "Stop"
$BackupFile = "$env:TEMP\batuara_sync_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql.gz"

function Write-Step([string]$msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Write-Ok([string]$msg) {
    Write-Host "    [OK] $msg" -ForegroundColor Green
}

function Write-Fail([string]$msg) {
    Write-Host "    [ERRO] $msg" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  Sync DB: OCI -> Dev Local" -ForegroundColor Yellow
Write-Host "  Host : $OciHost" -ForegroundColor Yellow
Write-Host "  DB   : $DbName (schema: $DbSchema)" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# --- 1. Verificar pre-requisitos ---
Write-Step "Verificando pré-requisitos..."

if (-not (Test-Path $SshKey)) {
    Write-Fail "Chave SSH não encontrada: $SshKey"
}

$containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^$LocalContainer$"
if (-not $containerRunning) {
    Write-Fail "Container local '$LocalContainer' não está em execução. Execute: docker compose -f docker-compose.local.yml up -d"
}
Write-Ok "Pré-requisitos OK"

# --- 2. Testar conexão SSH ---
Write-Step "Testando conexão SSH com OCI..."
$sshTest = ssh -i $SshKey -o StrictHostKeyChecking=no -o ConnectTimeout=10 "${OciUser}@${OciHost}" "echo OK" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Falha na conexão SSH: $sshTest"
}
Write-Ok "Conexão SSH OK"

# --- 3. Backup na OCI ---
Write-Step "Gerando backup na OCI (schema: $DbSchema)..."
$remotePath = "/tmp/batuara_sync.sql.gz"
ssh -i $SshKey -o StrictHostKeyChecking=no "${OciUser}@${OciHost}" `
    "docker exec $OciContainer pg_dump -U $DbUser -d $DbName --schema=$DbSchema --no-owner --no-acl | gzip > $remotePath && echo OK"

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Falha ao gerar backup na OCI"
}
Write-Ok "Backup gerado em $remotePath"

# --- 4. Download do backup ---
Write-Step "Baixando backup para local..."
scp -i $SshKey -o StrictHostKeyChecking=no "${OciUser}@${OciHost}:${remotePath}" $BackupFile

if ($LASTEXITCODE -ne 0) {
    Write-Fail "Falha ao baixar backup"
}

$sizeMB = [math]::Round((Get-Item $BackupFile).Length / 1KB, 1)
Write-Ok "Backup salvo em $BackupFile (${sizeMB}KB)"

# Limpar arquivo remoto
ssh -i $SshKey -o StrictHostKeyChecking=no "${OciUser}@${OciHost}" "rm -f $remotePath" 2>&1 | Out-Null

# --- 5. Restore no banco local ---
Write-Step "Restaurando no banco local..."

# Terminar conexões ativas
docker exec $LocalContainer psql -U $DbUser -d postgres -c `
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DbName' AND pid <> pg_backend_pid();" 2>&1 | Out-Null

# Drop e recria o banco
docker exec $LocalContainer psql -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $DbName;" 2>&1 | Out-Null
docker exec $LocalContainer psql -U $DbUser -d postgres -c "CREATE DATABASE $DbName OWNER $DbUser;" 2>&1 | Out-Null
Write-Ok "Banco '$DbName' recriado"

# Copiar e restaurar
docker cp $BackupFile "${LocalContainer}:/tmp/restore.sql.gz"
$restoreOutput = docker exec $LocalContainer bash -c "gunzip -c /tmp/restore.sql.gz | psql -U $DbUser -d $DbName -v ON_ERROR_STOP=0 2>&1"
docker exec $LocalContainer rm /tmp/restore.sql.gz 2>&1 | Out-Null
Write-Ok "Dados restaurados"

# --- 6. Verificar tabelas e contagens ---
Write-Step "Verificando integridade..."
$tables = docker exec $LocalContainer psql -U $DbUser -d $DbName -t -c `
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DbSchema' AND table_type='BASE TABLE';"
Write-Ok "Tabelas no schema '$DbSchema': $($tables.Trim())"

$migCount = docker exec $LocalContainer psql -U $DbUser -d $DbName -t -c `
    "SELECT COUNT(*) FROM $DbSchema.__EFMigrationsHistory;" 2>&1
Write-Ok "Migrations registradas: $($migCount.Trim())"

# --- 7. Limpar backup local temporário ---
Remove-Item $BackupFile -Force 2>&1 | Out-Null

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Sync concluido com sucesso!" -ForegroundColor Green
Write-Host "  Reinicie a API local para aplicar as mudancas:" -ForegroundColor Green
Write-Host "  docker compose -f docker-compose.local.yml restart api" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
