using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Batuara.API.Services
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetDisplayName(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Name)?.Value
               ?? user.FindFirst(ClaimTypes.Email)?.Value
               ?? user.Identity?.Name
               ?? "Sistema";

        public static string? GetUserIdValue(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
               ?? user.FindFirst("houseMemberId")?.Value;
    }
}
