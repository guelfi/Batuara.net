using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.HouseMembers.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.HouseMembers
{
    public class HouseMemberServiceTests
    {
        private class FakeWhatsAppService : IWhatsAppService
        {
            public int ReminderCount { get; private set; }

            public Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default) => Task.CompletedTask;

            public Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default)
            {
                ReminderCount++;
                return Task.CompletedTask;
            }

            public Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default) => Task.FromResult(Guid.NewGuid().ToString());
        }

        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_Should_Persist_Member_With_Contribution_History()
        {
            var db = CreateInMemoryDb();
            var service = new HouseMemberService(db);

            var request = new CreateHouseMemberRequest
            {
                FullName = "Filho da Casa Teste",
                BirthDate = DateTime.UtcNow.Date.AddYears(-30),
                EntryDate = DateTime.UtcNow.Date.AddYears(-2),
                HeadOrixaFront = "Oxóssi",
                HeadOrixaBack = "Ogum",
                HeadOrixaRonda = "Iansã",
                Email = "filho@batuara.org.br",
                MobilePhone = "11999999999",
                ZipCode = "07000-000",
                Street = "Rua da Caridade",
                Number = "123",
                District = "Centro",
                City = "Guarulhos",
                State = "SP",
                Contributions = new List<HouseMemberContributionInput>
                {
                    new()
                    {
                        ReferenceMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                        DueDate = DateTime.UtcNow.Date.AddDays(5),
                        Amount = 50m,
                        Status = ContributionPaymentStatus.Paid,
                        PaidAt = DateTime.UtcNow.Date
                    }
                }
            };

            var (created, errors, conflict) = await service.CreateAsync(request);

            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            created.Should().NotBeNull();
            created!.Contributions.Should().HaveCount(1);
            created.CurrentMonthContributionStatus.Should().Be(ContributionPaymentStatus.Paid);
        }

        [Fact]
        public async Task Update_Should_Generate_Next_Contribution_When_Recurring_Is_Paid()
        {
            var db = CreateInMemoryDb();
            var service = new HouseMemberService(db);
            var referenceMonth = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc);

            var (created, _, _) = await service.CreateAsync(new CreateHouseMemberRequest
            {
                FullName = "Recorrente Teste",
                BirthDate = DateTime.UtcNow.Date.AddYears(-30),
                HeadOrixaFront = "Oxóssi",
                Contributions = new List<HouseMemberContributionInput>
                {
                    new()
                    {
                        ReferenceMonth = referenceMonth,
                        DueDate = new DateTime(2026, 7, 10, 0, 0, 0, DateTimeKind.Utc),
                        Amount = 50m,
                        Status = ContributionPaymentStatus.Pending,
                        IsRecurring = true,
                        AllowWhatsAppReminder = true
                    }
                }
            });

            var contribution = created!.Contributions[0];
            var (updated, errors, _) = await service.UpdateAsync(created.Id, new UpdateHouseMemberRequest
            {
                FullName = created.FullName,
                BirthDate = created.BirthDate,
                HeadOrixaFront = created.HeadOrixaFront,
                IsActive = true,
                Contributions = new List<HouseMemberContributionInput>
                {
                    new()
                    {
                        Id = contribution.Id,
                        ReferenceMonth = contribution.ReferenceMonth,
                        DueDate = contribution.DueDate,
                        Amount = contribution.Amount,
                        Status = ContributionPaymentStatus.Paid,
                        PaidAt = DateTime.UtcNow,
                        IsRecurring = true,
                        AllowWhatsAppReminder = true
                    }
                }
            });

            errors.Should().BeEmpty();
            updated!.Contributions.Should().HaveCount(2);
            updated.Contributions.Should().Contain(x => x.ReferenceMonth == new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc) && x.IsRecurring && x.AllowWhatsAppReminder);
        }

        [Fact]
        public async Task ReminderProcessor_Should_Send_Only_Authorized_Pending_Reminders()
        {
            var db = CreateInMemoryDb();
            var service = new HouseMemberService(db);
            var whatsApp = new FakeWhatsAppService();
            var reminder = new ContributionReminderProcessor(
                db,
                whatsApp,
                Options.Create(new ContributionReminderOptions { Enabled = true, DaysBeforeDue = 2, MaxMessagesPerRun = 1 }),
                NullLogger<ContributionReminderProcessor>.Instance);

            await service.CreateAsync(new CreateHouseMemberRequest
            {
                FullName = "Lembrete Teste",
                BirthDate = DateTime.UtcNow.Date.AddYears(-30),
                HeadOrixaFront = "Ogum",
                MobilePhone = "11999999999",
                Contributions = new List<HouseMemberContributionInput>
                {
                    new()
                    {
                        ReferenceMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                        DueDate = DateTime.UtcNow.Date.AddDays(1),
                        Amount = 50m,
                        Status = ContributionPaymentStatus.Pending,
                        AllowWhatsAppReminder = true
                    }
                }
            });

            var sent = await reminder.ProcessDueRemindersAsync();

            sent.Should().Be(1);
            whatsApp.ReminderCount.Should().Be(1);
            var contribution = await db.HouseMemberContributions.SingleAsync();
            contribution.ReminderSentAt.Should().NotBeNull();
        }
    }
}
