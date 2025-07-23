using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;
using System.Text.Json;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class OrixaConfiguration : IEntityTypeConfiguration<Orixa>
    {
        public void Configure(EntityTypeBuilder<Orixa> builder)
        {
            builder.ToTable("Orixas");

            // Primary Key
            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id)
                .ValueGeneratedOnAdd();

            // Basic Properties
            builder.Property(o => o.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(o => o.Description)
                .IsRequired()
                .HasMaxLength(5000);

            builder.Property(o => o.Origin)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(o => o.BatuaraTeaching)
                .IsRequired()
                .HasMaxLength(5000);

            builder.Property(o => o.ImageUrl)
                .HasMaxLength(500);

            builder.Property(o => o.DisplayOrder)
                .IsRequired()
                .HasDefaultValue(0);

            // Audit Fields
            builder.Property(o => o.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(o => o.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(o => o.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Collection Properties - Store as JSON
            builder.Property(o => o.Characteristics)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb")
                .HasColumnName("Characteristics");

            builder.Property(o => o.Colors)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb")
                .HasColumnName("Colors");

            builder.Property(o => o.Elements)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb")
                .HasColumnName("Elements");

            // Indexes
            builder.HasIndex(o => o.Name)
                .IsUnique()
                .HasFilter("\"IsActive\" = true");

            builder.HasIndex(o => o.IsActive);
            builder.HasIndex(o => o.DisplayOrder);
            builder.HasIndex(o => new { o.IsActive, o.DisplayOrder });

            // Full-text search index on name and description
            builder.HasIndex(o => new { o.Name, o.Description });
        }
    }
}