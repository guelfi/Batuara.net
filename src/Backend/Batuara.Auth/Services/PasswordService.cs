using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using Batuara.Auth.Models;

namespace Batuara.Auth.Services
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
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }
        
        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        
        public bool ValidatePasswordStrength(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return false;
            }
            
            if (password.Length < _passwordRequirements.RequiredLength)
            {
                return false;
            }
            
            if (_passwordRequirements.RequireDigit && !password.Any(char.IsDigit))
            {
                return false;
            }
            
            if (_passwordRequirements.RequireLowercase && !password.Any(char.IsLower))
            {
                return false;
            }
            
            if (_passwordRequirements.RequireUppercase && !password.Any(char.IsUpper))
            {
                return false;
            }
            
            if (_passwordRequirements.RequireNonAlphanumeric && Regex.IsMatch(password, @"^[a-zA-Z0-9]+$"))
            {
                return false;
            }
            
            return true;
        }
    }
}