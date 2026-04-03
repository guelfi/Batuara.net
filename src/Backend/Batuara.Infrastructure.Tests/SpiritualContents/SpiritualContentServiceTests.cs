using System;
using System.Threading.Tasks;
using Batuara.Application.SpiritualContents.Models;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.SpiritualContents.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.SpiritualContents
{
    public class SpiritualContentServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_Should_Sanitize_Html_Content()
        {
            await using var db = CreateInMemoryDb();
            var service = new SpiritualContentService(db);

            var request = new CreateSpiritualContentRequest
            {
                Title = "Prece de Luz",
                Content = "<script>alert('x')</script><b>Conteúdo seguro</b>",
                Type = SpiritualContentType.Prayer,
                Category = SpiritualCategory.General,
                Source = "Batuara",
                IsFeatured = true
            };

            var (content, errors, conflict) = await service.CreateAsync(request);

            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            content.Should().NotBeNull();
            content!.Content.Should().Be("Conteúdo seguro");
        }
    }
}
