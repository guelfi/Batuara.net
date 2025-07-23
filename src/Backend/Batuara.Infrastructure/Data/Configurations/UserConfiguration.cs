using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");

            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id).HasColumnName("id").IsRequired().ValueGeneratedOnAdd();
            
            builder.Property(u => u.Email).HasColumnName("email").IsRequired().HasMaxLength(255);
            builder.HasIndex(u => u.Email).IsUnique();
            
            builder.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
            builder.Property(u => u.Name).HasColumnName("name").IsRequired().HasMaxLength(100);
            builder.Property(u => u.Role).HasColumnName("role").IsRequired();
            builder.Property(u => u.IsActive).HasColumnName("is_active").IsRequired();
            builder.Property(u => u.LastLoginAt).HasColumnName("last_login_at");
            
            builder.Property(u => u.CreatedAt).HasColumnName("created_at").IsRequired();
            builder.Property(u => u.UpdatedAt).HasColumnName("updated_at").IsRequired();

            // Relationship with RefreshTokens
            builder.HasMany(u => u.RefreshTokens)
                .WithOne()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}