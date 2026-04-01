using Batuara.Application.Auth.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Data.SeedData
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;
            
            try
            {
                var userRepository = services.GetRequiredService<IUserRepository>();
                var passwordService = services.GetRequiredService<IPasswordService>();
                var logger = services.GetRequiredService<ILogger<BatuaraDbContext>>();

                // Check if admin user exists
                var adminEmail = "admin@example.com";
                var adminUser = await userRepository.GetByEmailAsync(adminEmail);
                
                if (adminUser == null)
                {
                    logger.LogInformation("Creating default admin user");

                    var seedPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD");
                    if (string.IsNullOrWhiteSpace(seedPassword) || seedPassword.Length < 8)
                    {
                        logger.LogWarning("SEED_ADMIN_PASSWORD not set or too short. Skipping admin user creation.");
                        return;
                    }

                    // Create admin user with provided seed password
                    var passwordHash = passwordService.HashPassword(seedPassword);
                    var user = new User(adminEmail, passwordHash, "Administrador", UserRole.Admin)
                    {
                        Email = adminEmail,
                        PasswordHash = passwordHash,
                        Name = "Administrador"
                    };
                    
                    await userRepository.AddAsync(user);
                    
                    logger.LogInformation("Default admin user created");
                }
                else
                {
                    logger.LogInformation("Admin user already exists");
                }
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<BatuaraDbContext>>();
                logger.LogError(ex, "An error occurred while seeding the database");
            }
        }
    }
}
