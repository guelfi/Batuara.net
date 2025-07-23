using System.Text.RegularExpressions;
using Batuara.Application.Auth.Services;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Auth.Services
{
    public class PasswordService : IPasswordService
    {
        private readonly PasswordRequirements _passwordRequirements;

        public PasswordService(IOptions<PasswordRequirements> passwordRequirements)
        {
            _passwordRequirements = passwordRequirements.Value;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }

        public bool ValidatePasswordStrength(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                return false;

            if (password.Length < _passwordRequirements.RequiredLength)
                return false;

            if (_passwordRequirements.RequireDigit && !password.Any(char.IsDigit))
                return false;

            if (_passwordRequirements.RequireLowercase && !password.Any(char.IsLower))
                return false;

            if (_passwordRequirements.RequireUppercase && !password.Any(char.IsUpper))
                return false;

            if (_passwordRequirements.RequireNonAlphanumeric && Regex.IsMatch(password, @"^[a-zA-Z0-9]+$"))
                return false;

            return true;
        }
    }

    public class PasswordRequirements
    {
        public bool RequireDigit { get; set; } = true;
        public bool RequireLowercase { get; set; } = true;
        public bool RequireUppercase { get; set; } = true;
        public bool RequireNonAlphanumeric { get; set; } = true;
        public int RequiredLength { get; set; } = 8;
    }
}