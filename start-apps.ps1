Write-Host "🏠 Iniciando Batuara.net Frontend Applications" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📱 PublicWebsite estará disponível em: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 AdminDashboard estará disponível em: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Credenciais do Dashboard:" -ForegroundColor Yellow
Write-Host "   Email: admin@casabatuara.org.br" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""

Write-Host "Iniciando PublicWebsite na porta 8080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'src\Frontend\PublicWebsite'; npm start"

Start-Sleep -Seconds 3

Write-Host "Iniciando AdminDashboard na porta 8081..." -ForegroundColor Green  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'src\Frontend\AdminDashboard'; npm start"

Write-Host ""
Write-Host "✅ Aplicações iniciadas em janelas separadas!" -ForegroundColor Green
Write-Host "📱 PublicWebsite: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 AdminDashboard: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar as aplicações, feche as janelas do PowerShell ou use Ctrl+C" -ForegroundColor Yellow

Read-Host "Pressione Enter para continuar"