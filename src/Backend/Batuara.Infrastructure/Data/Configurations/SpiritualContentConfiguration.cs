using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class SpiritualContentConfiguration : IEntityTypeConfiguration<SpiritualContent>
    {
        public void Configure(EntityTypeBuilder<SpiritualContent> builder)
        {
            builder.ToTable("SpiritualContents");

            // Primary Key
            builder.HasKey(sc => sc.Id);
            builder.Property(sc => sc.Id)
                .ValueGeneratedOnAdd();

            // Basic Properties
            builder.Property(sc => sc.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(sc => sc.Content)
                .IsRequired()
                .HasMaxLength(10000);

            builder.Property(sc => sc.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(sc => sc.Category)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(sc => sc.Source)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(sc => sc.DisplayOrder)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(sc => sc.IsFeatured)
                .IsRequired()
                .HasDefaultValue(false);

            // Audit Fields
            builder.Property(sc => sc.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(sc => sc.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(sc => sc.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Indexes
            builder.HasIndex(sc => sc.IsActive);
            builder.HasIndex(sc => sc.Type);
            builder.HasIndex(sc => sc.Category);
            builder.HasIndex(sc => sc.IsFeatured);
            builder.HasIndex(sc => sc.DisplayOrder);
            
            // Composite indexes for common queries
            builder.HasIndex(sc => new { sc.IsActive, sc.Category });
            builder.HasIndex(sc => new { sc.IsActive, sc.Type });
            builder.HasIndex(sc => new { sc.IsActive, sc.IsFeatured });
            builder.HasIndex(sc => new { sc.IsActive, sc.Category, sc.Type });
            builder.HasIndex(sc => new { sc.IsActive, sc.Category, sc.DisplayOrder });

            // Full-text search index on title and content
            builder.HasIndex(sc => new { sc.Title, sc.Content });

            // Unique constraint on title within same category and type for active records
            builder.HasIndex(sc => new { sc.Title, sc.Category, sc.Type })
                .IsUnique()
                .HasFilter("\"IsActive\" = true");
        }
    }
}