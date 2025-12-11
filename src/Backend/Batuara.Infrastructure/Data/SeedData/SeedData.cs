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
                var adminUser = await userRepository.GetByEmailAsync("admin@batuara.org.br");
                
                if (adminUser == null)
                {
                    logger.LogInformation("Creating default admin user");
                    
                    // Create admin user
                    var passwordHash = passwordService.HashPassword("admin123");
                    var user = new User("admin@batuara.org.br", passwordHash, "Administrador", UserRole.Admin)
                    {
                        Email = "admin@batuara.org.br",
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
