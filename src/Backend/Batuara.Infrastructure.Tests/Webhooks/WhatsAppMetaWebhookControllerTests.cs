using System;
using System.Linq;
using System.Threading.Tasks;
using Batuara.API.Controllers;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.Webhooks
{
    public class WhatsAppMetaWebhookControllerTests
    {
        private static BatuaraDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new BatuaraDbContext(options);
        }

        private static WhatsAppMetaWebhookController CreateController(BatuaraDbContext db) =>
            new(db, Options.Create(new WhatsAppCloudApiOptions()), NullLogger<WhatsAppMetaWebhookController>.Instance);

        private static MetaWebhookMessage Message(string id, string from, string? text) => new()
        {
            Id = id,
            From = from,
            Type = "text",
            Text = text == null ? null : new MetaWebhookText { Body = text }
        };

        [Fact]
        public async Task MensagemSemThread_CriaContactMessageComHistorico()
        {
            using var db = CreateContext();

            await CreateController(db).ProcessInboundMessageAsync(Message("wamid.1", "5511999998888", "Boa tarde"), "Maria");

            var created = await db.ContactMessages.Include(x => x.WhatsAppMessages).SingleAsync();
            created.Name.Should().Be("Maria");
            created.Subject.Should().Be(WhatsAppMetaWebhookController.InboundSubject);
            created.WantsWhatsAppResponse.Should().BeTrue();
            created.Phone.Should().Be("5511999998888");
            created.WhatsAppMessages.Should().ContainSingle(m => m.MessageId == "wamid.1" && !m.IsFromMe);
        }

        [Fact]
        public async Task MensagemSemNomeDePerfil_UsaNomePadrao()
        {
            using var db = CreateContext();

            await CreateController(db).ProcessInboundMessageAsync(Message("wamid.1", "5511999998888", "Oi"));

            (await db.ContactMessages.SingleAsync()).Name.Should().Be("Visitante WhatsApp");
        }

        [Fact]
        public async Task SegundaMensagemDoMesmoNumero_AnexaNaMesmaThread()
        {
            using var db = CreateContext();
            var controller = CreateController(db);

            await controller.ProcessInboundMessageAsync(Message("wamid.1", "5511999998888", "Oi"), "Maria");
            await controller.ProcessInboundMessageAsync(Message("wamid.2", "5511999998888", "Tem gira hoje?"), "Maria");

            var thread = await db.ContactMessages.Include(x => x.WhatsAppMessages).SingleAsync();
            thread.WhatsAppMessages.Select(m => m.MessageId).Should().BeEquivalentTo("wamid.1", "wamid.2");
        }

        [Fact]
        public async Task TextoVazioOuMidia_EhIgnorado()
        {
            using var db = CreateContext();
            var controller = CreateController(db);

            await controller.ProcessInboundMessageAsync(Message("wamid.1", "5511999998888", null));
            await controller.ProcessInboundMessageAsync(Message("wamid.2", "5511999998888", "   "));

            (await db.ContactMessages.CountAsync()).Should().Be(0);
        }
    }
}
