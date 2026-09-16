using Batuara.Application.Auth.Models;
using Microsoft.Extensions.Options;

namespace Batuara.API.Services
{
    public class AuthCookieService : IAuthCookieService
    {
        private readonly AuthCookieSettings _settings;
        private readonly IHostEnvironment _environment;

        public AuthCookieService(IOptions<AuthCookieSettings> settings, IHostEnvironment environment)
        {
            _settings = settings.Value;
            _environment = environment;
        }

        public string AccessTokenCookieName => _settings.AccessTokenCookieName;
        public string RefreshTokenCookieName => _settings.RefreshTokenCookieName;

        public void SetAccessToken(HttpResponse response, string token, DateTime expiresAtUtc)
        {
            response.Cookies.Append(
                _settings.AccessTokenCookieName,
                token,
                BuildCookieOptions(expiresAtUtc));
        }

        public void SetRefreshToken(HttpResponse response, string token)
        {
            var expires = DateTime.UtcNow.AddDays(_settings.RefreshTokenDays > 0 ? _settings.RefreshTokenDays : 7);
            response.Cookies.Append(
                _settings.RefreshTokenCookieName,
                token,
                BuildCookieOptions(expires));
        }

        public void ClearAuthCookies(HttpResponse response)
        {
            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = IsSecureCookie(),
                SameSite = ParseSameSite(_settings.SameSite),
                Path = string.IsNullOrWhiteSpace(_settings.Path) ? "/" : _settings.Path
            };

            response.Cookies.Delete(_settings.AccessTokenCookieName, options);
            response.Cookies.Delete(_settings.RefreshTokenCookieName, options);

            if (!string.IsNullOrWhiteSpace(_settings.LegacyRefreshTokenCookieName)
                && !string.Equals(_settings.LegacyRefreshTokenCookieName, _settings.RefreshTokenCookieName, StringComparison.Ordinal))
            {
                response.Cookies.Delete(_settings.LegacyRefreshTokenCookieName, options);
            }
        }

        public string? GetRefreshToken(HttpRequest request)
        {
            if (request.Cookies.TryGetValue(_settings.RefreshTokenCookieName, out var token)
                && !string.IsNullOrWhiteSpace(token))
            {
                return token;
            }

            if (!string.IsNullOrWhiteSpace(_settings.LegacyRefreshTokenCookieName)
                && request.Cookies.TryGetValue(_settings.LegacyRefreshTokenCookieName, out var legacy)
                && !string.IsNullOrWhiteSpace(legacy))
            {
                return legacy;
            }

            return null;
        }

        private CookieOptions BuildCookieOptions(DateTime expiresAtUtc)
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = IsSecureCookie(),
                SameSite = ParseSameSite(_settings.SameSite),
                Path = string.IsNullOrWhiteSpace(_settings.Path) ? "/" : _settings.Path,
                Expires = expiresAtUtc,
                IsEssential = true
            };
        }

        private bool IsSecureCookie()
        {
            // Local HTTP (Development) must allow Secure=false so cookies stick on http://127.0.0.1
            if (_environment.IsDevelopment())
            {
                return false;
            }

            return true;
        }

        private static SameSiteMode ParseSameSite(string? value)
        {
            if (string.Equals(value, "Strict", StringComparison.OrdinalIgnoreCase))
            {
                return SameSiteMode.Strict;
            }

            if (string.Equals(value, "None", StringComparison.OrdinalIgnoreCase))
            {
                return SameSiteMode.None;
            }

            return SameSiteMode.Lax;
        }
    }
}
