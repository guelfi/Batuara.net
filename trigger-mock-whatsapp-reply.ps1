# trigger-mock-whatsapp-reply.ps1
# Script para simular uma resposta de WhatsApp de um visitante para testar o sistema de histórico e webhook local.

param (
    [string]$Phone = "5511975747470", # Número de telefone cadastrado na mensagem de contato (formato DDI + DDD + Numero)
    [string]$Message = "Olá! Esta é uma resposta de teste simulada pelo webhook local."
)

Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Simulando recebimento de mensagem via WhatsApp..." -ForegroundColor Cyan
Write-Host "Telefone: $Phone"
Write-Host "Mensagem: $Message"
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
}

# Evolution API Payload format para webhook messages.upsert
$body = @{
    event = "messages.upsert"
    data = @{
        key = @{
            remoteJid = "$Phone@s.whatsapp.net"
            fromMe = $false
            id = "MOCK_MSG_" + (Get-Random -Minimum 100000 -Maximum 999999)
        }
        message = @{
            conversation = $Message
        }
    }
} | ConvertTo-Json -Depth 5

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

$url = "http://localhost/batuara-api/api/webhooks/whatsapp"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $bodyBytes
    Write-Host "Webhook enviado com sucesso!" -ForegroundColor Green
    Write-Host "Resposta da API: "
    $response | Format-List
}
catch {
    $e = $_.Exception
    if ($e.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($e.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        Write-Error "Falha ao enviar webhook (400 Bad Request): $errBody"
    } else {
        Write-Error "Falha ao enviar webhook: $_"
    }
}
