using System.ComponentModel.DataAnnotations;

namespace Batuara.Auth.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        public DateTime? LastLoginAt { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public List<UserActivity> Activities { get; set; } = new List<UserActivity>();
        public UserPreferences? Preferences { get; set; }
        
        public void RecordLogin()
        {
            LastLoginAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void AddRefreshToken(string token, DateTime expiresAt, string createdByIp)
        {
            RefreshTokens.Add(new RefreshToken
            {
                Token = token,
                ExpiresAt = expiresAt,
                CreatedByIp = createdByIp,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = Id
            });
            
            UpdatedAt = DateTime.UtcNow;
        }
        
        public void RevokeRefreshToken(string token, string revokedByIp, string? replacedByToken = null)
        {
            var refreshToken = RefreshTokens.SingleOrDefault(r => r.Token == token && !r.IsRevoked);
            
            if (refreshToken == null)
                return;
                
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = revokedByIp;
            refreshToken.ReplacedByToken = replacedByToken;
            refreshToken.UpdatedAt = DateTime.UtcNow;
            
            UpdatedAt = DateTime.UtcNow;
        }
        
        public RefreshToken? GetActiveRefreshToken()
        {
            return RefreshTokens.SingleOrDefault(r => !r.IsRevoked && !r.IsExpired);
        }
        
        public void AddActivity(string action, string entityType, string? entityId = null, string? ipAddress = null, string? userAgent = null, string? details = null)
        {
            Activities.Add(new UserActivity
            {
                UserId = Id,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                IpAddress = ipAddress ?? "unknown",
                UserAgent = userAgent,
                Details = details,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}