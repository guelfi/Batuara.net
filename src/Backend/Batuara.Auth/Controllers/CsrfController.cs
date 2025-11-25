using Microsoft.AspNetCore.Mvc;
using Batuara.Auth.Services;

namespace Batuara.Auth.Controllers
{
    [ApiController]
    [Route("api/csrf")]
    public class CsrfController : ControllerBase
    {
        private readonly ICsrfService _csrfService;
        private readonly ILogger<CsrfController> _logger;

        public CsrfController(ICsrfService csrfService, ILogger<CsrfController> logger)
        {
            _csrfService = csrfService;
            _logger = logger;
        }

        [HttpGet("token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetCsrfToken()
        {
            try
            {
                var token = _csrfService.GenerateCsrfToken();
                
                // Store the token in session (in a real app, you'd use a more secure storage)
                HttpContext.Session.SetString("CSRF-TOKEN", token);
                
                // Also set as a cookie for client-side access
                Response.Cookies.Append("XSRF-TOKEN", token, new CookieOptions
                {
                    HttpOnly = false, // Allow client-side JavaScript access
                    Secure = true,    // Only send over HTTPS
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddHours(1)
                });
                
                return Ok(new
                {
                    success = true,
                    data = new { token },
                    message = "CSRF token generated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CSRF token");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while generating CSRF token"
                });
            }
        }
    }
}