using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class MemberBroadcastDeliveryConfiguration : IEntityTypeConfiguration<MemberBroadcastDelivery>
    {
        public void Configure(EntityTypeBuilder<MemberBroadcastDelivery> builder)
        {
            builder.ToTable("MemberBroadcastDeliveries");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.Campaign)
                .IsRequired()
                .HasMaxLength(60);

            builder.Property(x => x.PhoneE164)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.TemplateName)
                .IsRequired()
                .HasMaxLength(80);

            builder.Property(x => x.Status)
                .HasConversion(
                    value => value.ToString(),
                    value => Enum.Parse<MemberBroadcastStatus>(value))
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.WhatsAppMessageId)
                .HasMaxLength(100);

            builder.Property(x => x.Error)
                .HasMaxLength(500);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasIndex(x => new { x.Campaign, x.HouseMemberId })
                .IsUnique()
                .HasFilter("\"Status\" = 'Sent'");
        }
    }
}
