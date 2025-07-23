using System.Security.Claims;
using Batuara.Domain.Entities;

namespace Batuara.Application.Auth.Services
{
    public interface IJwtService
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromToken(string token);
        DateTime GetTokenExpirationTime(string token);
        bool ValidateToken(string token);
    }
}