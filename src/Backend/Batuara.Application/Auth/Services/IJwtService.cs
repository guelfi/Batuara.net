using System.Security.Claims;
using Batuara.Domain.Entities;

namespace Batuara.Application.Auth.Services
{
    public interface IJwtService
    {
        string GenerateJwtToken(User user);
        string GenerateMemberJwtToken(int houseMemberId, string fullName, string? mobilePhone);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromToken(string token);
        DateTime GetTokenExpirationTime(string token);
        bool ValidateToken(string token);
    }
}
