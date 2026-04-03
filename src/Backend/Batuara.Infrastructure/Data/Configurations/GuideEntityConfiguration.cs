using System.Text.Json;
using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class GuideEntityConfiguration : IEntityTypeConfiguration<GuideEntity>
    {
        public void Configure(EntityTypeBuilder<GuideEntity> builder)
        {
            builder.ToTable("Guides");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Description)
                .IsRequired()
                .HasMaxLength(8000);

            builder.Property(x => x.PhotoUrl)
                .HasMaxLength(500);

            builder.Property(x => x.Email)
                .HasMaxLength(150);

            builder.Property(x => x.Phone)
                .HasMaxLength(40);

            builder.Property(x => x.Whatsapp)
                .HasMaxLength(40);

            builder.Property(x => x.DisplayOrder)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(x => x.EntryDate)
                .IsRequired();

            builder.Property(x => x.Specialties)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
                    value => JsonSerializer.Deserialize<List<string>>(value, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb");

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasIndex(x => x.Name)
                .HasFilter("\"IsActive\" = true");

            builder.HasIndex(x => new { x.IsActive, x.DisplayOrder });
        }
    }
}
