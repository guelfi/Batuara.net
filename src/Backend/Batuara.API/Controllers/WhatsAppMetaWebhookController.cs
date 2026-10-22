using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/webhooks/whatsapp-meta")]
    public class WhatsAppMetaWebhookController : ControllerBase
    {
        private readonly BatuaraDbContext _db;
        private readonly WhatsAppCloudApiOptions _options;
        private readonly ILogger<WhatsAppMetaWebhookController> _logger;

        public WhatsAppMetaWebhookController(
            BatuaraDbContext db,
            IOptions<WhatsAppCloudApiOptions> options,
            ILogger<WhatsAppMetaWebhookController> logger)
        {
            _db = db;
            _options = options.Value;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Verify(
            [FromQuery(Name = "hub.mode")] string? mode,
            [FromQuery(Name = "hub.verify_token")] string? verifyToken,
            [FromQuery(Name = "hub.challenge")] string? challenge)
        {
            if (mode == "subscribe"
                && !string.IsNullOrWhiteSpace(_options.WebhookVerifyToken)
                && verifyToken == _options.WebhookVerifyToken
                && !string.IsNullOrEmpty(challenge))
            {
                return Content(challenge, "text/plain");
            }

            _logger.LogWarning("WhatsApp Meta webhook verification rejected");
            return Forbid();
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> ReceiveWebhook()
        {
            string rawBody;
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
            {
                rawBody = await reader.ReadToEndAsync();
            }

            if (!string.IsNullOrWhiteSpace(_options.AppSecret) && !IsValidSignature(rawBody))
            {
                _logger.LogWarning("WhatsApp Meta webhook rejected: invalid X-Hub-Signature-256");
                return Unauthorized();
            }

            var payload = JsonSerializer.Deserialize<MetaWebhookPayload>(rawBody);
            if (payload?.Entry == null)
            {
                return Ok(new { success = true });
            }

            foreach (var entry in payload.Entry)
            {
                if (entry.Changes == null)
                {
                    continue;
                }

                foreach (var change in entry.Changes)
                {
                    var messages = change.Value?.Messages;
                    if (messages == null)
                    {
                        continue;
                    }

                    foreach (var message in messages)
                    {
                        await ProcessInboundMessageAsync(message);
                    }
                }
            }

            return Ok(new { success = true });
        }

        private bool IsValidSignature(string rawBody)
        {
            var header = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();
            if (string.IsNullOrEmpty(header) || !header.StartsWith("sha256=", StringComparison.Ordinal))
            {
                return false;
            }

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.AppSecret));
            var expected = "sha256=" + Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody))).ToLowerInvariant();
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(header));
        }

        private async Task ProcessInboundMessageAsync(MetaWebhookMessage message)
        {
            if (string.IsNullOrWhiteSpace(message.From) || string.IsNullOrWhiteSpace(message.Text?.Body))
            {
                _logger.LogInformation("Ignored non-text or empty inbound Meta message of type {Type}", message.Type);
                return;
            }

            var phone = message.From;
            var body = message.Text.Body;
            var messageId = string.IsNullOrWhiteSpace(message.Id) ? Guid.NewGuid().ToString() : message.Id;

            var threshold = DateTime.UtcNow.AddDays(-30);
            var candidates = await _db.ContactMessages
                .Include(x => x.WhatsAppMessages)
                .Where(x => x.WantsWhatsAppResponse && x.ReceivedAt >= threshold)
                .ToListAsync();

            var normalizedInputPhone = Application.Common.PhoneNumbers.PhoneNumberNormalizer.NormalizeBrazilMobile(phone);

            var contactMessage = candidates
                .Where(x => Application.Common.PhoneNumbers.PhoneNumberNormalizer.NormalizeBrazilMobile(x.Phone ?? string.Empty) == normalizedInputPhone)
                .OrderByDescending(x => x.ReceivedAt)
                .FirstOrDefault();

            if (contactMessage != null)
            {
                contactMessage.AddWhatsAppMessage(messageId, phone, "sistema", body, false, DateTime.UtcNow);

                if (contactMessage.Status == ContactMessageStatus.Resolved)
                {
                    contactMessage.UpdateStatus(ContactMessageStatus.InProgress, "Reaberto automaticamente devido a resposta do visitante no WhatsApp.");
                }

                await _db.SaveChangesAsync();
                _logger.LogInformation("Mensagem recebida via WhatsApp (Meta) cadastrada no histórico da mensagem {Id}", contactMessage.Id);
            }
            else
            {
                _logger.LogWarning("Nenhuma mensagem de contato ativa com autorização de WhatsApp encontrada para o número: {Phone}", phone);
            }
        }
    }

    public class MetaWebhookPayload
    {
        [JsonPropertyName("object")]
        public string? Object { get; set; }

        [JsonPropertyName("entry")]
        public List<MetaWebhookEntry>? Entry { get; set; }
    }

    public class MetaWebhookEntry
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("changes")]
        public List<MetaWebhookChange>? Changes { get; set; }
    }

    public class MetaWebhookChange
    {
        [JsonPropertyName("field")]
        public string? Field { get; set; }

        [JsonPropertyName("value")]
        public MetaWebhookValue? Value { get; set; }
    }

    public class MetaWebhookValue
    {
        [JsonPropertyName("messages")]
        public List<MetaWebhookMessage>? Messages { get; set; }
    }

    public class MetaWebhookMessage
    {
        [JsonPropertyName("from")]
        public string? From { get; set; }

        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("timestamp")]
        public string? Timestamp { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("text")]
        public MetaWebhookText? Text { get; set; }
    }

    public class MetaWebhookText
    {
        [JsonPropertyName("body")]
        public string? Body { get; set; }
    }
}
