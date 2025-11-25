using System.Security.Cryptography;
using System.Text;

namespace Batuara.Auth.Services
{
    public interface ICsrfService
    {
        string GenerateCsrfToken();
        bool ValidateCsrfToken(string token, string storedToken);
        string HashToken(string token);
    }
}