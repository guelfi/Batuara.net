using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;

namespace Batuara.Infrastructure.Data
{
    public static class DatabaseConfiguration
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? "Host=localhost;Database=batuara_dev;Username=postgres;Password=postgres";

            services.AddDbContext<BatuaraDbContext>(options =>
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                    
                    npgsqlOptions.CommandTimeout(30);
                });

                // Configure logging for different environments
                var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                
                if (environment == "Development")
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                    
                    // Log all SQL commands in development
                    options.LogTo(
                        message => Log.Debug("[EF Core - SQL] {Message}", message),
                        new[] { DbLoggerCategory.Database.Command.Name },
                        LogLevel.Information);
                }
                else
                {
                    // In production, only log slow queries and errors
                    options.LogTo(
                        message => Log.Warning("[EF Core - Performance] {Message}", message),
                        new[] { DbLoggerCategory.Database.Command.Name },
                        LogLevel.Warning);
                }

                // Always log connection events
                options.LogTo(
                    message => Log.Information("[EF Core - Connection] {Message}", message),
                    new[] { DbLoggerCategory.Database.Connection.Name },
                    LogLevel.Information);

                // Log migration events
                options.LogTo(
                    message => Log.Information("[EF Core - Migration] {Message}", message),
                    new[] { DbLoggerCategory.Migrations.Name },
                    LogLevel.Information);
            });

            return services;
        }

        public static async Task EnsureDatabaseCreatedAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
            
            try
            {
                Log.Information("Ensuring database is created...");
                await context.Database.EnsureCreatedAsync();
                Log.Information("Database creation check completed successfully");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error ensuring database creation");
                throw;
            }
        }

        public static async Task MigrateDatabaseAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
            
            try
            {
                Log.Information("Starting database migration...");
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                
                if (pendingMigrations.Any())
                {
                    Log.Information("Found {Count} pending migrations: {Migrations}", 
                        pendingMigrations.Count(), 
                        string.Join(", ", pendingMigrations));
                    
                    await context.Database.MigrateAsync();
                    Log.Information("Database migration completed successfully");
                }
                else
                {
                    Log.Information("No pending migrations found");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error during database migration");
                throw;
            }
        }
    }
}