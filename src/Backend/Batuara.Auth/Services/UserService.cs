using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
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
        private readonly ICacheService _cacheService;
        
        // Cache keys
        private const string UserCacheKeyPrefix = "user_";
        private const string UserPreferencesCacheKeyPrefix = "user_preferences_";
        private const string UserActivitiesCacheKeyPrefix = "user_activities_";
        
        // Cache expiration times
        private static readonly TimeSpan UserCacheExpiration = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan UserPreferencesCacheExpiration = TimeSpan.FromMinutes(60);
        private static readonly TimeSpan UserActivitiesCacheExpiration = TimeSpan.FromMinutes(15);
        
        public UserService(
            AuthDbContext context,
            IPasswordService passwordService,
            IMapper mapper,
            ILogger<UserService> logger,
            ICacheService cacheService)
        {
            _context = context;
            _passwordService = passwordService;
            _mapper = mapper;
            _logger = logger;
            _cacheService = cacheService;
        }
        
        public async Task<UserDto?> GetByIdAsync(int id)
        {
            // Try to get from cache first
            var cacheKey = $"{UserCacheKeyPrefix}{id}";
            var cachedUser = await _cacheService.GetAsync<UserDto>(cacheKey);
            
            if (cachedUser != null)
            {
                _logger.LogDebug("User retrieved from cache: {UserId}", id);
                return cachedUser;
            }
            
            // If not in cache, get from database
            var user = await _context.Users.FindAsync(id);
            var userDto = user != null ? _mapper.Map<UserDto>(user) : null;
            
            // Cache the result if found
            if (userDto != null)
            {
                await _cacheService.SetAsync(cacheKey, userDto, UserCacheExpiration);
            }
            
            return userDto;
        }
        
        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            // For email lookup, we can't use cache directly since we don't know the ID
            // But we can cache the result after finding it
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            var userDto = user != null ? _mapper.Map<UserDto>(user) : null;
            
            // Cache the result if found
            if (userDto != null)
            {
                var cacheKey = $"{UserCacheKeyPrefix}{userDto.Id}";
                await _cacheService.SetAsync(cacheKey, userDto, UserCacheExpiration);
            }
            
            return userDto;
        }
        
        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            // For getAll, we won't cache the entire list but individual users
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
            
            var userDtoResult = _mapper.Map<UserDto>(user);
            
            // Cache the new user
            var cacheKey = $"{UserCacheKeyPrefix}{userDtoResult.Id}";
            await _cacheService.SetAsync(cacheKey, userDtoResult, UserCacheExpiration);
            
            _logger.LogInformation("User created: {Email}", user.Email);
            
            return userDtoResult;
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
            
            var userDtoResult = _mapper.Map<UserDto>(user);
            
            // Update cache
            var cacheKey = $"{UserCacheKeyPrefix}{id}";
            await _cacheService.SetAsync(cacheKey, userDtoResult, UserCacheExpiration);
            
            _logger.LogInformation("User updated: {Email}", user.Email);
            
            return userDtoResult;
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
            
            // Remove from cache
            var cacheKey = $"{UserCacheKeyPrefix}{id}";
            await _cacheService.RemoveAsync(cacheKey);
            
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
            
            // Update cache
            var cacheKey = $"{UserCacheKeyPrefix}{id}";
            var userDto = _mapper.Map<UserDto>(user);
            await _cacheService.SetAsync(cacheKey, userDto, UserCacheExpiration);
            
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
        
        // User Activity methods
        public async Task<IEnumerable<UserActivityDto>> GetUserActivitiesAsync(int userId, int pageNumber = 1, int pageSize = 10)
        {
            // Try to get from cache first
            var cacheKey = $"{UserActivitiesCacheKeyPrefix}{userId}_page{pageNumber}_size{pageSize}";
            var cachedActivities = await _cacheService.GetAsync<IEnumerable<UserActivityDto>>(cacheKey);
            
            if (cachedActivities != null)
            {
                _logger.LogDebug("User activities retrieved from cache: {UserId}", userId);
                return cachedActivities;
            }
            
            // If not in cache, get from database
            var activities = await _context.UserActivities
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            var activitiesDto = _mapper.Map<IEnumerable<UserActivityDto>>(activities);
            
            // Cache the result
            await _cacheService.SetAsync(cacheKey, activitiesDto, UserActivitiesCacheExpiration);
            
            return activitiesDto;
        }
        
        public async Task<int> GetUserActivitiesCountAsync(int userId)
        {
            // For count, we won't cache as it changes frequently
            return await _context.UserActivities
                .CountAsync(a => a.UserId == userId);
        }
        
        // User Preferences methods
        public async Task<UserPreferencesDto?> GetUserPreferencesAsync(int userId)
        {
            // Try to get from cache first
            var cacheKey = $"{UserPreferencesCacheKeyPrefix}{userId}";
            var cachedPreferences = await _cacheService.GetAsync<UserPreferencesDto>(cacheKey);
            
            if (cachedPreferences != null)
            {
                _logger.LogDebug("User preferences retrieved from cache: {UserId}", userId);
                return cachedPreferences;
            }
            
            // If not in cache, get from database
            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);
                
            var preferencesDto = preferences != null ? _mapper.Map<UserPreferencesDto>(preferences) : null;
            
            // Cache the result if found
            if (preferencesDto != null)
            {
                await _cacheService.SetAsync(cacheKey, preferencesDto, UserPreferencesCacheExpiration);
            }
            
            return preferencesDto;
        }
        
        public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto preferencesDto)
        {
            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);
                
            if (preferences == null)
            {
                throw new KeyNotFoundException("User preferences not found");
            }
            
            // Update only provided values
            if (preferencesDto.Language != null)
                preferences.Language = preferencesDto.Language;
                
            if (preferencesDto.Theme != null)
                preferences.Theme = preferencesDto.Theme;
                
            if (preferencesDto.TimeZone != null)
                preferences.TimeZone = preferencesDto.TimeZone;
                
            if (preferencesDto.EmailNotifications.HasValue)
                preferences.EmailNotifications = preferencesDto.EmailNotifications.Value;
                
            if (preferencesDto.PushNotifications.HasValue)
                preferences.PushNotifications = preferencesDto.PushNotifications.Value;
                
            if (preferencesDto.SmsNotifications.HasValue)
                preferences.SmsNotifications = preferencesDto.SmsNotifications.Value;
                
            if (preferencesDto.ItemsPerPage.HasValue)
                preferences.ItemsPerPage = preferencesDto.ItemsPerPage.Value;
                
            if (preferencesDto.ShowHelpTooltips.HasValue)
                preferences.ShowHelpTooltips = preferencesDto.ShowHelpTooltips.Value;
            
            preferences.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            var preferencesDtoResult = _mapper.Map<UserPreferencesDto>(preferences);
            
            // Update cache
            var cacheKey = $"{UserPreferencesCacheKeyPrefix}{userId}";
            await _cacheService.SetAsync(cacheKey, preferencesDtoResult, UserPreferencesCacheExpiration);
            
            return preferencesDtoResult;
        }
        
        public async Task<UserPreferencesDto> CreateOrUpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto preferencesDto)
        {
            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);
                
            if (preferences == null)
            {
                // Create new preferences
                preferences = new UserPreferences
                {
                    UserId = userId,
                    Language = preferencesDto.Language ?? "pt-BR",
                    Theme = preferencesDto.Theme ?? "light",
                    TimeZone = preferencesDto.TimeZone ?? "America/Sao_Paulo",
                    EmailNotifications = preferencesDto.EmailNotifications ?? true,
                    PushNotifications = preferencesDto.PushNotifications ?? true,
                    SmsNotifications = preferencesDto.SmsNotifications ?? false,
                    ItemsPerPage = preferencesDto.ItemsPerPage ?? 10,
                    ShowHelpTooltips = preferencesDto.ShowHelpTooltips ?? true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                _context.UserPreferences.Add(preferences);
            }
            else
            {
                // Update existing preferences
                if (preferencesDto.Language != null)
                    preferences.Language = preferencesDto.Language;
                    
                if (preferencesDto.Theme != null)
                    preferences.Theme = preferencesDto.Theme;
                    
                if (preferencesDto.TimeZone != null)
                    preferences.TimeZone = preferencesDto.TimeZone;
                    
                if (preferencesDto.EmailNotifications.HasValue)
                    preferences.EmailNotifications = preferencesDto.EmailNotifications.Value;
                    
                if (preferencesDto.PushNotifications.HasValue)
                    preferences.PushNotifications = preferencesDto.PushNotifications.Value;
                    
                if (preferencesDto.SmsNotifications.HasValue)
                    preferences.SmsNotifications = preferencesDto.SmsNotifications.Value;
                    
                if (preferencesDto.ItemsPerPage.HasValue)
                    preferences.ItemsPerPage = preferencesDto.ItemsPerPage.Value;
                    
                if (preferencesDto.ShowHelpTooltips.HasValue)
                    preferences.ShowHelpTooltips = preferencesDto.ShowHelpTooltips.Value;
                
                preferences.UpdatedAt = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            
            var preferencesDtoResult = _mapper.Map<UserPreferencesDto>(preferences);
            
            // Update cache
            var cacheKey = $"{UserPreferencesCacheKeyPrefix}{userId}";
            await _cacheService.SetAsync(cacheKey, preferencesDtoResult, UserPreferencesCacheExpiration);
            
            return preferencesDtoResult;
        }
    }
}