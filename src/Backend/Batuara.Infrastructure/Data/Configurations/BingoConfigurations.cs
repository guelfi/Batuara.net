using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Batuara.Infrastructure.Data.Configurations
{
    internal static class BingoSeed
    {
        public static readonly DateTime SeedDate = new(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc);

        public static readonly (string Name, decimal Price)[] Menu =
        {
            ("Água", 5m),
            ("Cachorro-quente", 10m),
            ("Cartela avulsa", 7m),
            ("Cartelas para todas rodadas - qtd. 10", 50m),
            ("Cerveja Heineken", 7m),
            ("Cervejas diversas", 5m),
            ("Churrasco de carne", 12m),
            ("Churrasco de frango", 10m),
            ("Churrasco de linguiça", 10m),
            ("Fatia de bolo", 5m),
            ("Fatia de cuscuz paulista", 5m),
            ("Mousse de chocolate", 5m),
            ("Porção de batata frita", 15m),
            ("Porção de calabresa acebolada", 15m),
            ("Refrigerante", 8m),
            ("Salada", 7m)
        };

        public const int TableCount = 30;
    }

    public class BingoEventConfiguration : IEntityTypeConfiguration<BingoEvent>
    {
        public void Configure(EntityTypeBuilder<BingoEvent> builder)
        {
            builder.ToTable("BingoEvents");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
            builder.Property(x => x.EventDate).IsRequired();
            builder.Property(x => x.Status)
                .HasConversion(value => value.ToString(), value => Enum.Parse<BingoEventStatus>(value))
                .HasMaxLength(20)
                .IsRequired();
            builder.Property(x => x.IsTest).IsRequired();
            builder.Property(x => x.CloseAllRequested).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasIndex(x => x.Status)
                .IsUnique()
                .HasFilter("\"Status\" = 'Open'")
                .HasDatabaseName("IX_BingoEvents_SingleOpen");

            builder.HasData(
                new
                {
                    Id = 1,
                    Name = "Bingo 07/11/2026",
                    EventDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc),
                    Status = BingoEventStatus.Draft,
                    IsTest = false,
                    CloseAllRequested = false,
                    CreatedAt = BingoSeed.SeedDate,
                    UpdatedAt = BingoSeed.SeedDate,
                    IsActive = true
                },
                new
                {
                    Id = 2,
                    Name = "Teste",
                    EventDate = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc),
                    Status = BingoEventStatus.Draft,
                    IsTest = true,
                    CloseAllRequested = false,
                    CreatedAt = BingoSeed.SeedDate,
                    UpdatedAt = BingoSeed.SeedDate,
                    IsActive = true
                });
        }
    }

    public class BingoMenuItemConfiguration : IEntityTypeConfiguration<BingoMenuItem>
    {
        public void Configure(EntityTypeBuilder<BingoMenuItem> builder)
        {
            builder.ToTable("BingoMenuItems");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(150);
            builder.Property(x => x.UnitPrice).HasPrecision(10, 2).IsRequired();
            builder.Property(x => x.IsAvailable).IsRequired();
            builder.Property(x => x.SortOrder).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasOne<BingoEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.EventId, x.SortOrder });

            var seed = new List<object>();
            for (var eventId = 1; eventId <= 2; eventId++)
            {
                for (var i = 0; i < BingoSeed.Menu.Length; i++)
                {
                    seed.Add(new
                    {
                        Id = (eventId - 1) * BingoSeed.Menu.Length + i + 1,
                        EventId = eventId,
                        Name = BingoSeed.Menu[i].Name,
                        UnitPrice = BingoSeed.Menu[i].Price,
                        IsAvailable = true,
                        SortOrder = i + 1,
                        CreatedAt = BingoSeed.SeedDate,
                        UpdatedAt = BingoSeed.SeedDate,
                        IsActive = true
                    });
                }
            }

            builder.HasData(seed);
        }
    }

    public class BingoTableConfiguration : IEntityTypeConfiguration<BingoTable>
    {
        public void Configure(EntityTypeBuilder<BingoTable> builder)
        {
            builder.ToTable("BingoTables");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();
            builder.Property(x => x.Number).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasOne<BingoEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.EventId, x.Number }).IsUnique();

            var seed = new List<object>();
            for (var eventId = 1; eventId <= 2; eventId++)
            {
                for (var n = 1; n <= BingoSeed.TableCount; n++)
                {
                    seed.Add(new
                    {
                        Id = (eventId - 1) * BingoSeed.TableCount + n,
                        EventId = eventId,
                        Number = n,
                        CreatedAt = BingoSeed.SeedDate,
                        UpdatedAt = BingoSeed.SeedDate,
                        IsActive = true
                    });
                }
            }

            builder.HasData(seed);
        }
    }

    public class BingoWaiterConfiguration : IEntityTypeConfiguration<BingoWaiter>
    {
        public void Configure(EntityTypeBuilder<BingoWaiter> builder)
        {
            builder.ToTable("BingoWaiters");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasOne<BingoEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.HouseMember).WithMany().HasForeignKey(x => x.HouseMemberId).OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(x => new { x.EventId, x.HouseMemberId }).IsUnique();
        }
    }

    public class BingoTabConfiguration : IEntityTypeConfiguration<BingoTab>
    {
        public void Configure(EntityTypeBuilder<BingoTab> builder)
        {
            builder.ToTable("BingoTabs");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.CustomerName).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Phone).HasMaxLength(20);
            builder.Property(x => x.Status)
                .HasConversion(value => value.ToString(), value => Enum.Parse<BingoTabStatus>(value))
                .HasMaxLength(20)
                .IsRequired();
            builder.Property(x => x.PaymentMethod)
                .HasConversion(
                    value => value.HasValue ? value.Value.ToString() : null,
                    value => value == null ? null : Enum.Parse<BingoPaymentMethod>(value))
                .HasMaxLength(20);
            builder.Property(x => x.VerificationCodeHash).HasMaxLength(200);
            builder.Property(x => x.VerificationAttempts).HasDefaultValue(0);
            builder.Property(x => x.CodeMessageId).HasMaxLength(200);
            builder.Property(x => x.CodeDeliveryStatus).HasMaxLength(20);
            builder.Property(x => x.CodeDeliveryError).HasMaxLength(200);
            builder.Property(x => x.CodeSendCount).HasDefaultValue(0);
            builder.Property(x => x.ReminderMessageId).HasMaxLength(200);
            builder.Property(x => x.ReminderDeliveryStatus).HasMaxLength(20);
            builder.Property(x => x.ReminderDeliveryError).HasMaxLength(200);
            builder.Ignore(x => x.IsPhoneVerified);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.UpdatedAt).IsRequired();

            builder.HasOne<BingoEvent>().WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Restrict);
            builder.HasMany(x => x.Items).WithOne(x => x.Tab).HasForeignKey(x => x.TabId).OnDelete(DeleteBehavior.Cascade);
            builder.Navigation(x => x.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
            builder.Ignore(x => x.Total);
            builder.Ignore(x => x.IsPaid);

            builder.HasIndex(x => new { x.EventId, x.Status });
            builder.HasIndex(x => x.Phone);
            builder.HasIndex(x => x.CodeMessageId);
            builder.HasIndex(x => x.ReminderMessageId);
        }
    }

    public class BingoOrderItemConfiguration : IEntityTypeConfiguration<BingoOrderItem>
    {
        public void Configure(EntityTypeBuilder<BingoOrderItem> builder)
        {
            builder.ToTable("BingoOrderItems");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd();
            builder.Property(x => x.ItemName).IsRequired().HasMaxLength(150);
            builder.Property(x => x.UnitPrice).HasPrecision(10, 2).IsRequired();
            builder.Property(x => x.Quantity).IsRequired();
            builder.Property(x => x.Status)
                .HasConversion(value => value.ToString(), value => Enum.Parse<BingoOrderItemStatus>(value))
                .HasMaxLength(20)
                .IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.UpdatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);

            builder.HasOne<BingoMenuItem>().WithMany().HasForeignKey(x => x.MenuItemId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => x.TabId);
            builder.HasIndex(x => x.Status);
        }
    }
}
