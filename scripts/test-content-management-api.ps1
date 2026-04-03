param(
    [string]$BaseUrl = "http://localhost/batuara-api/api",
    [string]$Email = "admin@batuara.org.br",
    [string]$Password = "Admin123!"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        $Body
    )

    if ($null -ne $Body) {
        return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 8)
    }

    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
}

$login = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/auth/login" -Body @{
    email = $Email
    password = $Password
}

$token = $login.data.token
$headers = @{
    Authorization = "Bearer $token"
}

$publicSettings = Invoke-JsonRequest -Method Get -Uri "$BaseUrl/site-settings/public"
$publicMessage = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/public/contact-messages" -Body @{
    name = "Smoke Test"
    email = "smoke-test@batuara.local"
    phone = "11999990099"
    subject = "Validação automatizada"
    message = "Mensagem criada pelo roteiro de integração."
}

$guide = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/guides" -Headers $headers -Body @{
    name = "Guia Smoke Test"
    description = "Cadastro temporário para validação da API."
    specialties = @("Integração", "QA")
    entryDate = "2026-04-01"
    displayOrder = 97
    email = "guia.smoke@batuara.local"
}

$member = Invoke-JsonRequest -Method Post -Uri "$BaseUrl/house-members" -Headers $headers -Body @{
    fullName = "Filho Smoke Test"
    birthDate = "1991-02-10"
    entryDate = "2024-06-01"
    headOrixaFront = "Oxóssi"
    headOrixaBack = "Ogum"
    headOrixaRonda = "Iansã"
    email = "filho.smoke@batuara.local"
    mobilePhone = "11999990098"
    zipCode = "07000-000"
    street = "Rua de Integração"
    number = "50"
    district = "Centro"
    city = "Guarulhos"
    state = "SP"
    contributions = @(
        @{
            referenceMonth = "2026-04-01"
            dueDate = "2026-04-10"
            amount = 50
            status = 2
            paidAt = "2026-04-05"
            notes = "Pago no roteiro automatizado."
        }
    )
}

$messageList = Invoke-JsonRequest -Method Get -Uri "$BaseUrl/contact-messages?pageNumber=1&pageSize=20&q=Smoke%20Test" -Headers $headers
$messageId = $messageList.data.data[0].id

$messageUpdated = Invoke-JsonRequest -Method Patch -Uri "$BaseUrl/contact-messages/$messageId/status" -Headers $headers -Body @{
    status = 4
    adminNotes = "Mensagem arquivada pelo roteiro de integração."
}

Invoke-JsonRequest -Method Delete -Uri "$BaseUrl/guides/$($guide.data.id)" -Headers $headers | Out-Null
Invoke-JsonRequest -Method Delete -Uri "$BaseUrl/house-members/$($member.data.id)" -Headers $headers | Out-Null

[PSCustomObject]@{
    PublicSettings = $publicSettings.success
    PublicMessage = $publicMessage.success
    GuideCreatedId = $guide.data.id
    HouseMemberCreatedId = $member.data.id
    MessageStatus = $messageUpdated.data.status
} | ConvertTo-Json -Compress
