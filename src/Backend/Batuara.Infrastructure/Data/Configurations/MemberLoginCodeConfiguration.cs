using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class MemberLoginCodeConfiguration : IEntityTypeConfiguration<MemberLoginCode>
    {
        public void Configure(EntityTypeBuilder<MemberLoginCode> builder)
        {
            builder.ToTable("MemberLoginCodes");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.CodeHash)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(x => x.CreatedByIp)
                .HasMaxLength(80);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasOne(x => x.HouseMember)
                .WithMany()
                .HasForeignKey(x => x.HouseMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.HouseMemberId, x.ExpiresAt });
            builder.HasIndex(x => x.ConsumedAt);
        }
    }
}
