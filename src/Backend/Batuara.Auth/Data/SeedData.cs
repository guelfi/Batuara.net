using Microsoft.EntityFrameworkCore;
using Batuara.Auth.Models;
using Batuara.Auth.Services;

namespace Batuara.Auth.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new AuthDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AuthDbContext>>());
                
            var passwordService = serviceProvider.GetRequiredService<IPasswordService>();
            
            // Check if there are any users
            if (await context.Users.AnyAsync())
            {
                return; // DB has been seeded
            }
            
            // Create admin user
            var adminUser = new User
            {
                Email = "admin@batuara.org.br",
                Name = "Administrador",
                PasswordHash = passwordService.HashPassword("admin123"), // Change in production!
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Users.Add(adminUser);
            
            // Create moderator user
            var moderatorUser = new User
            {
                Email = "moderator@casabatuara.org.br",
                Name = "Moderador",
                PasswordHash = passwordService.HashPassword("moderator123"), // Change in production!
                Role = UserRole.Moderator,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Users.Add(moderatorUser);
            
            // Create editor user
            var editorUser = new User
            {
                Email = "editor@casabatuara.org.br",
                Name = "Editor",
                PasswordHash = passwordService.HashPassword("editor123"), // Change in production!
                Role = UserRole.Editor,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            context.Users.Add(editorUser);
            
            await context.SaveChangesAsync();
        }
    }
}
