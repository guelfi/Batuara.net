using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Batuara.Application.Common.PhoneNumbers;
using Batuara.Application.Notifications.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Notifications
{
    public class WhatsAppCloudApiService : IWhatsAppService
    {
        private readonly HttpClient _httpClient;
        private readonly WhatsAppCloudApiOptions _options;
        private readonly ILogger<WhatsAppCloudApiService> _logger;

        public WhatsAppCloudApiService(
            HttpClient httpClient,
            IOptions<WhatsAppCloudApiOptions> options,
            ILogger<WhatsAppCloudApiService> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        public async Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(code) } }
            };

            if (_options.AuthTemplateHasCopyButton)
            {
                components.Add(new { type = "button", sub_type = "url", index = "0", parameters = new[] { TextParam(code) } });
            }

            await SendTemplateAsync(phoneE164, _options.AuthTemplateName, components, cancellationToken);
        }

        public async Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default)
        {
            var firstName = string.IsNullOrWhiteSpace(memberName) ? "Filho da Casa" : memberName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "Filho da Casa";
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(firstName), TextParam($"R$ {amount:F2}"), TextParam($"{dueDate:dd/MM/yyyy}") } }
            };
            await SendTemplateAsync(phoneE164, _options.ContributionReminderTemplateName, components, cancellationToken);
        }

        public async Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default)
        {
            try
            {
                return await SendFreeformTextAsync(phoneE164, responseText.Trim(), cancellationToken);
            }
            catch (HttpRequestException)
            {
                var components = new List<object>
                {
                    new { type = "body", parameters = new[] { TextParam(responseText.Trim()) } }
                };
                return await SendTemplateAsync(phoneE164, _options.ContactResponseTemplateName, components, cancellationToken);
            }
        }

        public async Task SendAdminNotificationAsync(string phoneE164, int pendingCount, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(pendingCount.ToString()) } }
            };
            await SendTemplateAsync(phoneE164, _options.AdminNotificationTemplateName, components, cancellationToken);
        }

        public async Task SendBirthdayGreetingAsync(string phoneE164, string memberName, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(FirstName(memberName)) } }
            };
            await SendTemplateAsync(phoneE164, _options.BirthdayTemplateName, components, cancellationToken);
        }

        public async Task SendEventInviteAsync(string phoneE164, string memberName, string eventName, string eventDate, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(FirstName(memberName)), TextParam(eventName.Trim()), TextParam(eventDate.Trim()) } }
            };
            await SendTemplateAsync(phoneE164, _options.EventInviteTemplateName, components, cancellationToken);
        }

        public async Task SendMemberNoticeAsync(string phoneE164, string memberName, string noticeText, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(FirstName(memberName)), TextParam(SanitizeTemplateText(noticeText)) } }
            };
            await SendTemplateAsync(phoneE164, _options.MemberNoticeTemplateName, components, cancellationToken);
        }

        public async Task SendSiteTutorialLinkAsync(string phoneE164, string memberName, string tutorialUrl, CancellationToken cancellationToken = default)
        {
            var components = new List<object>
            {
                new { type = "body", parameters = new[] { TextParam(FirstName(memberName)), TextParam(tutorialUrl.Trim()) } }
            };
            await SendTemplateAsync(phoneE164, _options.SiteTutorialTemplateName, components, cancellationToken);
        }

        private async Task<string> SendFreeformTextAsync(string phoneE164, string text, CancellationToken cancellationToken)
        {
            var to = ValidateRecipient(phoneE164);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.PhoneNumberId}/messages")
            {
                Content = JsonContent.Create(new
                {
                    messaging_product = "whatsapp",
                    to,
                    type = "text",
                    text = new { body = text }
                })
            };
            request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_options.AccessToken}");
            return await SendAndReadIdAsync(request, cancellationToken);
        }

        private async Task<string> SendTemplateAsync(string phoneE164, string templateName, List<object> components, CancellationToken cancellationToken)
        {
            var to = ValidateRecipient(phoneE164);
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.PhoneNumberId}/messages")
            {
                Content = JsonContent.Create(new
                {
                    messaging_product = "whatsapp",
                    to,
                    type = "template",
                    template = new
                    {
                        name = templateName,
                        language = new { code = _options.Language },
                        components
                    }
                })
            };
            request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_options.AccessToken}");
            return await SendAndReadIdAsync(request, cancellationToken);
        }

        private string ValidateRecipient(string phoneE164)
        {
            if (!_options.Enabled)
            {
                _logger.LogInformation("WhatsApp sending is disabled");
                throw new InvalidOperationException("Envio de WhatsApp está desabilitado neste ambiente.");
            }

            var to = NormalizeToWhatsAppNumber(phoneE164);
            if (!IsAllowed(to))
            {
                _logger.LogWarning("Blocked WhatsApp send to non-allowlisted recipient ending with {PhoneSuffix}", GetSuffix(to));
                throw new InvalidOperationException("WhatsApp recipient is not allowed in this environment.");
            }

            if (string.IsNullOrWhiteSpace(_options.AccessToken) || string.IsNullOrWhiteSpace(_options.PhoneNumberId))
            {
                throw new InvalidOperationException("WhatsApp Cloud API is not configured.");
            }

            return to;
        }

        private async Task<string> SendAndReadIdAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("WhatsApp Cloud API send failed with status {StatusCode}: {ErrorBody}", (int)response.StatusCode, errorBody);
                response.EnsureSuccessStatusCode();
            }

            try
            {
                var result = await response.Content.ReadFromJsonAsync<CloudApiSendResponse>(cancellationToken: cancellationToken);
                return result?.Messages?.FirstOrDefault()?.Id ?? Guid.NewGuid().ToString();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse WhatsApp Cloud API send response, generating fallback GUID.");
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
                .Select(NormalizeToWhatsAppNumber)
                .Contains(number, StringComparer.Ordinal);
        }

        private static object TextParam(string text) => new { type = "text", text };

        private static string FirstName(string memberName)
        {
            return string.IsNullOrWhiteSpace(memberName)
                ? "Filho da Casa"
                : memberName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "Filho da Casa";
        }

        // A Meta rejeita parâmetro de template com quebra de linha, tab ou 4+ espaços seguidos.
        private static string SanitizeTemplateText(string text)
        {
            var singleLine = text.Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
            return System.Text.RegularExpressions.Regex.Replace(singleLine, " {2,}", " ").Trim();
        }

        private static string NormalizeToWhatsAppNumber(string phone)
        {
            return PhoneNumberNormalizer.NormalizeBrazilMobile(phone);
        }

        private static string GetSuffix(string number)
        {
            return number.Length <= 4 ? number : number[^4..];
        }

        private class CloudApiSendResponse
        {
            [JsonPropertyName("messages")]
            public List<CloudApiMessage>? Messages { get; set; }
        }

        private class CloudApiMessage
        {
            [JsonPropertyName("id")]
            public string? Id { get; set; }
        }
    }
}
