# Script para matar processos nas portas 3000 e 3001
Write-Host "🔍 Verificando portas 3000 e 3001..." -ForegroundColor Yellow

# Função para matar processo na porta
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "❌ Matando processo $($process.ProcessName) (PID: $processId) na porta $Port" -ForegroundColor Red
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                }
            }
            Write-Host "✅ Porta $Port liberada" -ForegroundColor Green
        } else {
            Write-Host "✅ Porta $Port já está livre" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  Erro ao verificar porta $Port`: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Matar processos nas portas 3000 e 3001
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 3001

Write-Host "🚀 Portas liberadas! Iniciando serviços..." -ForegroundColor Cyan