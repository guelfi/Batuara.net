using Microsoft.AspNetCore.Http;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Batuara.Auth.Services;

namespace Batuara.Auth.Middleware
{
    public class CsrfMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ICsrfService _csrfService;
        private readonly ILogger<CsrfMiddleware> _logger;
        
        // Paths that should be exempt from CSRF protection (e.g., login, refresh token)
        private readonly HashSet<string> _exemptPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/verify"
        };
        
        // HTTP methods that require CSRF protection
        private readonly HashSet<string> _protectedMethods = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        };

        public CsrfMiddleware(RequestDelegate next, ICsrfService csrfService, ILogger<CsrfMiddleware> logger)
        {
            _next = next;
            _csrfService = csrfService;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            var method = context.Request.Method;
            
            // Skip CSRF validation for exempt paths or safe HTTP methods
            if (_exemptPaths.Contains(path) || !_protectedMethods.Contains(method))
            {
                await _next(context);
                return;
            }
            
            // Validate CSRF token for protected requests
            if (!ValidateCsrfToken(context))
            {
                _logger.LogWarning("CSRF token validation failed for request: {Method} {Path}", method, path);
                
                var response = new
                {
                    success = false,
                    message = "CSRF token validation failed"
                };
                
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                context.Response.ContentType = "application/json";
                
                var jsonResponse = JsonSerializer.Serialize(response);
                await context.Response.WriteAsync(jsonResponse);
                return;
            }
            
            await _next(context);
        }

        private bool ValidateCsrfToken(HttpContext context)
        {
            // Try to get token from header
            var headerToken = context.Request.Headers["X-CSRF-TOKEN"].FirstOrDefault();
            
            // Try to get token from form data
            var formToken = context.Request.Form["_csrf"].FirstOrDefault();
            
            // Try to get token from cookies
            var cookieToken = context.Request.Cookies["XSRF-TOKEN"];
            
            // Use the first available token
            var requestToken = headerToken ?? formToken ?? cookieToken;
            
            // Get stored token from session or user context
            var storedToken = context.Session.GetString("CSRF-TOKEN");
            
            // If we don't have a stored token, this might be the first request
            if (string.IsNullOrEmpty(storedToken))
            {
                return true; // Allow first request, but ideally we should set a token
            }
            
            // Validate the token
            return _csrfService.ValidateCsrfToken(requestToken, storedToken);
        }
    }
}