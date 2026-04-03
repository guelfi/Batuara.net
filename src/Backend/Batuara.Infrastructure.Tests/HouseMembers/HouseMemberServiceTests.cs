using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Application.HouseMembers.Models;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.HouseMembers.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.HouseMembers
{
    public class HouseMemberServiceTests
    {
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
    }
}
