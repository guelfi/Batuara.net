using System.Security.Cryptography;
using System.Text;

namespace Batuara.Auth.Services
{
    public class CsrfService : ICsrfService
    {
        private const int TokenLength = 32;
        
        public string GenerateCsrfToken()
        {
            // Generate a cryptographically secure random token
            var randomNumber = new byte[TokenLength];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            
            // Convert to base64 string
            return Convert.ToBase64String(randomNumber);
        }
        
        public bool ValidateCsrfToken(string token, string storedToken)
        {
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(storedToken))
                return false;
                
            // Compare the hashed values to prevent timing attacks
            var tokenHash = HashToken(token);
            var storedTokenHash = HashToken(storedToken);
            
            return CryptographicEquals(tokenHash, storedTokenHash);
        }
        
        public string HashToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return string.Empty;
                
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
                return Convert.ToBase64String(hashedBytes);
            }
        }
        
        // Constant-time comparison to prevent timing attacks
        private static bool CryptographicEquals(string a, string b)
        {
            if (a == null || b == null || a.Length != b.Length)
                return false;
                
            var aBytes = Encoding.UTF8.GetBytes(a);
            var bBytes = Encoding.UTF8.GetBytes(b);
            
            // Use a constant-time comparison
            var result = 0;
            for (var i = 0; i < aBytes.Length; i++)
            {
                result |= aBytes[i] ^ bBytes[i];
            }
            
            return result == 0;
        }
    }
}