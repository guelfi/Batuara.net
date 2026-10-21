namespace Batuara.Infrastructure.Notifications
{
    public class WhatsAppCloudApiOptions
    {
        public bool Enabled { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string PhoneNumberId { get; set; } = string.Empty;
        public string ApiVersion { get; set; } = "v21.0";
        public string GraphApiBaseUrl { get; set; } = "https://graph.facebook.com";
        public string Language { get; set; } = "pt_BR";
        public string WebhookVerifyToken { get; set; } = string.Empty;
        public string AuthTemplateName { get; set; } = "casa_login_code";
        public bool AuthTemplateHasCopyButton { get; set; } = true;
        public string ContributionReminderTemplateName { get; set; } = "casa_contribution_reminder";
        public string ContactResponseTemplateName { get; set; } = "casa_contact_response";
        public string[] AllowedRecipients { get; set; } = [];
    }
}
