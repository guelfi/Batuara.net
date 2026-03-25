using Serilog.Core;
using Serilog.Events;
using System.Security.Claims;

namespace Batuara.API.Middleware
{
    public class RequestEnricher : ILogEventEnricher
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RequestEnricher(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            var context = _httpContextAccessor.HttpContext;

            if (context == null) return;

            var requestId = context.TraceIdentifier;
            if (!string.IsNullOrEmpty(requestId))
            {
                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("RequestId", requestId));
            }

            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? context.User?.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("UserId", userId));
            }

            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            if (!string.IsNullOrEmpty(ipAddress))
            {
                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("ClientIP", ipAddress));
            }

            var userAgent = context.Request.Headers.UserAgent.ToString();
            if (!string.IsNullOrEmpty(userAgent))
            {
                logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("UserAgent", userAgent));
            }

            var endpoint = context.Request.Path.ToString();
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("Endpoint", endpoint));

            var method = context.Request.Method;
            logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("HttpMethod", method));
        }
    }
}
