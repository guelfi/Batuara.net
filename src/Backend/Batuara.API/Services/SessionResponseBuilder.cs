using Batuara.Application.Auth.Models;
using Batuara.Application.MemberAuth.Models;

namespace Batuara.API.Services
{
    /// <summary>
    /// Monta o corpo JSON de login/refresh. Tokens so vao no corpo quando explicitamente habilitado
    /// (ferramentas de API em desenvolvimento); caso contrario ficam apenas nos cookies httpOnly.
    /// </summary>
    public static class SessionResponseBuilder
    {
        public static object ForUser(LoginResponse response, bool returnTokensInBody) =>
            returnTokensInBody
                ? new
                {
                    token = response.AccessToken,
                    refreshToken = response.RefreshToken,
                    expiresAt = response.TokenExpiration,
                    user = response.User
                }
                : new
                {
                    expiresAt = response.TokenExpiration,
                    user = response.User
                };

        public static object ForMember(MemberLoginResponse response, bool returnTokensInBody) =>
            returnTokensInBody
                ? new { token = response.Token, expiresAt = response.ExpiresAt, user = response.User }
                : new { expiresAt = response.ExpiresAt, user = response.User };
    }
}
