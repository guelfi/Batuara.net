using Batuara.Application.MemberAuth.Models;
using Batuara.Application.MemberAuth.Services;
using Batuara.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/member-auth")]
    public class MemberAuthController : ControllerBase
    {
        private readonly IMemberAuthService _memberAuthService;
        private readonly IAuthCookieService _authCookies;
        private readonly ILogger<MemberAuthController> _logger;

        public MemberAuthController(
            IMemberAuthService memberAuthService,
            IAuthCookieService authCookies,
            ILogger<MemberAuthController> logger)
        {
            _memberAuthService = memberAuthService;
            _authCookies = authCookies;
            _logger = logger;
        }

        [HttpPost("request-code")]
        [EnableRateLimiting("member-login")]
        public async Task<IActionResult> RequestCode([FromBody] MemberRequestCodeRequest request, CancellationToken cancellationToken)
        {
            await _memberAuthService.RequestCodeAsync(request, GetIpAddress(), cancellationToken);
            return Ok(new { success = true, message = "Se o número estiver cadastrado, você receberá um código no WhatsApp." });
        }

        [HttpPost("verify-code")]
        [EnableRateLimiting("member-login")]
        public async Task<IActionResult> VerifyCode([FromBody] MemberVerifyCodeRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _memberAuthService.VerifyCodeAsync(request, cancellationToken);
                _authCookies.SetAccessToken(Response, response.Token, response.ExpiresAt);
                return Ok(new { success = true, data = response });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Member login verification failed");
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        private string? GetIpAddress()
        {
            return Request.Headers.ContainsKey("X-Forwarded-For")
                ? Request.Headers["X-Forwarded-For"].FirstOrDefault()
                : HttpContext.Connection.RemoteIpAddress?.ToString();
        }
    }
}
