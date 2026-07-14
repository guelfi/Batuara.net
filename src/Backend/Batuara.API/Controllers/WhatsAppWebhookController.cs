using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/webhooks/whatsapp")]
    public class WhatsAppWebhookController : ControllerBase
    {
        private readonly BatuaraDbContext _db;
        private readonly ILogger<WhatsAppWebhookController> _logger;

        public WhatsAppWebhookController(BatuaraDbContext db, ILogger<WhatsAppWebhookController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> ReceiveWebhook([FromBody] EvolutionWebhookPayload payload)
        {
            if (payload == null)
            {
                return BadRequest("Payload cannot be null");
            }

            _logger.LogInformation("Received webhook event: {Event}", payload.Event);

            if (payload.Event != "messages.upsert" || payload.Data?.Key == null)
            {
                return Ok(new { success = true, message = "Ignored non-message.upsert event" });
            }

            // Ignorar mensagens enviadas pelo próprio sistema/admin
            if (payload.Data.Key.FromMe)
            {
                return Ok(new { success = true, message = "Ignored outgoing message (fromMe = true)" });
            }

            // Extrair número de telefone do remoteJid (ex: 5511975747470@s.whatsapp.net)
            var remoteJid = payload.Data.Key.RemoteJid ?? string.Empty;
            var phone = remoteJid.Split('@').FirstOrDefault() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(phone))
            {
                _logger.LogWarning("RemoteJid is empty or invalid: {RemoteJid}", remoteJid);
                return Ok(new { success = true, message = "Invalid phone number" });
            }

            // Extrair corpo da mensagem (suporta texto direto conversation ou extended text)
            var body = payload.Data.Message?.Conversation ?? payload.Data.Message?.ExtendedTextMessage?.Text ?? string.Empty;
            if (string.IsNullOrWhiteSpace(body))
            {
                _logger.LogInformation("Ignored empty body message from {Phone}", phone);
                return Ok(new { success = true, message = "Message body is empty" });
            }

            var messageId = payload.Data.Key.Id ?? Guid.NewGuid().ToString();

            // Buscar as mensagens de contato ativas recentes (últimos 30 dias)
            var threshold = DateTime.UtcNow.AddDays(-30);
            var candidates = await _db.ContactMessages
                .Include(x => x.WhatsAppMessages)
                .Where(x => x.WantsWhatsAppResponse && x.ReceivedAt >= threshold)
                .ToListAsync();

            var normalizedInputPhone = Batuara.Application.Common.PhoneNumbers.PhoneNumberNormalizer.NormalizeBrazilMobile(phone);

            var contactMessage = candidates
                .Where(x => Batuara.Application.Common.PhoneNumbers.PhoneNumberNormalizer.NormalizeBrazilMobile(x.Phone ?? string.Empty) == normalizedInputPhone)
                .OrderByDescending(x => x.ReceivedAt)
                .FirstOrDefault();

            if (contactMessage != null)
            {
                contactMessage.AddWhatsAppMessage(messageId, phone, "sistema", body, false, DateTime.UtcNow);
                
                // Se a mensagem estava "Resolvida", reabrir para "Em atendimento" (InProgress)
                // para sinalizar que o visitante enviou uma resposta pendente.
                if (contactMessage.Status == Batuara.Domain.Enums.ContactMessageStatus.Resolved)
                {
                    contactMessage.UpdateStatus(Batuara.Domain.Enums.ContactMessageStatus.InProgress, "Reaberto automaticamente devido a resposta do visitante no WhatsApp.");
                }
                
                await _db.SaveChangesAsync();
                _logger.LogInformation("Mensagem recebida via WhatsApp cadastrada no histórico da mensagem {Id}", contactMessage.Id);
            }
            else
            {
                _logger.LogWarning("Nenhuma mensagem de contato ativa com autorização de WhatsApp encontrada para o número: {Phone}", phone);
            }

            return Ok(new { success = true });
        }
    }

    public class EvolutionWebhookPayload
    {
        [JsonPropertyName("event")]
        public string Event { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public EvolutionWebhookData? Data { get; set; }
    }

    public class EvolutionWebhookData
    {
        [JsonPropertyName("key")]
        public EvolutionWebhookKey? Key { get; set; }

        [JsonPropertyName("message")]
        public EvolutionWebhookMessage? Message { get; set; }
    }

    public class EvolutionWebhookKey
    {
        [JsonPropertyName("remoteJid")]
        public string RemoteJid { get; set; } = string.Empty;

        [JsonPropertyName("fromMe")]
        public bool FromMe { get; set; }

        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
    }

    public class EvolutionWebhookMessage
    {
        [JsonPropertyName("conversation")]
        public string? Conversation { get; set; }

        [JsonPropertyName("extendedTextMessage")]
        public EvolutionWebhookExtendedText? ExtendedTextMessage { get; set; }
    }

    public class EvolutionWebhookExtendedText
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;
    }
}
