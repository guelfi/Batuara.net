using System.ComponentModel.DataAnnotations;

namespace Batuara.Auth.Models
{
    public class UserActivity
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public string Action { get; set; } = string.Empty;
        
        [Required]
        public string EntityType { get; set; } = string.Empty;
        
        public string? EntityId { get; set; }
        
        [Required]
        public string IpAddress { get; set; } = string.Empty;
        
        public string? UserAgent { get; set; }
        
        public string? Details { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User? User { get; set; }
    }
}