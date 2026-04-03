using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
    {
        public void Configure(EntityTypeBuilder<ContactMessage> builder)
        {
            builder.ToTable("ContactMessages");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Phone)
                .HasMaxLength(40);

            builder.Property(x => x.Subject)
                .IsRequired()
                .HasMaxLength(180);

            builder.Property(x => x.Message)
                .IsRequired()
                .HasMaxLength(4000);

            builder.Property(x => x.AdminNotes)
                .HasMaxLength(2000);

            builder.Property(x => x.Status)
                .HasConversion(
                    value => value.ToString(),
                    value => Enum.Parse<ContactMessageStatus>(value))
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.ReceivedAt)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasIndex(x => new { x.Status, x.ReceivedAt });
            builder.HasIndex(x => x.Email);
        }
    }
}
