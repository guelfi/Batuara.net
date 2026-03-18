using System.Security.Claims;
using AutoMapper;
using Batuara.Application.Auth.Models;
using Batuara.Application.Auth.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IPasswordService _passwordService;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IPasswordService passwordService,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _passwordService = passwordService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress)
        {
            _logger.LogInformation("Login attempt for user: {Email} from IP: {IpAddress}", request.Email, ipAddress);
            
            var user = await _userRepository.GetByEmailAsync(request.Email);
            
            if (user == null)
            {
                _logger.LogWarning("Login attempt failed for non-existent user: {Email} from IP: {IpAddress}", request.Email, ipAddress);
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            _logger.LogDebug("User found: {Email}, IsActive: {IsActive}, Role: {Role}", user.Email, user.IsActive, user.Role);

            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt for inactive user: {Email} from IP: {IpAddress}", request.Email, ipAddress);
                throw new UnauthorizedAccessException("User account is inactive");
            }

            _logger.LogDebug("Verifying password for user: {Email}", request.Email);
            var passwordValid = _passwordService.VerifyPassword(request.Password, user.PasswordHash);
            _logger.LogDebug("Password verification result for user {Email}: {IsValid}", request.Email, passwordValid);

            if (!passwordValid)
            {
                _logger.LogWarning("Login attempt with invalid password for user: {Email} from IP: {IpAddress}", request.Email, ipAddress);
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            // Generate JWT token
            _logger.LogDebug("Generating JWT token for user: {Email}", user.Email);
            var jwtToken = _jwtService.GenerateJwtToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpiration = _jwtService.GetTokenExpirationTime(jwtToken);

            _logger.LogDebug("JWT token generated for user: {Email}, expires at: {Expiration}", user.Email, tokenExpiration);

            // Save refresh token
            user.AddRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7), ipAddress);
            user.RecordLogin();
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {Email} logged in successfully from IP: {IpAddress}", user.Email, ipAddress);

            return new LoginResponse
            {
                AccessToken = jwtToken,
                RefreshToken = refreshToken,
                TokenExpiration = tokenExpiration,
                User = _mapper.Map<UserDto>(user)
            };
        }

        public async Task<LoginResponse> RefreshTokenAsync(string refreshToken, string ipAddress)
        {
            var user = await GetUserByRefreshTokenAsync(refreshToken);
            var activeRefreshToken = user.RefreshTokens.Single(r => r.Token == refreshToken);

            // Revoke the current refresh token
            user.RevokeRefreshToken(refreshToken, ipAddress);

            // Generate new tokens
            var newJwtToken = _jwtService.GenerateJwtToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpiration = _jwtService.GetTokenExpirationTime(newJwtToken);

            // Save new refresh token
            user.AddRefreshToken(newRefreshToken, DateTime.UtcNow.AddDays(7), ipAddress);
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Refresh token rotated for user {Email}", user.Email);

            return new LoginResponse
            {
                AccessToken = newJwtToken,
                RefreshToken = newRefreshToken,
                TokenExpiration = tokenExpiration,
                User = _mapper.Map<UserDto>(user)
            };
        }

        public async Task<bool> RevokeTokenAsync(string token, string ipAddress)
        {
            var user = await GetUserByRefreshTokenAsync(token);
            
            // Revoke token
            user.RevokeRefreshToken(token, ipAddress);
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Refresh token revoked for user {Email}", user.Email);
            return true;
        }

        public async Task<UserDto> RegisterUserAsync(RegisterUserRequest request)
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration attempt with existing email: {Email}", request.Email);
                throw new InvalidOperationException("User with this email already exists");
            }

            // Validate password strength
            if (!_passwordService.ValidatePasswordStrength(request.Password))
            {
                _logger.LogWarning("Registration attempt with weak password for email: {Email}", request.Email);
                throw new InvalidOperationException("Password does not meet security requirements");
            }

            // Hash password
            var passwordHash = _passwordService.HashPassword(request.Password);

            // Create user
            var user = new User(request.Email, passwordHash, request.Name, request.Role)
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                Name = request.Name
            };
            await _userRepository.AddAsync(user);

            _logger.LogInformation("New user registered: {Email} with role {Role}", user.Email, user.Role);

            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto> RegisterFirstAdminAsync(RegisterUserRequest request)
        {
            // Check if any admin users already exist
            var allUsers = await _userRepository.GetAllAsync();
            var adminExists = allUsers.Any(u => u.Role == Batuara.Domain.Enums.UserRole.Admin);
            
            if (adminExists)
            {
                _logger.LogWarning("Attempt to register first admin when admin already exists");
                throw new InvalidOperationException("Admin user already exists. Use regular registration.");
            }

            // Force role to Admin for first admin registration
            request.Role = Batuara.Domain.Enums.UserRole.Admin;
            
            return await RegisterUserAsync(request);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetByEmailAsync(email);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return false;

            var isValid = _jwtService.ValidateToken(token);
            if (!isValid)
                return false;

            var principal = _jwtService.GetPrincipalFromToken(token);
            if (principal == null)
                return false;

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return false;

            var user = await _userRepository.GetByIdAsync(userId);
            return user != null && user.IsActive;
        }

        public async Task<UserDto> UpdateUserProfileAsync(int userId, UpdateUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Update profile attempt for non-existent user: {UserId}", userId);
                throw new KeyNotFoundException("User not found");
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    throw new InvalidOperationException("Email is already in use");
                }
                user.UpdateEmail(request.Email);
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.UpdateName(request.Name);
            }

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("User profile updated: {Email}", user.Email);

            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Change password attempt for non-existent user: {UserId}", userId);
                return false;
            }

            if (!_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                _logger.LogWarning("Incorrect current password for user: {Email}", user.Email);
                throw new UnauthorizedAccessException("Current password is incorrect");
            }

            if (!_passwordService.ValidatePasswordStrength(request.NewPassword))
            {
                _logger.LogWarning("Weak new password attempt for user: {Email}", user.Email);
                throw new InvalidOperationException("New password does not meet security requirements");
            }

            var newHash = _passwordService.HashPassword(request.NewPassword);
            user.UpdatePassword(newHash);
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("Password changed for user: {Email}", user.Email);
            return true;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.Select(u => _mapper.Map<UserDto>(u));
        }

        public async Task<UserDto> AdminUpdateUserAsync(int userId, AdminUpdateUserRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Admin update attempt for non-existent user: {UserId}", userId);
                throw new KeyNotFoundException("User not found");
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    throw new InvalidOperationException("Email is already in use");
                }
                user.UpdateEmail(request.Email);
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                user.UpdateName(request.Name);
            }

            if (request.Role.HasValue)
            {
                user.UpdateRole(request.Role.Value);
            }

            if (request.IsActive.HasValue)
            {
                user.SetActive(request.IsActive.Value);
            }

            await _userRepository.UpdateAsync(user);
            _logger.LogInformation("Admin updated user: {Email}", user.Email);

            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Delete attempt for non-existent user: {UserId}", userId);
                return false;
            }

            await _userRepository.DeleteAsync(userId);
            _logger.LogInformation("User deleted: {Email}", user.Email);
            return true;
        }

        private async Task<User> GetUserByRefreshTokenAsync(string refreshToken)
        {
            var users = await _userRepository.GetAllAsync();
            var user = users.SingleOrDefault(u => 
                u.RefreshTokens.Any(t => t.Token == refreshToken && t.IsActive));

            if (user == null)
            {
                _logger.LogWarning("Refresh token not found or not active: {Token}", refreshToken);
                throw new UnauthorizedAccessException("Invalid refresh token");
            }

            return user;
        }
    }
}
