using Batuara.Application.Auth.Models;
using Batuara.Domain.Entities;

namespace Batuara.Application.Auth.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress);
        Task<LoginResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
        Task<bool> RevokeTokenAsync(string token, string ipAddress);
        Task<UserDto> RegisterUserAsync(RegisterUserRequest request);
        Task<UserDto> RegisterFirstAdminAsync(RegisterUserRequest request);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(int id);
        Task<bool> ValidateTokenAsync(string token);
    }
}