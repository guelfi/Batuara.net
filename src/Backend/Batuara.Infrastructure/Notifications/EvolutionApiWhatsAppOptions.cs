namespace Batuara.Infrastructure.Notifications
{
    public class EvolutionApiWhatsAppOptions
    {
        public string Provider { get; set; } = "EvolutionApi";
        public bool Enabled { get; set; }
        public string BaseUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public string InstanceName { get; set; } = "batuara-casa";
        public string[] AllowedRecipients { get; set; } = [];
    }
}
