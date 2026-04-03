using Batuara.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    public class HouseMemberConfiguration : IEntityTypeConfiguration<HouseMember>
    {
        public void Configure(EntityTypeBuilder<HouseMember> builder)
        {
            builder.ToTable("HouseMembers");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.FullName)
                .IsRequired()
                .HasMaxLength(180);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.MobilePhone)
                .IsRequired()
                .HasMaxLength(40);

            builder.Property(x => x.HeadOrixaFront)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.HeadOrixaBack)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.HeadOrixaRonda)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.ZipCode)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.Street)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Number)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.Complement)
                .HasMaxLength(120);

            builder.Property(x => x.District)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(x => x.City)
                .IsRequired()
                .HasMaxLength(120);

            builder.Property(x => x.State)
                .IsRequired()
                .HasMaxLength(2);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.HasMany(x => x.Contributions)
                .WithOne(x => x.HouseMember)
                .HasForeignKey(x => x.HouseMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.FullName, x.IsActive });
            builder.HasIndex(x => x.Email);
        }
    }
}
