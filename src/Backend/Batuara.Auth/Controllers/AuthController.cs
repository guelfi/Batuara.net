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
        
        [HttpPut("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserDto userDto, [FromServices] IUserService userService)
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
                
                // Only allow updating name and email for the current user
                var updateDto = new UpdateUserDto
                {
                    Name = userDto.Name,
                    Email = userDto.Email
                    // Role and IsActive are not allowed to be updated by the user themselves
                };
                
                var user = await userService.UpdateAsync(id, updateDto);
                
                return Ok(new
                {
                    success = true,
                    data = user,
                    message = "User updated successfully"
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new
                {
                    success = false,
                    message = "User not found"
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid operation: {Message}", ex.Message);
                
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating current user");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while updating user information"
                });
            }
        }
        
        [HttpPut("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto, [FromServices] IUserService userService)
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
                
                var result = await userService.ChangePasswordAsync(id, passwordDto);
                
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User not found"
                    });
                }
                
                return Ok(new
                {
                    success = true,
                    message = "Password changed successfully"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized: {Message}", ex.Message);
                
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Invalid operation: {Message}", ex.Message);
                
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while changing the password"
                });
            }
        }
        
        [HttpGet("activities")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<UserActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserActivities(
            [FromServices] IUserService userService,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
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
                
                // Ensure pageSize is within reasonable limits
                pageSize = Math.Max(1, Math.Min(pageSize, 100));
                
                var activities = await userService.GetUserActivitiesAsync(id, pageNumber, pageSize);
                var totalCount = await userService.GetUserActivitiesCountAsync(id);
                
                return Ok(new
                {
                    success = true,
                    data = activities,
                    pagination = new
                    {
                        currentPage = pageNumber,
                        pageSize = pageSize,
                        totalCount = totalCount,
                        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                    },
                    message = "User activities retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user activities");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while retrieving user activities"
                });
            }
        }
        
        [HttpGet("preferences")]
        [Authorize]
        [ProducesResponseType(typeof(UserPreferencesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserPreferences([FromServices] IUserService userService)
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
                
                var preferences = await userService.GetUserPreferencesAsync(id);
                
                // If no preferences exist, return default preferences
                if (preferences == null)
                {
                    return Ok(new
                    {
                        success = true,
                        data = new UserPreferencesDto(),
                        message = "Default preferences returned"
                    });
                }
                
                return Ok(new
                {
                    success = true,
                    data = preferences,
                    message = "User preferences retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user preferences");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while retrieving user preferences"
                });
            }
        }
        
        [HttpPut("preferences")]
        [Authorize]
        [ProducesResponseType(typeof(UserPreferencesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateUserPreferences([FromBody] UpdateUserPreferencesDto preferencesDto, [FromServices] IUserService userService)
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
                
                var preferences = await userService.CreateOrUpdateUserPreferencesAsync(id, preferencesDto);
                
                return Ok(new
                {
                    success = true,
                    data = preferences,
                    message = "User preferences updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user preferences");
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "An error occurred while updating user preferences"
                });
            }
        }
    }
}