using System;
using System.Reflection;
using System.Threading.Tasks;
using Batuara.Application.SiteSettings.Models;
using Batuara.Domain.ValueObjects;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.SiteSettings.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Batuara.Infrastructure.Tests.SiteSettings
{
    public class SiteSettingsServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        private static void SetPrivateStringProperty(object target, string propertyName, string? value)
        {
            var property = target.GetType().GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            property.Should().NotBeNull();
            property!.SetValue(target, value);
        }

        [Fact]
        public async Task GetPublicAsync_Should_Return_Default_Location_Contact_And_Social_Data_When_Structured_Fields_Are_Blank()
        {
            var db = CreateInMemoryDb();
            var entity = new Batuara.Domain.Entities.SiteSettings(
                new ContactInfo("Endereco legado", "contato@casabatuara.org.br", "(11) 1234-5678", "casadecaridade.batuara"),
                "Texto institucional",
                "https://www.instagram.com/casadecaridade.batuara");

            SetPrivateStringProperty(entity, "Street", "");
            SetPrivateStringProperty(entity, "Number", "");
            SetPrivateStringProperty(entity, "District", "");
            SetPrivateStringProperty(entity, "City", "");
            SetPrivateStringProperty(entity, "State", "");
            SetPrivateStringProperty(entity, "ZipCode", "");
            SetPrivateStringProperty(entity, "InstitutionalEmail", "");
            SetPrivateStringProperty(entity, "PrimaryPhone", "");
            SetPrivateStringProperty(entity, "InstagramUrl", "");
            SetPrivateStringProperty(entity, "MapEmbedUrl", "");

            db.SiteSettings.Add(entity);
            await db.SaveChangesAsync();

            var service = new SiteSettingsService(db, NullLogger<SiteSettingsService>.Instance);

            var result = await service.GetPublicAsync();

            result.Street.Should().Be("Av. Brigadeiro Faria Lima");
            result.Number.Should().Be("2750");
            result.District.Should().Be("Jardim Cocaia");
            result.City.Should().Be("Guarulhos");
            result.State.Should().Be("SP");
            result.ZipCode.Should().Be("07130-000");
            result.InstitutionalEmail.Should().Be("contato@casabatuara.org.br");
            result.Email.Should().Be("contato@casabatuara.org.br");
            result.Instagram.Should().Be("casadecaridade.batuara");
            result.InstagramUrl.Should().Be("https://www.instagram.com/casadecaridade.batuara");
            result.MapEmbedUrl.Should().Contain("maps.google.com");
            result.Address.Should().Be("Av. Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000");
        }

        [Fact]
        public async Task UpdateAsync_Should_Return_Updated_Public_Location_Values()
        {
            var db = CreateInMemoryDb();
            var service = new SiteSettingsService(db, NullLogger<SiteSettingsService>.Instance);

            var updated = await service.UpdateAsync(new UpdateSiteSettingsRequest
            {
                InstitutionalEmail = "contato@casabatuara.org.br",
                PrimaryPhone = "(11) 1234-5678",
                Street = "Av. Brigadeiro Faria Lima",
                Number = "2750",
                District = "Jardim Cocaia",
                City = "Guarulhos",
                State = "SP",
                ZipCode = "07130-000",
                MapEmbedUrl = "https://maps.google.com/maps?q=Av.%20Brigadeiro%20Faria%20Lima%2C%202750%20-%20Jardim%20Cocaia%2C%20Guarulhos%20-%20SP%2C%2007130-000&z=17&output=embed",
                InstagramUrl = "https://www.instagram.com/casadecaridade.batuara/"
            });

            updated.Street.Should().Be("Av. Brigadeiro Faria Lima");
            updated.Number.Should().Be("2750");
            updated.District.Should().Be("Jardim Cocaia");
            updated.City.Should().Be("Guarulhos");
            updated.State.Should().Be("SP");
            updated.ZipCode.Should().Be("07130-000");
            updated.InstitutionalEmail.Should().Be("contato@casabatuara.org.br");
            updated.InstagramUrl.Should().Be("https://www.instagram.com/casadecaridade.batuara");

            var publicDto = await service.GetPublicAsync();
            publicDto.Address.Should().Be("Av. Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000");
            publicDto.Email.Should().Be("contato@casabatuara.org.br");
            publicDto.Instagram.Should().Be("casadecaridade.batuara");
            publicDto.MapEmbedUrl.Should().Contain("output=embed");
        }

        [Fact]
        public async Task UpdateAsync_Should_Keep_Default_History_Title_When_Request_Sends_Empty_Value()
        {
            var db = CreateInMemoryDb();
            var service = new SiteSettingsService(db, NullLogger<SiteSettingsService>.Instance);

            var updated = await service.UpdateAsync(new UpdateSiteSettingsRequest
            {
                HistoryTitle = "",
                HistorySubtitle = "  ",
                HistoryMissionText = "   ",
                AboutText = "Conteúdo atualizado da história"
            });

            updated.HistoryTitle.Should().Be("Nossa História");
            updated.HistorySubtitle.Should().Be("Uma jornada de fé, caridade e amor ao próximo");
            updated.HistoryMissionText.Should().Be("Promover a caridade, o amor fraterno e a elevação espiritual através da Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo assistência espiritual gratuita a todos que buscam a LUZ.");
            updated.AboutText.Should().Be("Conteúdo atualizado da história");
        }
    }
}
