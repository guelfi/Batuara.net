using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.ToTable("Events");

            // Primary Key
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            // Basic Properties
            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(2000);

            builder.Property(e => e.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ImageUrl)
                .HasMaxLength(500);

            builder.Property(e => e.Location)
                .HasMaxLength(300);

            // Audit Fields
            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Value Object - EventDate
            builder.OwnsOne(e => e.EventDate, eventDate =>
            {
                eventDate.Property(ed => ed.Date)
                    .IsRequired()
                    .HasColumnName("Date");

                eventDate.Property(ed => ed.StartTime)
                    .HasColumnName("StartTime");

                eventDate.Property(ed => ed.EndTime)
                    .HasColumnName("EndTime");
            });

            // Indexes
            builder.HasIndex(e => e.IsActive);
            builder.HasIndex(e => e.Type);
            builder.HasIndex(e => new { e.IsActive, e.Type });
        }
    }
}