Encontrei dois bugs reais na funcionalidade de resposta por WhatsApp para mensagens de contato, confirmados testando de ponta a ponta (envio real via túnel SSH até a instância `batuara-casa` na OCI, com logs da API na mão). O visitante nunca recebeu a resposta, apesar da UI mostrar "Respondida" na primeira tentativa.

## Bug 1 — Mensagem marcada como "Respondida" mesmo quando o envio foi um no-op silencioso

`ContactMessageService.SendWhatsAppResponseAsync` (`src/Backend/Batuara.Infrastructure/ContactMessages/Services/ContactMessageService.cs:145-172`) chama `_whatsAppService.SendContactResponseAsync(...)` na linha 168 e, logo em seguida (linha 169), **sempre** chama `entity.MarkWhatsAppResponseSent(...)` — sem checar se o envio de fato aconteceu.

O problema: `EvolutionApiWhatsAppService.SendTextAsync` (`src/Backend/Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppService.cs:40-44`) faz isso quando `WhatsApp:Enabled=false`:
```csharp
if (!_options.Enabled)
{
    _logger.LogInformation("WhatsApp sending is disabled");
    return;
}
```
Retorna silenciosamente, sem lançar exceção. Resultado: `ContactMessageService` não tem como distinguir "enviei de verdade" de "não enviei porque está desligado", e marca a mensagem como respondida mesmo sem nada ter sido entregue ao visitante. Isso é enganoso para quem estiver atendendo pela Casa — vai achar que respondeu quando não respondeu.

**Correção:** fazer com que a chamada só marque como respondida se o envio realmente for tentado com sucesso. Duas opções, escolha a mais simples de manter:
- (a) `SendTextAsync` lançar uma exceção específica (ex.: `WhatsAppDisabledException`) quando `Enabled=false`, em vez de retornar silenciosamente; `ContactMessageService` captura essa exceção específica e retorna erro "Envio de WhatsApp está desabilitado neste ambiente." sem marcar como respondida.
- (b) `ContactMessageService.SendWhatsAppResponseAsync` checar a configuração (`IOptions<EvolutionApiWhatsAppOptions>` ou equivalente exposto pela interface) antes de chamar o serviço, e retornar erro cedo se `Enabled=false`.

Mesma checagem vale para `IWhatsAppService.SendAuthCodeAsync` e `SendContributionReminderAsync` — nesses dois casos hoje não há esse problema de "marcar como enviado indevidamente" porque o chamador não depende do resultado para atualizar status visível ao usuário do mesmo jeito, mas vale revisar se faz sentido unificar o comportamento.

## Bug 2 — Allowlist nunca bate com telefone real (bloqueia envio em qualquer ambiente com `Enabled=true`)

Com `WhatsApp:Enabled=true` de verdade (testei via túnel SSH até `batuara-casa` na OCI), o envio falhou assim:
```
Blocked WhatsApp send to non-allowlisted recipient ending with 7470
System.InvalidOperationException: WhatsApp recipient is not allowed in this environment.
   at Batuara.Infrastructure.Notifications.EvolutionApiWhatsAppService.SendTextAsync(...)
```

Causa: `EvolutionApiWhatsAppService.NormalizeToEvolutionNumber` (`src/Backend/Batuara.Infrastructure/Notifications/EvolutionApiWhatsAppService.cs:74-77`) só remove caracteres não numéricos:
```csharp
private static string NormalizeToEvolutionNumber(string phone)
{
    return new string(phone.Where(char.IsDigit).ToArray());
}
```
O telefone do `ContactMessage` é salvo como veio do formulário público (`11975747470`, sem `55`), mas `WhatsApp:AllowedRecipients` está configurado com `55` na frente (`5511975747470,5511995384032`, conforme `docs/Evolution API - Operacao OCI.md`). `IsAllowed` (linhas 62-72) compara os dois valores normalizados por essa função — como um tem `55` e o outro não, a comparação nunca bate, mesmo sendo o número certo. Isso bloqueia **qualquer** resposta por WhatsApp de contato público em qualquer ambiente com envio habilitado, não é específico deste teste.

**Correção:** trocar `NormalizeToEvolutionNumber` por `PhoneNumberNormalizer.NormalizeBrazilMobile` (já existe em `src/Backend/Batuara.Application/Common/PhoneNumbers/PhoneNumberNormalizer.cs`, já usado em `MemberAuthService` para o mesmo tipo de comparação), aplicando a mesma normalização tanto no número do destinatário quanto em cada item de `AllowedRecipients` antes de comparar. Isso garante que os dois lados sempre fiquem no formato `55DDDNNNNNNNNN` antes do `Contains`.

## Critério de aceite

1. Com `WhatsApp:Enabled=false`: tentar responder por WhatsApp retorna erro explícito ("Envio de WhatsApp está desabilitado neste ambiente") e a mensagem **não** é marcada como respondida.
2. Com `WhatsApp:Enabled=true` e o número do visitante presente em `AllowedRecipients` (com ou sem `55` no valor salvo em `ContactMessage.Phone`), o envio é aceito e a mensagem é marcada como respondida corretamente.
3. Teste automatizado cobrindo os dois casos acima com um fake de `IWhatsAppService` (padrão do projeto: ver `MemberAuthServiceTests.cs`), sem depender de WhatsApp real.
4. `tsc --noEmit` e `dotnet test` (via container `mcr.microsoft.com/dotnet/sdk:8.0`) passam sem erros.

## Depois de corrigir

Por favor reconstrua e recrie os containers Docker locais (`api`, e `admindashboard` se algo no frontend mudar) e confirme que ficam `healthy`, já que é isso que eu uso para validar em seguida.
