namespace Batuara.API.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public SecurityHeadersMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var allowedOrigins = _configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
            var apiUrl = _configuration["ApiUrl"] ?? "http://api.batuara.net";

            context.Response.Headers["X-Frame-Options"] = "DENY";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            context.Response.Headers["Permissions-Policy"] = "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(self), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()";

            var csp = new List<string>
            {
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                $"connect-src 'self' {apiUrl} https://batuara.net https://admin.batuara.net",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            };

            if (allowedOrigins.Length > 0)
            {
                csp.Add($"frame-src 'none'");
            }

            context.Response.Headers["Content-Security-Policy"] = string.Join("; ", csp);

            await _next(context);
        }
    }
}
