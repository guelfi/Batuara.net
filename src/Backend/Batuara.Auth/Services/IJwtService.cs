using System.Security.Claims;
using Batuara.Auth.Models;

namespace Batuara.Auth.Services
{
    public interface IJwtService
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        DateTime GetRefreshTokenExpiryTime();
    }
}