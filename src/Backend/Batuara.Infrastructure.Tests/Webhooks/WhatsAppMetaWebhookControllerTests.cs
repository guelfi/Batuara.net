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
        public async Task ReplicaEmThreadLida_MarcaComoNaoLida()
        {
            using var db = CreateContext();
            var controller = CreateController(db);
            await controller.ProcessInboundMessageAsync(Message("wamid.1", "5511999998888", "Oi"), "Maria");
            var thread = await db.ContactMessages.SingleAsync();
            thread.MarkAsRead();
            await db.SaveChangesAsync();

            await controller.ProcessInboundMessageAsync(Message("wamid.2", "5511999998888", "Ainda aí?"), "Maria");

            (await db.ContactMessages.SingleAsync()).IsRead.Should().BeFalse();
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

        private const string StatusPayload = @"{""object"":""whatsapp_business_account"",""entry"":[{""id"":""1"",""changes"":[{""field"":""messages"",""value"":{""messaging_product"":""whatsapp"",""statuses"":[
            {""id"":""wamid.CODE"",""status"":""delivered"",""timestamp"":""1"",""recipient_id"":""5511999990001""},
            {""id"":""wamid.REM"",""status"":""failed"",""timestamp"":""2"",""recipient_id"":""5511999990001"",""errors"":[{""code"":131026,""title"":""Message undeliverable""}]}
        ]}}]}]}";

        private static async Task<Guid> SeedTabAsync(BatuaraDbContext db)
        {
            var tab = new BingoTab(1, "Maria", "5511999990001", 1);
            tab.RegisterCodeSent("wamid.CODE");
            tab.RegisterReminderSent("wamid.REM", DateTime.UtcNow);
            db.BingoTabs.Add(tab);
            await db.SaveChangesAsync();
            return tab.Id;
        }

        [Fact]
        public async Task Status_DeliveredEFailed_AtualizamComandaPorMessageId()
        {
            using var db = CreateContext();
            var id = await SeedTabAsync(db);
            var payload = System.Text.Json.JsonSerializer.Deserialize<MetaWebhookPayload>(StatusPayload)!;
            var controller = CreateController(db);

            foreach (var status in payload.Entry![0].Changes![0].Value!.Statuses!)
            {
                await controller.ProcessStatusAsync(status);
            }

            var tab = await db.BingoTabs.SingleAsync(x => x.Id == id);
            tab.CodeDeliveryStatus.Should().Be("Delivered");
            tab.CodeDeliveryError.Should().BeNull();
            tab.ReminderDeliveryStatus.Should().Be("Failed");
            tab.ReminderDeliveryError.Should().Be("131026 - Message undeliverable");
        }

        [Fact]
        public async Task Status_ForaDeOrdem_NaoRebaixaReadParaDelivered_MasFailedSempreAplica()
        {
            using var db = CreateContext();
            var id = await SeedTabAsync(db);
            var controller = CreateController(db);

            await controller.ProcessStatusAsync(new MetaWebhookStatus { Id = "wamid.CODE", Status = "read" });
            await controller.ProcessStatusAsync(new MetaWebhookStatus { Id = "wamid.CODE", Status = "delivered" });
            (await db.BingoTabs.SingleAsync(x => x.Id == id)).CodeDeliveryStatus.Should().Be("Read");

            await controller.ProcessStatusAsync(new MetaWebhookStatus
            {
                Id = "wamid.CODE",
                Status = "failed",
                Errors = new() { new MetaWebhookError { Code = 131047, Title = "Re-engagement" } }
            });
            var tab = await db.BingoTabs.SingleAsync(x => x.Id == id);
            tab.CodeDeliveryStatus.Should().Be("Failed");
            tab.CodeDeliveryError.Should().Be("131047 - Re-engagement");
        }

        [Fact]
        public async Task Status_DeIdDesconhecido_EIgnorado()
        {
            using var db = CreateContext();
            var id = await SeedTabAsync(db);

            await CreateController(db).ProcessStatusAsync(new MetaWebhookStatus { Id = "wamid.OUTRO", Status = "failed" });

            (await db.BingoTabs.SingleAsync(x => x.Id == id)).CodeDeliveryStatus.Should().Be("Sent");
        }
    }
}
