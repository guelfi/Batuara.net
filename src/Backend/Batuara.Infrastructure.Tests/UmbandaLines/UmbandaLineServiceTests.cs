using System;
using System.Threading.Tasks;
using Batuara.Application.UmbandaLines.Models;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.UmbandaLines.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.UmbandaLines
{
    public class UmbandaLineServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_And_FilterByEntity_Should_Succeed()
        {
            await using var db = CreateInMemoryDb();
            var service = new UmbandaLineService(db);

            var request = new CreateUmbandaLineRequest
            {
                Name = "Linha de Oxóssi",
                Description = "Descrição",
                Characteristics = "Caça, expansão e direcionamento",
                BatuaraInterpretation = "Interpretação",
                DisplayOrder = 1,
                Entities = { "Caboclos", "Boiadeiros" },
                WorkingDays = { "Sexta-feira" }
            };

            var (line, errors, conflict) = await service.CreateAsync(request);
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            line.Should().NotBeNull();

            var result = await service.GetPublicAsync(null, "Caboclo", null, 1, 10, null);
            result.TotalCount.Should().Be(1);
        }
    }
}
