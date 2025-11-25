using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Batuara.Auth.Data;
using Batuara.Auth.DTOs;
using Batuara.Auth.Models;
using Microsoft.AspNetCore.Http;

namespace Batuara.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _context;
        private readonly IUserService _userService;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public AuthService(
            AuthDbContext context,
            IUserService userService,
            IPasswordService passwordService,
            IJwtService jwtService,
            ILogger<AuthService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _userService = userService;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }
        
        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, string ipAddress)
        {
            var user = await _userService.GetUserEntityByEmailAsync(request.Email);
            
            if (user == null)
            {
                _logger.LogWarning("Login attempt failed for non-existent user: {Email}", request.Email);
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            
            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt for inactive user: {Email}", request.Email);
                throw new UnauthorizedAccessException("User account is inactive");
            }
            
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login attempt with invalid password for user: {Email}", request.Email);
                throw new UnauthorizedAccessException("Invalid credentials");
            }
            
            // Authentication successful, generate tokens
            var jwtToken = _jwtService.GenerateJwtToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiryTime = _jwtService.GetRefreshTokenExpiryTime();
            
            // Save refresh token
            user.AddRefreshToken(refreshToken, refreshTokenExpiryTime, ipAddress);
            user.RecordLogin();
            
            // Log user activity
            var userAgent = _httpContextAccessor?.HttpContext?.Request?.Headers["User-Agent"].ToString() ?? "Unknown";
            user.AddActivity("Login", "Auth", null, ipAddress, userAgent, "User logged in successfully");
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("User {Email} logged in successfully", user.Email);
            
            return new AuthResponseDto
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                ExpiresAt = refreshTokenExpiryTime,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                }
            };
        }
        
        public async Task<AuthResponseDto> RefreshTokenAsync(string token, string ipAddress)
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(r => r.Token == token);
                
            if (refreshToken == null)
            {
                _logger.LogWarning("Refresh token not found: {Token}", token);
                throw new SecurityTokenException("Invalid refresh token");
            }
            
            if (!refreshToken.IsActive)
            {
                _logger.LogWarning("Inactive refresh token used: {Token}", token);
                throw new SecurityTokenException("Invalid refresh token");
            }
            
            var user = refreshToken.User;
            if (user == null)
            {
                _logger.LogWarning("Refresh token has no associated user: {Token}", token);
                throw new SecurityTokenException("Invalid refresh token");
            }
            
            if (!user.IsActive)
            {
                _logger.LogWarning("Refresh token used for inactive user: {Email}", user.Email);
                throw new UnauthorizedAccessException("User account is inactive");
            }
            
            // Revoke the current refresh token
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReasonRevoked = "Replaced by new token";
            
            // Generate new tokens
            var newJwtToken = _jwtService.GenerateJwtToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiryTime = _jwtService.GetRefreshTokenExpiryTime();
            
            // Save new refresh token
            user.AddRefreshToken(newRefreshToken, refreshTokenExpiryTime, ipAddress);
            
            // Log user activity
            var userAgent = _httpContextAccessor?.HttpContext?.Request?.Headers["User-Agent"].ToString() ?? "Unknown";
            user.AddActivity("Token Refresh", "Auth", null, ipAddress, userAgent, "User token refreshed successfully");
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Refresh token rotated for user {Email}", user.Email);
            
            return new AuthResponseDto
            {
                Token = newJwtToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = refreshTokenExpiryTime,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    LastLoginAt = user.LastLoginAt,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                }
            };
        }
        
        public async Task RevokeTokenAsync(string token, string ipAddress)
        {
            var refreshToken = await _context.RefreshTokens
                .Include(r => r.User)
                .SingleOrDefaultAsync(r => r.Token == token);
                
            if (refreshToken == null)
            {
                _logger.LogWarning("Attempt to revoke non-existent token: {Token}", token);
                throw new SecurityTokenException("Invalid refresh token");
            }
            
            if (!refreshToken.IsActive)
            {
                _logger.LogWarning("Attempt to revoke already inactive token: {Token}", token);
                return;
            }
            
            // Revoke the token
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = ipAddress;
            refreshToken.ReasonRevoked = "Revoked without replacement";
            
            // Log user activity
            var userAgent = _httpContextAccessor?.HttpContext?.Request?.Headers["User-Agent"].ToString() ?? "Unknown";
            refreshToken.User?.AddActivity("Token Revoke", "Auth", null, ipAddress, userAgent, "User token revoked successfully");
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Token revoked: {Token}", token);
        }
        
        public async Task<bool> ValidateTokenAsync(string token)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(token);
            
            if (principal == null)
            {
                _logger.LogWarning("Token validation failed: invalid token format");
                return false;
            }
            
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                _logger.LogWarning("Token validation failed: missing or invalid user ID claim");
                return false;
            }
            
            var user = await _userService.GetUserEntityByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Token validation failed: user not found or inactive");
                return false;
            }
            
            return true;
        }
    }
}