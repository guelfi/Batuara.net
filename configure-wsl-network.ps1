# Script para configurar acesso aos frontends WSL pela rede local
# Execute este script como Administrador no PowerShell do Windows

Write-Host "=== Configurando Port Forwarding Windows -> WSL ===" -ForegroundColor Green

# Remover configurações existentes (se houver)
Write-Host "Removendo configurações existentes..." -ForegroundColor Yellow
try {
    netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
    netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0
} catch {
    Write-Host "Nenhuma configuração anterior encontrada" -ForegroundColor Gray
}

# Adicionar redirecionamentos
Write-Host "Adicionando redirecionamento para porta 3000 (PublicWebsite)..." -ForegroundColor Cyan
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.17.158.1

Write-Host "Adicionando redirecionamento para porta 3001 (AdminDashboard)..." -ForegroundColor Cyan
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.17.158.1

# Configurar Windows Firewall
Write-Host "Configurando Windows Firewall..." -ForegroundColor Cyan
New-NetFirewallRule -DisplayName "WSL PublicWebsite Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "WSL AdminDashboard Port 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow -ErrorAction SilentlyContinue

# Verificar configurações
Write-Host "\n=== Configurações de Port Proxy ===" -ForegroundColor Green
netsh interface portproxy show all

Write-Host "\n=== Regras do Firewall ===" -ForegroundColor Green
Get-NetFirewallRule -DisplayName "*WSL*" | Select-Object DisplayName, Direction, Action, Enabled

Write-Host "\n=== Instruções ===" -ForegroundColor Yellow
Write-Host "1. Agora você pode acessar os frontends pelo IP da rede local:" -ForegroundColor White
Write-Host "   - PublicWebsite: http://192.168.15.120:3000" -ForegroundColor Cyan
Write-Host "   - AdminDashboard: http://192.168.15.120:3001" -ForegroundColor Cyan
Write-Host "2. Teste pelo celular conectado na mesma rede WiFi" -ForegroundColor White
Write-Host "3. Se não funcionar, verifique se o Windows Defender não está bloqueando" -ForegroundColor White

Write-Host "\nConfiguração concluída!" -ForegroundColor Green
Pause