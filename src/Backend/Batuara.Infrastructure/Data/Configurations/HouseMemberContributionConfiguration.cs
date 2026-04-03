using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class HouseMemberContributionConfiguration : IEntityTypeConfiguration<HouseMemberContribution>
    {
        public void Configure(EntityTypeBuilder<HouseMemberContribution> builder)
        {
            builder.ToTable("HouseMemberContributions");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.ReferenceMonth)
                .IsRequired();

            builder.Property(x => x.DueDate)
                .IsRequired();

            builder.Property(x => x.Amount)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasConversion(
                    value => value.ToString(),
                    value => Enum.Parse<ContributionPaymentStatus>(value))
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.Notes)
                .HasMaxLength(1000);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.HasIndex(x => new { x.HouseMemberId, x.ReferenceMonth }).IsUnique();
        }
    }
}
