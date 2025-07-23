using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Serilog;

namespace Batuara.Infrastructure.Data
{
    /// <summary>
    /// Design-time factory for Entity Framework migrations
    /// </summary>
    public class BatuaraDbContextFactory : IDesignTimeDbContextFactory<BatuaraDbContext>
    {
        public BatuaraDbContext CreateDbContext(string[] args)
        {
            // Configure Serilog for design-time operations
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .CreateLogger();

            var optionsBuilder = new DbContextOptionsBuilder<BatuaraDbContext>();
            
            // Use connection string from environment or default
            var connectionString = Environment.GetEnvironmentVariable("BATUARA_CONNECTION_STRING") 
                ?? "Host=localhost;Database=batuara_dev;Username=postgres;Password=postgres";

            optionsBuilder.UseNpgsql(connectionString, options =>
            {
                options.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
            });

            // Enable detailed errors for design-time
            optionsBuilder.EnableDetailedErrors();
            optionsBuilder.EnableSensitiveDataLogging();

            Log.Information("Creating DbContext for design-time with connection: {ConnectionString}", 
                connectionString.Replace("Password=postgres", "Password=***"));

            return new BatuaraDbContext(optionsBuilder.Options);
        }
    }
}