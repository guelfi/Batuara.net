using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data.Configurations;
using Serilog;

namespace Batuara.Infrastructure.Data
{
    public class BatuaraDbContext : DbContext
    {
        public BatuaraDbContext(DbContextOptions<BatuaraDbContext> options) : base(options)
        {
        }

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<CalendarAttendance> CalendarAttendances { get; set; } = null!;
        public DbSet<Orixa> Orixas { get; set; } = null!;
        public DbSet<UmbandaLine> UmbandaLines { get; set; } = null!;
        public DbSet<SpiritualContent> SpiritualContents { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all configurations
            modelBuilder.ApplyConfiguration(new EventConfiguration());
            modelBuilder.ApplyConfiguration(new CalendarAttendanceConfiguration());
            modelBuilder.ApplyConfiguration(new OrixaConfiguration());
            modelBuilder.ApplyConfiguration(new UmbandaLineConfiguration());
            modelBuilder.ApplyConfiguration(new SpiritualContentConfiguration());
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

            // Configure schema - using public schema where data exists
            // modelBuilder.HasDefaultSchema("batuara"); // Commented out to use public schema
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // This will be overridden by dependency injection in production
                optionsBuilder.UseNpgsql("Host=localhost;Database=batuara_dev;Username=postgres;Password=postgres");
            }

            // Enable sensitive data logging in development
            optionsBuilder.EnableSensitiveDataLogging();
            optionsBuilder.EnableDetailedErrors();
            
            // Configure logging with Serilog
            optionsBuilder.LogTo(
                message => Log.Information("[EF Core] {Message}", message),
                new[] { DbLoggerCategory.Database.Command.Name },
                LogLevel.Information);

            // Log slow queries (queries taking more than 1 second)
            optionsBuilder.LogTo(
                message => Log.Warning("[EF Core - Slow Query] {Message}", message),
                new[] { DbLoggerCategory.Database.Command.Name },
                LogLevel.Warning);
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Domain.Common.BaseEntity && 
                           (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                var entity = (Domain.Common.BaseEntity)entry.Entity;
                
                if (entry.State == EntityState.Added)
                {
                    // CreatedAt is set in the entity constructor
                }
                else if (entry.State == EntityState.Modified)
                {
                    // Update the UpdatedAt timestamp
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }
        }
    }
}