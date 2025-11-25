using Microsoft.EntityFrameworkCore;
using Npgsql;
using Batuara.Auth.Models;

namespace Batuara.Auth.Data
{
    public class AuthDbContext : DbContext
    {
        static AuthDbContext()
        {
            // Não precisamos registrar o enum aqui
        }
        
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<UserActivity> UserActivities { get; set; } = null!;
        public DbSet<UserPreferences> UserPreferences { get; set; } = null!;
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configurar convenção de nomenclatura para snake_case
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Converter nome da tabela para snake_case
                var tableName = entity.GetTableName();
                if (!string.IsNullOrEmpty(tableName))
                {
                    entity.SetTableName(ToSnakeCase(tableName));
                }
                
                // Converter nome das colunas para snake_case
                foreach (var property in entity.GetProperties())
                {
                    var columnName = property.GetColumnName();
                    if (!string.IsNullOrEmpty(columnName))
                    {
                        property.SetColumnName(ToSnakeCase(columnName));
                    }
                }
                
                // Converter nome das chaves para snake_case
                foreach (var key in entity.GetKeys())
                {
                    var keyName = key.GetName();
                    if (!string.IsNullOrEmpty(keyName))
                    {
                        key.SetName(ToSnakeCase(keyName));
                    }
                }
                
                // Converter nome dos índices para snake_case
                foreach (var index in entity.GetIndexes())
                {
                    var indexName = index.GetDatabaseName();
                    if (!string.IsNullOrEmpty(indexName))
                    {
                        index.SetDatabaseName(ToSnakeCase(indexName));
                    }
                }
                
                // Converter nome das chaves estrangeiras para snake_case
                foreach (var foreignKey in entity.GetForeignKeys())
                {
                    var constraintName = foreignKey.GetConstraintName();
                    if (!string.IsNullOrEmpty(constraintName))
                    {
                        foreignKey.SetConstraintName(ToSnakeCase(constraintName));
                    }
                }
            }
            
            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasColumnType("integer");
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                
                // Configure relationship with RefreshTokens
                entity.HasMany(e => e.RefreshTokens)
                      .WithOne(e => e.User)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                // Configure relationship with UserActivities
                entity.HasMany(e => e.Activities)
                      .WithOne(e => e.User)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                // Configure relationship with UserPreferences
                entity.HasOne(e => e.Preferences)
                      .WithOne(e => e.User)
                      .HasForeignKey<UserPreferences>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Configure RefreshToken entity
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.ToTable("refresh_tokens");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Token).IsUnique();
                
                entity.Property(e => e.Token).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.ExpiresAt).IsRequired();
                entity.Property(e => e.CreatedByIp).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
            });
            
            // Configure UserActivity entity
            modelBuilder.Entity<UserActivity>(entity =>
            {
                entity.ToTable("user_activities");
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EntityType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IpAddress).IsRequired().HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.Details).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired();
                
                // Configure relationship with User
                entity.HasOne(e => e.User)
                      .WithMany(e => e.Activities)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Configure UserPreferences entity
            modelBuilder.Entity<UserPreferences>(entity =>
            {
                entity.ToTable("user_preferences");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                
                entity.Property(e => e.Language).HasMaxLength(10);
                entity.Property(e => e.Theme).HasMaxLength(20);
                entity.Property(e => e.TimeZone).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                
                // Configure relationship with User
                entity.HasOne(e => e.User)
                      .WithOne(e => e.Preferences)
                      .HasForeignKey<UserPreferences>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
        
        // Método auxiliar para converter CamelCase para snake_case
        private static string ToSnakeCase(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            var result = string.Empty;
            
            for (int i = 0; i < input.Length; i++)
            {
                if (char.IsUpper(input[i]))
                {
                    if (i > 0 && !char.IsUpper(input[i - 1]))
                        result += "_";
                    result += char.ToLower(input[i]);
                }
                else
                {
                    result += input[i];
                }
            }
            
            return result;
        }
        
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Update timestamps for modified entities
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is User || e.Entity is RefreshToken || e.Entity is UserActivity || e.Entity is UserPreferences)
                .Where(e => e.State == EntityState.Modified);

            foreach (var entityEntry in entries)
            {
                if (entityEntry.Entity is User || entityEntry.Entity is RefreshToken || entityEntry.Entity is UserActivity || entityEntry.Entity is UserPreferences)
                {
                    ((dynamic)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}