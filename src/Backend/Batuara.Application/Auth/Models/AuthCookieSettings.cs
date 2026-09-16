namespace Batuara.Application.Auth.Models
{
    public class AuthCookieSettings
    {
        public const string SectionName = "AuthCookieSettings";

        public string AccessTokenCookieName { get; set; } = "batuara_access_token";
        public string RefreshTokenCookieName { get; set; } = "batuara_refresh_token";

        /// <summary>
        /// Previous refresh cookie name, still read (and cleared) for transition.
        /// </summary>
        public string LegacyRefreshTokenCookieName { get; set; } = "refreshToken";

        public string Path { get; set; } = "/";

        /// <summary>
        /// Lax | Strict | None
        /// </summary>
        public string SameSite { get; set; } = "Lax";

        /// <summary>
        /// Refresh cookie lifetime in days. Access cookie uses JWT expiry.
        /// </summary>
        public int RefreshTokenDays { get; set; } = 7;
    }
}
