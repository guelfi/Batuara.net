using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class SiteSettingsConfiguration : IEntityTypeConfiguration<Batuara.Domain.Entities.SiteSettings>
    {
        public void Configure(EntityTypeBuilder<Batuara.Domain.Entities.SiteSettings> builder)
        {
            builder.ToTable("SiteSettings");

            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id).ValueGeneratedOnAdd();

            builder.Property(s => s.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(s => s.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(s => s.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(s => s.AboutText)
                .IsRequired()
                .HasMaxLength(20000);

            builder.Property(s => s.HistoryTitle)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.HistorySubtitle)
                .HasMaxLength(500);

            builder.Property(s => s.HistoryHtml)
                .HasMaxLength(50000);

            builder.Property(s => s.HistoryMissionText)
                .HasMaxLength(2000);

            builder.Property(s => s.InstitutionalEmail)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.PrimaryPhone)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(s => s.SecondaryPhone)
                .HasMaxLength(50);

            builder.Property(s => s.WhatsappNumber)
                .HasMaxLength(50);

            builder.Property(s => s.ServiceHours)
                .HasMaxLength(500);

            builder.Property(s => s.Street)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.Number)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(s => s.Complement)
                .HasMaxLength(120);

            builder.Property(s => s.District)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(s => s.City)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(s => s.State)
                .IsRequired()
                .HasMaxLength(2);

            builder.Property(s => s.ZipCode)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(s => s.ReferenceNotes)
                .HasMaxLength(1000);

            builder.Property(s => s.MapEmbedUrl)
                .HasMaxLength(1000);

            builder.Property(s => s.FacebookUrl)
                .HasMaxLength(500);

            builder.Property(s => s.InstagramUrl)
                .HasMaxLength(500);

            builder.Property(s => s.YoutubeUrl)
                .HasMaxLength(500);

            builder.Property(s => s.WhatsappUrl)
                .HasMaxLength(500);

            builder.Property(s => s.PixKey)
                .HasMaxLength(200);

            builder.Property(s => s.PixPayload)
                .HasMaxLength(500);

            builder.Property(s => s.PixRecipientName)
                .HasMaxLength(200);

            builder.Property(s => s.PixCity)
                .HasMaxLength(100);

            builder.Property(s => s.BankName)
                .HasMaxLength(120);

            builder.Property(s => s.BankAgency)
                .HasMaxLength(40);

            builder.Property(s => s.BankAccount)
                .HasMaxLength(40);

            builder.Property(s => s.BankAccountType)
                .HasMaxLength(40);

            builder.Property(s => s.CompanyDocument)
                .HasMaxLength(30);

            builder.OwnsOne(s => s.ContactInfo, ci =>
            {
                ci.Property(p => p.Address)
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasColumnName("Address");

                ci.Property(p => p.Email)
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnName("Email");

                ci.Property(p => p.Phone)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("Phone");

                ci.Property(p => p.Instagram)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("Instagram");
            });
        }
    }
}
