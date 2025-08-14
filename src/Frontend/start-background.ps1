# Script para iniciar serviços em segundo plano
# Uso: .\start-background.ps1

Write-Host "🚀 Iniciando serviços frontend em segundo plano..." -ForegroundColor Cyan

# Função para matar processo na porta
function Kill-ProcessOnPort {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
            Write-Host "✅ Porta $Port liberada" -ForegroundColor Green
        }
    }
    catch {
        # Ignorar erros
    }
}

# Limpar portas
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 3001

# Aguardar um pouco
Start-Sleep -Seconds 1

# Iniciar PublicWebsite
Write-Host "🌐 Iniciando PublicWebsite (porta 3000)..." -ForegroundColor Blue
$publicJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd PublicWebsite
    npm start
}

# Iniciar AdminDashboard
Write-Host "🔧 Iniciando AdminDashboard (porta 3001)..." -ForegroundColor Blue
$adminJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd AdminDashboard
    $env:PORT = 3001
    npm start
}

Write-Host "`n⏳ Aguardando serviços iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar se estão rodando
$publicRunning = $false
$adminRunning = $false

try {
    $publicRunning = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) -ne $null
    $adminRunning = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue) -ne $null
}
catch {
    # Ignorar erros
}

Write-Host "`n📊 Status dos serviços:" -ForegroundColor Cyan
if ($publicRunning) {
    Write-Host "🌐 PublicWebsite: " -NoNewline
    Write-Host "RODANDO" -ForegroundColor Green
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Blue
} else {
    Write-Host "🌐 PublicWebsite: " -NoNewline
    Write-Host "INICIANDO..." -ForegroundColor Yellow
}

if ($adminRunning) {
    Write-Host "🔧 AdminDashboard: " -NoNewline
    Write-Host "RODANDO" -ForegroundColor Green
    Write-Host "   URL: http://localhost:3001" -ForegroundColor Blue
} else {
    Write-Host "🔧 AdminDashboard: " -NoNewline
    Write-Host "INICIANDO..." -ForegroundColor Yellow
}

Write-Host "`n💡 Os serviços estão rodando em segundo plano" -ForegroundColor Cyan
Write-Host "💡 Use '.\manage-services.ps1 status' para verificar o status" -ForegroundColor Yellow
Write-Host "💡 Use '.\manage-services.ps1 stop' para parar os serviços" -ForegroundColor Yellow
Write-Host "💡 IDs dos Jobs: PublicWebsite=$($publicJob.Id), AdminDashboard=$($adminJob.Id)" -ForegroundColor Gray