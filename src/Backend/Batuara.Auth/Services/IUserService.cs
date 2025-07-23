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
    }
}