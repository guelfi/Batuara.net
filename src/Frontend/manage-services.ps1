# Script de gerenciamento dos servicos frontend
# Uso: .\manage-services.ps1 [start|stop|status|restart]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "status", "restart", "")]
    [string]$Action = ""
)

# Configuracoes
$PublicWebsitePort = 3000
$AdminDashboardPort = 3001
$PublicWebsitePath = "PublicWebsite"
$AdminDashboardPath = "AdminDashboard"

# Funcao para verificar se uma porta esta em uso
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

# Funcao para obter processo na porta
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

# Funcao para matar processo na porta
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)
    
    $process = Get-ProcessOnPort -Port $Port
    if ($process) {
        Write-Host "Parando $ServiceName (PID: $($process.Id)) na porta $Port" -ForegroundColor Red
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 1000
        
        # Verificar se realmente parou
        if (-not (Test-PortInUse -Port $Port)) {
            Write-Host "$ServiceName parado com sucesso" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$ServiceName pode ainda estar rodando" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "$ServiceName nao estava rodando na porta $Port" -ForegroundColor Blue
        return $true
    }
}

# Funcao para mostrar status dos servicos
function Show-ServicesStatus {
    Write-Host "`nStatus dos Servicos Frontend" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    # PublicWebsite
    if (Test-PortInUse -Port $PublicWebsitePort) {
        $process = Get-ProcessOnPort -Port $PublicWebsitePort
        Write-Host "PublicWebsite (porta $PublicWebsitePort): " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        if ($process) {
            Write-Host "   PID: $($process.Id) | Processo: $($process.ProcessName)" -ForegroundColor Gray
        }
        Write-Host "   URL: http://localhost:$PublicWebsitePort" -ForegroundColor Blue
    } else {
        Write-Host "PublicWebsite (porta $PublicWebsitePort): " -NoNewline -ForegroundColor White
        Write-Host "PARADO" -ForegroundColor Red
    }
    
    # AdminDashboard
    if (Test-PortInUse -Port $AdminDashboardPort) {
        $process = Get-ProcessOnPort -Port $AdminDashboardPort
        Write-Host "AdminDashboard (porta $AdminDashboardPort): " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        if ($process) {
            Write-Host "   PID: $($process.Id) | Processo: $($process.ProcessName)" -ForegroundColor Gray
        }
        Write-Host "   URL: http://localhost:$AdminDashboardPort" -ForegroundColor Blue
    } else {
        Write-Host "AdminDashboard (porta $AdminDashboardPort): " -NoNewline -ForegroundColor White
        Write-Host "PARADO" -ForegroundColor Red
    }
    Write-Host ""
}

# Funcao para parar todos os servicos
function Stop-AllServices {
    Write-Host "`nParando todos os servicos..." -ForegroundColor Yellow
    
    $publicStopped = Stop-ProcessOnPort -Port $PublicWebsitePort -ServiceName "PublicWebsite"
    $adminStopped = Stop-ProcessOnPort -Port $AdminDashboardPort -ServiceName "AdminDashboard"
    
    if ($publicStopped -and $adminStopped) {
        Write-Host "`nTodos os servicos foram parados com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "`nAlguns servicos podem ainda estar rodando. Verifique o status." -ForegroundColor Yellow
    }
}

# Funcao para iniciar todos os servicos
function Start-AllServices {
    Write-Host "`nIniciando servicos frontend..." -ForegroundColor Cyan
    
    # Verificar se as dependencias estao instaladas
    if (-not (Test-Path "$PublicWebsitePath\node_modules")) {
        Write-Host "Dependencias do PublicWebsite nao encontradas. Execute: cd $PublicWebsitePath && npm install" -ForegroundColor Red
        return
    }
    
    if (-not (Test-Path "$AdminDashboardPath\node_modules")) {
        Write-Host "Dependencias do AdminDashboard nao encontradas. Execute: cd $AdminDashboardPath && npm install" -ForegroundColor Red
        return
    }
    
    # Parar servicos existentes primeiro
    Write-Host "Verificando portas em uso..." -ForegroundColor Yellow
    if (Test-PortInUse -Port $PublicWebsitePort) {
        Stop-ProcessOnPort -Port $PublicWebsitePort -ServiceName "PublicWebsite"
    }
    if (Test-PortInUse -Port $AdminDashboardPort) {
        Stop-ProcessOnPort -Port $AdminDashboardPort -ServiceName "AdminDashboard"
    }
    
    Write-Host "`nIniciando servicos em segundo plano..." -ForegroundColor Green
    
    # Iniciar PublicWebsite em segundo plano
    Write-Host "Iniciando PublicWebsite..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", "cd '$PublicWebsitePath'; npm start" -WindowStyle Hidden
    
    # Aguardar um pouco antes de iniciar o proximo
    Start-Sleep -Seconds 2
    
    # Iniciar AdminDashboard em segundo plano
    Write-Host "Iniciando AdminDashboard..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", "cd '$AdminDashboardPath'; `$env:PORT=$AdminDashboardPort; npm start" -WindowStyle Hidden
    
    # Aguardar os servicos iniciarem
    Write-Host "`nAguardando servicos iniciarem..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verificar se os servicos estao rodando
    $publicRunning = Test-PortInUse -Port $PublicWebsitePort
    $adminRunning = Test-PortInUse -Port $AdminDashboardPort
    
    Write-Host "`nStatus dos servicos:" -ForegroundColor Cyan
    if ($publicRunning) {
        Write-Host "PublicWebsite: " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        Write-Host "   URL: http://localhost:$PublicWebsitePort" -ForegroundColor Blue
    } else {
        Write-Host "PublicWebsite: " -NoNewline -ForegroundColor White
        Write-Host "FALHOU AO INICIAR" -ForegroundColor Red
    }
    
    if ($adminRunning) {
        Write-Host "AdminDashboard: " -NoNewline -ForegroundColor White
        Write-Host "RODANDO" -ForegroundColor Green
        Write-Host "   URL: http://localhost:$AdminDashboardPort" -ForegroundColor Blue
    } else {
        Write-Host "AdminDashboard: " -NoNewline -ForegroundColor White
        Write-Host "FALHOU AO INICIAR" -ForegroundColor Red
    }
    
    if ($publicRunning -and $adminRunning) {
        Write-Host "`nTodos os servicos foram iniciados com sucesso!" -ForegroundColor Green
        Write-Host "Use '.\manage-services.ps1 status' para verificar o status" -ForegroundColor Yellow
        Write-Host "Use '.\manage-services.ps1 stop' para parar os servicos" -ForegroundColor Yellow
    } else {
        Write-Host "`nAlguns servicos falharam ao iniciar. Verifique os logs." -ForegroundColor Yellow
    }
}

# Funcao para reiniciar servicos
function Restart-AllServices {
    Write-Host "`nReiniciando servicos..." -ForegroundColor Cyan
    Stop-AllServices
    Start-Sleep -Seconds 2
    Start-AllServices
}

# Funcao para mostrar menu
function Show-Menu {
    Write-Host "`nCasa de Caridade Batuara - Gerenciador de Servicos Frontend" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Escolha uma opcao:" -ForegroundColor White
    Write-Host "1) Iniciar servicos (start)" -ForegroundColor Green
    Write-Host "2) Parar servicos (stop)" -ForegroundColor Red
    Write-Host "3) Ver status (status)" -ForegroundColor Blue
    Write-Host "4) Reiniciar servicos (restart)" -ForegroundColor Yellow
    Write-Host "5) Sair" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Digite sua escolha (1-5)"
    
    switch ($choice) {
        "1" { Start-AllServices }
        "2" { Stop-AllServices }
        "3" { Show-ServicesStatus }
        "4" { Restart-AllServices }
        "5" { 
            Write-Host "Ate logo!" -ForegroundColor Green
            exit 0
        }
        default { 
            Write-Host "Opcao invalida. Tente novamente." -ForegroundColor Red
            Show-Menu
        }
    }
}

# Logica principal
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
        Write-Host "Acao invalida. Use: start, stop, status, restart" -ForegroundColor Red
        Write-Host "Exemplo: .\manage-services.ps1 start" -ForegroundColor Yellow
    }
}