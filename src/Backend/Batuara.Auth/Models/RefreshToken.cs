using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Batuara.Auth.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public int UserId { get; set; }
        
        [JsonIgnore]
        public User? User { get; set; }
        
        [Required]
        public DateTime ExpiresAt { get; set; }
        
        [Required]
        public string CreatedByIp { get; set; } = string.Empty;
        
        public DateTime? RevokedAt { get; set; }
        
        public string? RevokedByIp { get; set; }
        
        public string? ReplacedByToken { get; set; }
        
        public string? ReasonRevoked { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        
        public bool IsRevoked => RevokedAt != null;
        
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}