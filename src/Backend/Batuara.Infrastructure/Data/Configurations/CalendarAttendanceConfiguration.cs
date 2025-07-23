using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class CalendarAttendanceConfiguration : IEntityTypeConfiguration<CalendarAttendance>
    {
        public void Configure(EntityTypeBuilder<CalendarAttendance> builder)
        {
            builder.ToTable("CalendarAttendances");

            // Primary Key
            builder.HasKey(ca => ca.Id);
            builder.Property(ca => ca.Id)
                .ValueGeneratedOnAdd();

            // Basic Properties
            builder.Property(ca => ca.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(ca => ca.Description)
                .HasMaxLength(500);

            builder.Property(ca => ca.Observations)
                .HasMaxLength(1000);

            builder.Property(ca => ca.RequiresRegistration)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ca => ca.MaxCapacity);

            // Audit Fields
            builder.Property(ca => ca.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(ca => ca.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(ca => ca.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            // Value Object - AttendanceDate
            builder.OwnsOne(ca => ca.AttendanceDate, attendanceDate =>
            {
                attendanceDate.Property(ad => ad.Date)
                    .IsRequired()
                    .HasColumnName("Date");

                attendanceDate.Property(ad => ad.StartTime)
                    .IsRequired()
                    .HasColumnName("StartTime");

                attendanceDate.Property(ad => ad.EndTime)
                    .IsRequired()
                    .HasColumnName("EndTime");
            });

            // Indexes
            builder.HasIndex(ca => ca.IsActive);
            builder.HasIndex(ca => ca.Type);
            builder.HasIndex(ca => new { ca.IsActive, ca.Type });
        }
    }
}