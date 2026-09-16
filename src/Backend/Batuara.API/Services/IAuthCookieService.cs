namespace Batuara.API.Services
{
    public interface IAuthCookieService
    {
        string AccessTokenCookieName { get; }
        string RefreshTokenCookieName { get; }

        void SetAccessToken(HttpResponse response, string token, DateTime expiresAtUtc);
        void SetRefreshToken(HttpResponse response, string token);
        void ClearAuthCookies(HttpResponse response);
        string? GetRefreshToken(HttpRequest request);
    }
}
