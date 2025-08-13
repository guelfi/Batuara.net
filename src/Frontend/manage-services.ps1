# Script de gerenciamento dos serviços frontend
# Uso: .\manage-services.ps1 [start|stop|status|restart]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "status", "restart", "")]
    [string]$Action = ""
)

# Configurações
$PublicWebsitePort = 3000
$AdminDashboardPort = 3001
$PublicWebsitePath = "PublicWebsite"
$AdminDashboardPath = "AdminDashboard"

# Função para verificar se uma porta está em uso
function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Função para obter processo na porta
function Get-ProcessOnPort {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            return Get-Process -Id $processId -ErrorAction SilentlyContinue
        }
    }
    catch {
        return $null
    }
    return $null
}

# Função para matar processo na porta
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)
    
    $process = Get-ProcessOnPort -Port $Port
    if ($process) {
        Write-Host "❌ Parando $ServiceName (PID: $($process.Id)) na porta $Port" -ForegroundColor Red
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 1000
        
        # Verificar se realmente parou
        if (-not (Test-PortInUse -Port $Port)) {
            Write-Host "✅ $ServiceName parado com sucesso" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $ServiceName pode ainda estar rodando" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "ℹ️  $ServiceName não estava rodando na porta $Port" -ForegroundColor Blue
        return $true
    }
}

# Função para mostrar status dos serviços
function Show-ServicesStatus {
    Write-Host "`n📊 Status dos Serviços Frontend" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    # PublicWebsite
    if (Test-PortInUse -Port $PublicWebsitePort) {
        $process = Get-ProcessOnPort -Port $PublicWebsitePort
        Write-Host "🌐 PublicWebsite (porta $PublicWebsitePort): " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        if ($process) {
            Write-Host "   PID: $($process.Id) | Processo: $($process.ProcessName)" -ForegroundColor Gray
        }
        Write-Host "   URL: http://localhost:$PublicWebsitePort" -ForegroundColor Blue
    } else {
        Write-Host "🌐 PublicWebsite (porta $PublicWebsitePort): " -NoNewline -ForegroundColor White
        Write-Host "PARADO" -ForegroundColor Red
    }
    
    # AdminDashboard
    if (Test-PortInUse -Port $AdminDashboardPort) {
        $process = Get-ProcessOnPort -Port $AdminDashboardPort
        Write-Host "🔧 AdminDashboard (porta $AdminDashboardPort): " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        if ($process) {
            Write-Host "   PID: $($process.Id) | Processo: $($process.ProcessName)" -ForegroundColor Gray
        }
        Write-Host "   URL: http://localhost:$AdminDashboardPort" -ForegroundColor Blue
    } else {
        Write-Host "🔧 AdminDashboard (porta $AdminDashboardPort): " -NoNewline -ForegroundColor White
        Write-Host "PARADO" -ForegroundColor Red
    }
    Write-Host ""
}

# Função para parar todos os serviços
function Stop-AllServices {
    Write-Host "`n🛑 Parando todos os serviços..." -ForegroundColor Yellow
    
    $publicStopped = Stop-ProcessOnPort -Port $PublicWebsitePort -ServiceName "PublicWebsite"
    $adminStopped = Stop-ProcessOnPort -Port $AdminDashboardPort -ServiceName "AdminDashboard"
    
    if ($publicStopped -and $adminStopped) {
        Write-Host "`n✅ Todos os serviços foram parados com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Alguns serviços podem ainda estar rodando. Verifique o status." -ForegroundColor Yellow
    }
}

# Função para iniciar todos os serviços
function Start-AllServices {
    Write-Host "`n🚀 Iniciando serviços frontend..." -ForegroundColor Cyan
    
    # Verificar se as dependências estão instaladas
    if (-not (Test-Path "$PublicWebsitePath\node_modules")) {
        Write-Host "❌ Dependências do PublicWebsite não encontradas. Execute: cd $PublicWebsitePath && npm install" -ForegroundColor Red
        return
    }
    
    if (-not (Test-Path "$AdminDashboardPath\node_modules")) {
        Write-Host "❌ Dependências do AdminDashboard não encontradas. Execute: cd $AdminDashboardPath && npm install" -ForegroundColor Red
        return
    }
    
    # Parar serviços existentes primeiro
    Write-Host "🔍 Verificando portas em uso..." -ForegroundColor Yellow
    if (Test-PortInUse -Port $PublicWebsitePort) {
        Stop-ProcessOnPort -Port $PublicWebsitePort -ServiceName "PublicWebsite"
    }
    if (Test-PortInUse -Port $AdminDashboardPort) {
        Stop-ProcessOnPort -Port $AdminDashboardPort -ServiceName "AdminDashboard"
    }
    
    # Iniciar serviços usando concurrently
    Write-Host "`n🚀 Iniciando PublicWebsite (porta $PublicWebsitePort) e AdminDashboard (porta $AdminDashboardPort)..." -ForegroundColor Green
    Write-Host "📱 PublicWebsite: http://localhost:$PublicWebsitePort" -ForegroundColor Blue
    Write-Host "🔧 AdminDashboard: http://localhost:$AdminDashboardPort" -ForegroundColor Blue
    Write-Host "`n💡 Use Ctrl+C para parar os serviços ou execute: .\manage-services.ps1 stop" -ForegroundColor Yellow
    Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor Gray
    
    # Executar npm run start:all
    npm run start:all
}

# Função para reiniciar serviços
function Restart-AllServices {
    Write-Host "`n🔄 Reiniciando serviços..." -ForegroundColor Cyan
    Stop-AllServices
    Start-Sleep -Seconds 2
    Start-AllServices
}

# Função para mostrar menu
function Show-Menu {
    Write-Host "`n🏠 Casa de Caridade Batuara - Gerenciador de Serviços Frontend" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Escolha uma opção:" -ForegroundColor White
    Write-Host "1) 🚀 Iniciar serviços (start)" -ForegroundColor Green
    Write-Host "2) 🛑 Parar serviços (stop)" -ForegroundColor Red
    Write-Host "3) 📊 Ver status (status)" -ForegroundColor Blue
    Write-Host "4) 🔄 Reiniciar serviços (restart)" -ForegroundColor Yellow
    Write-Host "5) ❌ Sair" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Digite sua escolha (1-5)"
    
    switch ($choice) {
        "1" { Start-AllServices }
        "2" { Stop-AllServices }
        "3" { Show-ServicesStatus }
        "4" { Restart-AllServices }
        "5" { 
            Write-Host "👋 Até logo!" -ForegroundColor Green
            exit 0
        }
        default { 
            Write-Host "❌ Opção inválida. Tente novamente." -ForegroundColor Red
            Show-Menu
        }
    }
}

# Lógica principal
switch ($Action.ToLower()) {
    "start" { 
        Start-AllServices 
    }
    "stop" { 
        Stop-AllServices 
    }
    "status" { 
        Show-ServicesStatus 
    }
    "restart" { 
        Restart-AllServices 
    }
    "" { 
        Show-Menu 
    }
    default { 
        Write-Host "❌ Ação inválida. Use: start, stop, status, restart" -ForegroundColor Red
        Write-Host "Exemplo: .\manage-services.ps1 start" -ForegroundColor Yellow
    }
}