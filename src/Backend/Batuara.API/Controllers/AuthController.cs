using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Batuara.Application.Auth.Models;
using Batuara.Application.Auth.Services;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Batuara.API.Controllers
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
        [EnableRateLimiting("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var ipAddress = GetIpAddress();
                var response = await _authService.LoginAsync(request, ipAddress);
                
                // Set refresh token in cookie
                SetRefreshTokenCookie(response.RefreshToken);
                
                // Return in the format expected by frontend
                return Ok(new 
                {
                    success = true,
                    data = new 
                    {
                        token = response.AccessToken,
                        refreshToken = response.RefreshToken,
                        expiresAt = response.TokenExpiration,
                        user = response.User
                    }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Login failed: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                _logger.LogError(ex, "Database unavailable during login");
                return StatusCode(503, new { success = false, message = "Banco de dados indisponível" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { success = false, message = "An error occurred during login" });
            }
        }

        [HttpPost("refresh")]
        [EnableRateLimiting("refresh")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? request)
        {
            try
            {
                var refreshToken = request?.RefreshToken;
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    refreshToken = Request.Cookies["refreshToken"];
                }

                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    refreshToken = Request.Headers["X-Refresh-Token"].FirstOrDefault();
                }

                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return Unauthorized(new { success = false, message = "Refresh token is required" });
                }

                var ipAddress = GetIpAddress();
                var response = await _authService.RefreshTokenAsync(refreshToken, ipAddress);
                
                // Set new refresh token in cookie
                SetRefreshTokenCookie(response.RefreshToken);
                
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        token = response.AccessToken,
                        refreshToken = response.RefreshToken,
                        expiresAt = response.TokenExpiration,
                        user = response.User
                    }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Token refresh failed: {Message}", ex.Message);
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex) when (IsDatabaseUnavailable(ex))
            {
                _logger.LogError(ex, "Database unavailable during token refresh");
                return StatusCode(503, new { success = false, message = "Banco de dados indisponível" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, new { success = false, message = "An error occurred during token refresh" });
            }
        }

        private static bool IsDatabaseUnavailable(Exception ex)
        {
            var current = ex;
            while (current != null)
            {
                var typeName = current.GetType().FullName ?? string.Empty;
                if (typeName.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) ||
                    typeName.Contains("Postgres", StringComparison.OrdinalIgnoreCase) ||
                    typeName.Contains("DbUpdateException", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                current = current.InnerException;
            }

            return false;
        }

        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    var ipAddress = GetIpAddress();
                    try
                    {
                        await _authService.RevokeTokenAsync(refreshToken, ipAddress);
                    }
                    catch (UnauthorizedAccessException ex)
                    {
                        _logger.LogWarning(ex, "Logout requested with invalid refresh token");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error revoking refresh token during logout");
                    }
                }

                // Clear refresh token cookie
                Response.Cookies.Delete("refreshToken");
                
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "An error occurred during logout" });
            }
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                var user = await _authService.RegisterUserAsync(request);
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("register-first-admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<UserDto>> RegisterFirstAdmin([FromBody] RegisterUserRequest request)
        {
            try
            {
                var user = await _authService.RegisterFirstAdminAsync(request);
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var id))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _authService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt,
                    CreatedAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, new { message = "An error occurred while retrieving user information" });
            }
        }

        [HttpGet("users/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetUserById(int id)
        {
            try
            {
                var user = await _authService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt,
                    CreatedAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID {UserId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving user information" });
            }
        }

        [HttpPut("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserDto>> UpdateCurrentUser([FromBody] UpdateUserRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { success = false, message = "Invalid token" });

                var user = await _authService.UpdateUserProfileAsync(userId.Value, request);
                return Ok(new { success = true, data = user });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, new { success = false, message = "An error occurred while updating profile" });
            }
        }

        [HttpPut("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                    return Unauthorized(new { success = false, message = "Invalid token" });

                var result = await _authService.ChangePasswordAsync(userId.Value, request);
                if (!result)
                    return NotFound(new { success = false, message = "User not found" });

                return Ok(new { success = true, message = "Password changed successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, new { success = false, message = "An error occurred while changing password" });
            }
        }

        [HttpGet("verify")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult VerifyToken()
        {
            return Ok(new { message = "Token is valid", user = new { id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value } });
        }

        private int? GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var id))
                return null;
            return id;
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"].ToString() ?? "unknown";
            else
                return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "unknown";
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}
