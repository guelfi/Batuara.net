using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class WhatsAppMessageConfiguration : IEntityTypeConfiguration<WhatsAppMessage>
    {
        public void Configure(EntityTypeBuilder<WhatsAppMessage> builder)
        {
            builder.ToTable("WhatsAppMessages");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.MessageId).IsRequired().HasMaxLength(100);
            builder.Property(x => x.SenderPhone).IsRequired().HasMaxLength(50);
            builder.Property(x => x.RecipientPhone).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Body).IsRequired().HasMaxLength(5000);
            builder.Property(x => x.IsFromMe).IsRequired();
            builder.Property(x => x.SentAt).IsRequired();

            builder.HasIndex(x => x.MessageId).IsUnique();
            builder.HasIndex(x => x.SenderPhone);

            builder.HasOne<ContactMessage>()
                .WithMany(x => x.WhatsAppMessages)
                .HasForeignKey(x => x.ContactMessageId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
