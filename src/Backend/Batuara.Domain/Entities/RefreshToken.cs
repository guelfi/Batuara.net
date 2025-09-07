using System;
using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; private set; }
        public required string CreatedByIp { get; set; }
        public DateTime? RevokedAt { get; private set; }
        public string? RevokedByIp { get; private set; }
        public string? ReplacedByToken { get; private set; }
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public new bool IsActive => !IsRevoked && !IsExpired;
        
        // Propriedade de navegação para EF Core
        public int UserId { get; private set; }
        
        // Para EF Core
        private RefreshToken() { }

        public RefreshToken(string token, DateTime expiresAt, string createdByIp)
        {
            Token = token ?? throw new ArgumentNullException(nameof(token));
            ExpiresAt = expiresAt;
            CreatedByIp = createdByIp ?? throw new ArgumentNullException(nameof(createdByIp));
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Revoke(string revokedByIp, string? replacedByToken = null)
        {
            RevokedAt = DateTime.UtcNow;
            RevokedByIp = revokedByIp;
            ReplacedByToken = replacedByToken;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}