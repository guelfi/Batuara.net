using System;
using System.Threading.Tasks;
using Batuara.Application.Orixas.Models;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Orixas.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.Orixas
{
    public class OrixaServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_And_GetPublic_Should_Succeed()
        {
            var db = CreateInMemoryDb();
            var service = new OrixaService(db);

            var create = new CreateOrixaRequest
            {
                Name = "Oxalá",
                Description = "Descrição",
                Origin = "Tradição",
                BatuaraTeaching = "Ensino",
                Characteristics = { "Sabedoria" },
                Colors = { "Branco" },
                Elements = { "Ar" },
                DisplayOrder = 1
            };

            var (orixa, errors, conflict) = await service.CreateAsync(create);
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            orixa.Should().NotBeNull();

            var publicList = await service.GetPublicAsync("xal");
            publicList.Should().HaveCount(1);
        }
    }
}
