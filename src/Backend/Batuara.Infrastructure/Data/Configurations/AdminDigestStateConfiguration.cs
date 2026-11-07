using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class AdminDigestStateConfiguration : IEntityTypeConfiguration<AdminDigestState>
    {
        public void Configure(EntityTypeBuilder<AdminDigestState> builder)
        {
            builder.ToTable("AdminDigestStates");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.Key)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.LastSentAt).IsRequired();
            builder.Property(x => x.LastSentCount).IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasIndex(x => x.Key).IsUnique();
        }
    }
}
