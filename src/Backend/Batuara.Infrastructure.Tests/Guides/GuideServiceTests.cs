using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Application.Guides.Models;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Guides.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.Guides
{
    public class GuideServiceTests
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
            var service = new GuideService(db);

            var request = new CreateGuideRequest
            {
                Name = "Caboclo Sete Flechas",
                Description = "Guia de proteção e direcionamento",
                Specialties = new List<string> { "Proteção", "Direcionamento" },
                EntryDate = DateTime.UtcNow.Date,
                DisplayOrder = 1,
                Email = "guia@batuara.org.br"
            };

            var (created, errors, conflict) = await service.CreateAsync(request);

            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            created.Should().NotBeNull();

            var publicGuides = await service.GetPublicAsync("Sete", "Proteção");
            publicGuides.Should().HaveCount(1);
            publicGuides[0].Name.Should().Be("Caboclo Sete Flechas");
        }

        [Fact]
        public async Task Create_Should_Return_Conflict_When_Name_Already_Exists()
        {
            var db = CreateInMemoryDb();
            var service = new GuideService(db);

            await service.CreateAsync(new CreateGuideRequest
            {
                Name = "Preto Velho Pai Joaquim",
                Description = "Atendimento fraterno",
                Specialties = new List<string> { "Aconselhamento" },
                EntryDate = DateTime.UtcNow.Date,
                DisplayOrder = 1
            });

            var (_, errors, conflict) = await service.CreateAsync(new CreateGuideRequest
            {
                Name = "Preto Velho Pai Joaquim",
                Description = "Outro texto",
                Specialties = new List<string> { "Passe" },
                EntryDate = DateTime.UtcNow.Date,
                DisplayOrder = 2
            });

            conflict.Should().BeTrue();
            errors.Should().ContainSingle();
        }
    }
}
