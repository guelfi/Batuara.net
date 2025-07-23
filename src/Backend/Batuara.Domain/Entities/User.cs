using System;
using System.Collections.Generic;
using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; private set; }
        public string PasswordHash { get; private set; }
        public string Name { get; private set; }
        public UserRole Role { get; private set; }
        public new bool IsActive { get; private set; }
        public DateTime? LastLoginAt { get; private set; }
        public List<RefreshToken> RefreshTokens { get; private set; } = new List<RefreshToken>();

        // Para EF Core
        private User() { }

        public User(string email, string passwordHash, string name, UserRole role)
        {
            Email = email ?? throw new ArgumentNullException(nameof(email));
            PasswordHash = passwordHash ?? throw new ArgumentNullException(nameof(passwordHash));
            Name = name ?? throw new ArgumentNullException(nameof(name));
            Role = role;
            IsActive = true;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty", nameof(name));

            Name = name;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be empty", nameof(email));

            Email = email;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdatePassword(string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new ArgumentException("Password hash cannot be empty", nameof(passwordHash));

            PasswordHash = passwordHash;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateRole(UserRole role)
        {
            Role = role;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetActive(bool isActive)
        {
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;
        }

        public void RecordLogin()
        {
            LastLoginAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddRefreshToken(string token, DateTime expiresAt, string createdByIp)
        {
            RefreshTokens.Add(new RefreshToken(token, expiresAt, createdByIp));
            UpdatedAt = DateTime.UtcNow;
        }

        public void RevokeRefreshToken(string token, string revokedByIp, string? replacedByToken = null)
        {
            var refreshToken = RefreshTokens.Find(r => r.Token == token && !r.IsRevoked);
            
            if (refreshToken == null)
                return;

            refreshToken.Revoke(revokedByIp, replacedByToken);
            UpdatedAt = DateTime.UtcNow;
        }

        public RefreshToken? GetActiveRefreshToken()
        {
            return RefreshTokens.Find(r => !r.IsRevoked && r.ExpiresAt > DateTime.UtcNow);
        }
    }
}