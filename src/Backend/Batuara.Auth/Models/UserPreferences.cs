using System.ComponentModel.DataAnnotations;

namespace Batuara.Auth.Models
{
    public class UserPreferences
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        // Language preference (e.g., "pt-BR", "en-US")
        public string Language { get; set; } = "pt-BR";
        
        // Theme preference (e.g., "light", "dark")
        public string Theme { get; set; } = "light";
        
        // Timezone preference
        public string TimeZone { get; set; } = "America/Sao_Paulo";
        
        // Notification preferences
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;
        
        // Dashboard preferences
        public int ItemsPerPage { get; set; } = 10;
        public bool ShowHelpTooltips { get; set; } = true;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User? User { get; set; }
    }
}