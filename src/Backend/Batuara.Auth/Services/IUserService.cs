using Batuara.Auth.DTOs;
using Batuara.Auth.Models;

namespace Batuara.Auth.Services
{
    public interface IUserService
    {
        Task<UserDto?> GetByIdAsync(int id);
        Task<UserDto?> GetByEmailAsync(string email);
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<UserDto> CreateAsync(CreateUserDto userDto);
        Task<UserDto> UpdateAsync(int id, UpdateUserDto userDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ChangePasswordAsync(int id, ChangePasswordDto passwordDto);
        Task<User?> GetUserEntityByEmailAsync(string email);
        Task<User?> GetUserEntityByIdAsync(int id);
        
        // User Activity methods
        Task<IEnumerable<UserActivityDto>> GetUserActivitiesAsync(int userId, int pageNumber = 1, int pageSize = 10);
        Task<int> GetUserActivitiesCountAsync(int userId);
        
        // User Preferences methods
        Task<UserPreferencesDto?> GetUserPreferencesAsync(int userId);
        Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto preferencesDto);
        Task<UserPreferencesDto> CreateOrUpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto preferencesDto);
    }
}