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
            
            // Create users only if corresponding seed passwords are provided via environment variables
            var adminSeed = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
            if (!string.IsNullOrWhiteSpace(adminSeed) && adminSeed.Length >= 8)
            {
                var adminUser = new User
                {
                    Email = "admin@example.com",
                    Name = "Administrador",
                    PasswordHash = passwordService.HashPassword(adminSeed),
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(adminUser);
            }
            
            var moderatorSeed = Environment.GetEnvironmentVariable("SEED_MODERATOR_PASSWORD");
            if (!string.IsNullOrWhiteSpace(moderatorSeed) && moderatorSeed.Length >= 8)
            {
                var moderatorUser = new User
                {
                    Email = "moderator@example.com",
                    Name = "Moderador",
                    PasswordHash = passwordService.HashPassword(moderatorSeed),
                    Role = UserRole.Moderator,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(moderatorUser);
            }
            
            var editorSeed = Environment.GetEnvironmentVariable("SEED_EDITOR_PASSWORD");
            if (!string.IsNullOrWhiteSpace(editorSeed) && editorSeed.Length >= 8)
            {
                var editorUser = new User
                {
                    Email = "editor@example.com",
                    Name = "Editor",
                    PasswordHash = passwordService.HashPassword(editorSeed),
                    Role = UserRole.Editor,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                context.Users.Add(editorUser);
            }
            
            await context.SaveChangesAsync();
        }
    }
}
