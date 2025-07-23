using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;
using System.Text.Json;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class UmbandaLineConfiguration : IEntityTypeConfiguration<UmbandaLine>
    {
        public void Configure(EntityTypeBuilder<UmbandaLine> builder)
        {
            builder.ToTable("UmbandaLines");

            // Primary Key
            builder.HasKey(ul => ul.Id);
            builder.Property(ul => ul.Id)
                .ValueGeneratedOnAdd();

            // Basic Properties
            builder.Property(ul => ul.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(ul => ul.Description)
                .IsRequired()
                .HasMaxLength(5000);

            builder.Property(ul => ul.Characteristics)
                .IsRequired()
                .HasMaxLength(3000);

            builder.Property(ul => ul.BatuaraInterpretation)
                .IsRequired()
                .HasMaxLength(5000);

            builder.Property(ul => ul.DisplayOrder)
                .IsRequired()
                .HasDefaultValue(0);

            // Audit Fields
            builder.Property(ul => ul.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(ul => ul.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(ul => ul.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Collection Properties - Store as JSON
            builder.Property(ul => ul.Entities)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb")
                .HasColumnName("Entities");

            builder.Property(ul => ul.WorkingDays)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasColumnType("jsonb")
                .HasColumnName("WorkingDays");

            // Indexes
            builder.HasIndex(ul => ul.Name)
                .IsUnique()
                .HasFilter("\"IsActive\" = true");

            builder.HasIndex(ul => ul.IsActive);
            builder.HasIndex(ul => ul.DisplayOrder);
            builder.HasIndex(ul => new { ul.IsActive, ul.DisplayOrder });

            // Full-text search index on name and description
            builder.HasIndex(ul => new { ul.Name, ul.Description });
        }
    }
}