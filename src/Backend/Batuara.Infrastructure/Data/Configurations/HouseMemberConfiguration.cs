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
                .HasMaxLength(150);

            builder.Property(x => x.MobilePhone)
                .HasMaxLength(40);

            builder.Property(x => x.HeadOrixaFront)
                .HasMaxLength(100);

            builder.Property(x => x.HeadOrixaBack)
                .HasMaxLength(100);

            builder.Property(x => x.HeadOrixaRonda)
                .HasMaxLength(100);

            builder.Property(x => x.ZipCode)
                .HasMaxLength(20);

            builder.Property(x => x.Street)
                .HasMaxLength(300);

            builder.Property(x => x.Number)
                .HasMaxLength(20);

            builder.Property(x => x.Complement)
                .HasMaxLength(120);

            builder.Property(x => x.District)
                .HasMaxLength(120);

            builder.Property(x => x.City)
                .HasMaxLength(120);

            builder.Property(x => x.State)
                .HasMaxLength(10);

            builder.Property(x => x.AmaciDate);

            builder.Property(x => x.YaoDate);

            builder.Property(x => x.SmallParent)
                .HasMaxLength(200);

            builder.Property(x => x.ReligiousLeader)
                .HasMaxLength(200);

            builder.Property(x => x.Notes)
                .HasMaxLength(2000);

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
            builder.HasIndex(x => x.Email).IsUnique(false);
        }
    }
}
