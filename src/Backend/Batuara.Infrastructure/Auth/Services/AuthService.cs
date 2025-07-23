using System.Security.Claims;
using AutoMapper;
using Batuara.Application.Auth.Models;
using Batuara.Application.Auth.Services;
using Batuara.Domain.Entities;
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
            var user = await _userRepository.GetByEmailAsync(request.Email);
            
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

            // Generate JWT token
            var jwtToken = _jwtService.GenerateJwtToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenExpiration = _jwtService.GetTokenExpirationTime(jwtToken);

            // Save refresh token
            user.AddRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7), ipAddress);
            user.RecordLogin();
            await _userRepository.UpdateAsync(user);

            _logger.LogInformation("User {Email} logged in successfully", user.Email);

            return new LoginResponse
            {
                Token = jwtToken,
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
                Token = newJwtToken,
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
            var user = new User(request.Email, passwordHash, request.Name, request.Role);
            await _userRepository.AddAsync(user);

            _logger.LogInformation("New user registered: {Email} with role {Role}", user.Email, user.Role);

            return _mapper.Map<UserDto>(user);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetByEmailAsync(email);
        }

        public async Task<User> GetUserByIdAsync(int id)
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