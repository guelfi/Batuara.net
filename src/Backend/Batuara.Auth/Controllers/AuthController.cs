using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Batuara.Auth.DTOs;
using Batuara.Auth.Services;

namespace Batuara.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        
        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }
        
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var response = await _authService.LoginAsync(request, ipAddress);
                
                _logger.LogInformation("User logged in: {Email}", request.Email);
                
                return Ok(new
                {
                    success = true,
                    data = response,
                    message = "Login successful"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Login failed: {Message}", ex.Message);
                
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred during login"
                });
            }
        }
        
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var response = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress);
                
                _logger.LogInformation("Token refreshed successfully");
                
                return Ok(new
                {
                    success = true,
                    data = response,
                    message = "Token refreshed successfully"
                });
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
                
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred during token refresh"
                });
            }
        }
        
        [HttpPost("revoke")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Revoke([FromBody] RevokeTokenRequestDto request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                await _authService.RevokeTokenAsync(request.RefreshToken, ipAddress);
                
                _logger.LogInformation("Token revoked successfully");
                
                return Ok(new
                {
                    success = true,
                    message = "Token revoked successfully"
                });
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning("Token revocation failed: {Message}", ex.Message);
                
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token revocation");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred during token revocation"
                });
            }
        }
        
        [HttpGet("verify")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Verify()
        {
            // If we get here, the token is valid (due to [Authorize] attribute)
            return Ok(new
            {
                success = true,
                message = "Token is valid"
            });
        }
        
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUser([FromServices] IUserService userService)
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var id))
                {
                    _logger.LogWarning("Invalid user ID in token");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Invalid token"
                    });
                }
                
                var user = await userService.GetByIdAsync(id);
                
                if (user == null)
                {
                    _logger.LogWarning("User not found: {Id}", id);
                    return NotFound(new
                    {
                        success = false,
                        message = "User not found"
                    });
                }
                
                return Ok(new
                {
                    success = true,
                    data = user,
                    message = "User retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while retrieving user information"
                });
            }
        }
    }
}