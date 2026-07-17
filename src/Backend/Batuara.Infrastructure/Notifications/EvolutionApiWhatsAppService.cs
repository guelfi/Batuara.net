using System.Net.Http.Json;
using Batuara.Application.Common.PhoneNumbers;
using Batuara.Application.Notifications.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Notifications
{
    public class EvolutionApiWhatsAppService : IWhatsAppService
    {
        private readonly HttpClient _httpClient;
        private readonly EvolutionApiWhatsAppOptions _options;
        private readonly ILogger<EvolutionApiWhatsAppService> _logger;

        public EvolutionApiWhatsAppService(
            HttpClient httpClient,
            IOptions<EvolutionApiWhatsAppOptions> options,
            ILogger<EvolutionApiWhatsAppService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        public async Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
        {
            // Código em linha própria e em negrito (*código*) para facilitar
            // a seleção e cópia — especialmente para usuários com pouca experiência.
            var message =
                $"🔐 *Casa Batuara — Código de Acesso*\n\n" +
                $"*{code}*\n\n" +
                $"Copie e cole esse código na tela de login.\n" +
                $"Válido por 10 minutos.";

            await SendTextAsync(phoneE164, message, cancellationToken);
        }

        public async Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default)
        {
            var firstName = string.IsNullOrWhiteSpace(memberName) ? "Filho da Casa" : memberName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "Filho da Casa";
            var text = $"Casa Batuara: {firstName}, lembramos que sua contribuicao de R$ {amount:F2} vence em {dueDate:dd/MM/yyyy}. Caso ja tenha contribuido, desconsidere.";
            await SendTextAsync(phoneE164, text, cancellationToken);
        }

        public async Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default)
        {
            return await SendTextAsync(phoneE164, $"Casa Batuara: {responseText.Trim()}", cancellationToken);
        }

        private async Task<string> SendTextAsync(string phoneE164, string text, CancellationToken cancellationToken)
        {
            if (!_options.Enabled)
            {
                _logger.LogInformation("WhatsApp sending is disabled");
                throw new InvalidOperationException("Envio de WhatsApp está desabilitado neste ambiente.");
            }

            var number = NormalizeToEvolutionNumber(phoneE164);
            if (!IsAllowed(number))
            {
                _logger.LogWarning("Blocked WhatsApp send to non-allowlisted recipient ending with {PhoneSuffix}", GetSuffix(number));
                throw new InvalidOperationException("WhatsApp recipient is not allowed in this environment.");
            }

            if (string.IsNullOrWhiteSpace(_options.BaseUrl) || string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                throw new InvalidOperationException("WhatsApp provider is not configured.");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, $"message/sendText/{_options.InstanceName}")
            {
                Content = JsonContent.Create(new
                {
                    number,
                    text
                })
            };
            request.Headers.TryAddWithoutValidation("apikey", _options.ApiKey);

            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Evolution API send failed with status {StatusCode}", (int)response.StatusCode);
                response.EnsureSuccessStatusCode();
            }

            try
            {
                var result = await response.Content.ReadFromJsonAsync<EvolutionSendResponse>(cancellationToken: cancellationToken);
                return result?.Key?.Id ?? Guid.NewGuid().ToString();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse Evolution API send response, generating fallback GUID.");
                return Guid.NewGuid().ToString();
            }
        }

        private bool IsAllowed(string number)
        {
            if (_options.AllowedRecipients.Length == 0)
            {
                return true;
            }

            return _options.AllowedRecipients
                .Select(NormalizeToEvolutionNumber)
                .Contains(number, StringComparer.Ordinal);
        }

        private static string NormalizeToEvolutionNumber(string phone)
        {
            return PhoneNumberNormalizer.NormalizeBrazilMobile(phone);
        }

        private static string GetSuffix(string number)
        {
            return number.Length <= 4 ? number : number[^4..];
        }

        private class EvolutionSendResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("key")]
            public EvolutionKeyResponse? Key { get; set; }
        }

        private class EvolutionKeyResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("id")]
            public string? Id { get; set; }
        }
    }
}
