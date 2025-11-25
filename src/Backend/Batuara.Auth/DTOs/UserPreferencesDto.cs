namespace Batuara.Auth.DTOs
{
    public class UserPreferencesDto
    {
        public int Id { get; set; }
        public string Language { get; set; } = "pt-BR";
        public string Theme { get; set; } = "light";
        public string TimeZone { get; set; } = "America/Sao_Paulo";
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;
        public int ItemsPerPage { get; set; } = 10;
        public bool ShowHelpTooltips { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class UpdateUserPreferencesDto
    {
        public string? Language { get; set; }
        public string? Theme { get; set; }
        public string? TimeZone { get; set; }
        public bool? EmailNotifications { get; set; }
        public bool? PushNotifications { get; set; }
        public bool? SmsNotifications { get; set; }
        public int? ItemsPerPage { get; set; }
        public bool? ShowHelpTooltips { get; set; }
    }
}