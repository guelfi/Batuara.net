using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Batuara.Auth.Data;
using Batuara.Auth.DTOs;
using Batuara.Auth.Models;

namespace Batuara.Auth.Services
{
    public class UserService : IUserService
    {
        private readonly AuthDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;
        
        public UserService(
            AuthDbContext context,
            IPasswordService passwordService,
            IMapper mapper,
            ILogger<UserService> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _mapper = mapper;
            _logger = logger;
        }
        
        public async Task<UserDto?> GetByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }
        
        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            return user != null ? _mapper.Map<UserDto>(user) : null;
        }
        
        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _context.Users.ToListAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }
        
        public async Task<UserDto> CreateAsync(CreateUserDto userDto)
        {
            // Check if email is already in use
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
            {
                _logger.LogWarning("Attempt to create user with existing email: {Email}", userDto.Email);
                throw new InvalidOperationException("Email is already in use");
            }
            
            // Validate password strength
            if (!_passwordService.ValidatePasswordStrength(userDto.Password))
            {
                _logger.LogWarning("Attempt to create user with weak password: {Email}", userDto.Email);
                throw new InvalidOperationException("Password does not meet security requirements");
            }
            
            // Create new user
            var user = new User
            {
                Email = userDto.Email,
                Name = userDto.Name,
                PasswordHash = _passwordService.HashPassword(userDto.Password),
                Role = userDto.Role,
                IsActive = userDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("User created: {Email}", user.Email);
            
            return _mapper.Map<UserDto>(user);
        }
        
        public async Task<UserDto> UpdateAsync(int id, UpdateUserDto userDto)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                _logger.LogWarning("Attempt to update non-existent user: {Id}", id);
                throw new KeyNotFoundException("User not found");
            }
            
            // Check if email is being changed and is already in use
            if (userDto.Email != null && userDto.Email != user.Email)
            {
                if (await _context.Users.AnyAsync(u => u.Email == userDto.Email))
                {
                    _logger.LogWarning("Attempt to update user with existing email: {Email}", userDto.Email);
                    throw new InvalidOperationException("Email is already in use");
                }
                
                user.Email = userDto.Email;
            }
            
            // Update other properties if provided
            if (userDto.Name != null)
            {
                user.Name = userDto.Name;
            }
            
            if (userDto.Role.HasValue)
            {
                user.Role = userDto.Role.Value;
            }
            
            if (userDto.IsActive.HasValue)
            {
                user.IsActive = userDto.IsActive.Value;
            }
            
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("User updated: {Email}", user.Email);
            
            return _mapper.Map<UserDto>(user);
        }
        
        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                _logger.LogWarning("Attempt to delete non-existent user: {Id}", id);
                return false;
            }
            
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("User deleted: {Email}", user.Email);
            
            return true;
        }
        
        public async Task<bool> ChangePasswordAsync(int id, ChangePasswordDto passwordDto)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                _logger.LogWarning("Attempt to change password for non-existent user: {Id}", id);
                return false;
            }
            
            // Verify current password
            if (!_passwordService.VerifyPassword(passwordDto.CurrentPassword, user.PasswordHash))
            {
                _logger.LogWarning("Incorrect current password provided for user: {Email}", user.Email);
                throw new UnauthorizedAccessException("Current password is incorrect");
            }
            
            // Validate new password strength
            if (!_passwordService.ValidatePasswordStrength(passwordDto.NewPassword))
            {
                _logger.LogWarning("Attempt to set weak password for user: {Email}", user.Email);
                throw new InvalidOperationException("New password does not meet security requirements");
            }
            
            // Update password
            user.PasswordHash = _passwordService.HashPassword(passwordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Password changed for user: {Email}", user.Email);
            
            return true;
        }
        
        public async Task<User?> GetUserEntityByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Email == email);
        }
        
        public async Task<User?> GetUserEntityByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.RefreshTokens)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
    }
}