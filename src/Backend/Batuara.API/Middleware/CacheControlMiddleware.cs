namespace Batuara.API.Middleware
{
    /// <summary>
    /// Middleware que emite headers Cache-Control apropriados por tipo de rota.
    /// Garante que o Cloudflare e os browsers não cacheiem dados desatualizados
    /// após mudanças realizadas no AdminDashboard.
    ///
    /// Estratégia:
    ///   - Rotas /admin/*          → no-store (nunca cachear dados administrativos)
    ///   - Rotas /public/events, /public/calendar/* → no-cache (sempre revalidar com origem)
    ///   - Rotas /public/orixas, /public/guides, etc. → max-age=300 (cache de 5 min)
    ///   - Site settings           → no-cache (muda com edição no Admin)
    /// </summary>
    public class CacheControlMiddleware
    {
        private readonly RequestDelegate _next;

        // Rotas públicas dinâmicas: sempre revalidar — mudam frequentemente via Admin
        private static readonly string[] NoCacheRoutes =
        [
            "/api/public/events",
            "/api/public/calendar",
            "/api/site-settings",
            "/api/public/contact-messages",
        ];

        // Rotas públicas semi-estáticas: cache de 5 minutos
        private static readonly string[] ShortCacheRoutes =
        [
            "/api/public/orixas",
            "/api/public/guides",
            "/api/public/umbanda-lines",
            "/api/public/spiritual-contents",
        ];

        public CacheControlMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

            // Rotas administrativas: nunca cachear
            if (path.StartsWith("/api/admin") || path.StartsWith("/api/auth"))
            {
                context.Response.Headers["Cache-Control"] = "no-store, private";
            }
            // Rotas públicas dinâmicas: sempre revalidar com o servidor
            else if (NoCacheRoutes.Any(r => path.StartsWith(r)))
            {
                context.Response.Headers["Cache-Control"] = "no-cache, must-revalidate";
                context.Response.Headers["Pragma"] = "no-cache";
            }
            // Rotas públicas semi-estáticas: cache curto (5 min)
            else if (ShortCacheRoutes.Any(r => path.StartsWith(r)))
            {
                context.Response.Headers["Cache-Control"] = "public, max-age=300, must-revalidate";
            }

            await _next(context);
        }
    }
}
