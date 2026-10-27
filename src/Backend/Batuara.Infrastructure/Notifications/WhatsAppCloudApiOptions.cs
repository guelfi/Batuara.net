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
        public string AppSecret { get; set; } = string.Empty;
        public string AuthTemplateName { get; set; } = "casa_login_code";
        public bool AuthTemplateHasCopyButton { get; set; } = true;
        public string ContributionReminderTemplateName { get; set; } = "casa_contribution_reminder";
        public string ContactResponseTemplateName { get; set; } = "casa_contact_reply";
        public string AdminNotificationTemplateName { get; set; } = "casa_pendencias_aviso_v3";
        public string BirthdayTemplateName { get; set; } = "casa_aniversario";
        public string EventInviteTemplateName { get; set; } = "casa_evento_convite";
        public string MemberNoticeTemplateName { get; set; } = "casa_aviso_filho";
        public string SiteTutorialTemplateName { get; set; } = "casa_tutorial_site";
        public string[] AllowedRecipients { get; set; } = [];
    }
}
