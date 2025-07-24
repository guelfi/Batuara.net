using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("refresh_tokens");

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).HasColumnName("id").IsRequired().ValueGeneratedOnAdd();
            
            builder.Property(r => r.Token).HasColumnName("token").IsRequired();
            builder.HasIndex(r => r.Token).IsUnique();
            
            builder.Property(r => r.ExpiresAt).HasColumnName("expires_at").IsRequired();
            builder.Property(r => r.CreatedByIp).HasColumnName("created_by_ip").IsRequired().HasMaxLength(50);
            builder.Property(r => r.RevokedAt).HasColumnName("revoked_at");
            builder.Property(r => r.RevokedByIp).HasColumnName("revoked_by_ip").HasMaxLength(50);
            builder.Property(r => r.ReplacedByToken).HasColumnName("replaced_by_token").HasMaxLength(255);
            
            builder.Property(r => r.UserId).HasColumnName("user_id").IsRequired();
            
            builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
            builder.Property(r => r.UpdatedAt).HasColumnName("updated_at").IsRequired();
            
            // Ignore computed properties
            builder.Ignore(r => r.IsActive);
            builder.Ignore(r => r.IsExpired);
            builder.Ignore(r => r.IsRevoked);
        }
    }
}