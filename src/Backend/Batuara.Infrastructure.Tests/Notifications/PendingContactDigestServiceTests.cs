using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Batuara.Infrastructure.Tests.Notifications
{
    public class PendingContactDigestServiceTests
    {
        private static readonly DateTime LastDigest = DateTime.UtcNow.AddHours(-10);

        private static BatuaraDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new BatuaraDbContext(options);
        }

        private static PendingContactDigestService CreateService(BatuaraDbContext db) =>
            new(db, NullLogger<PendingContactDigestService>.Instance);

        private static async Task SeedLastDigestAsync(BatuaraDbContext db)
        {
            db.AdminDigestStates.Add(new AdminDigestState(AdminDigestState.PendingContactsKey, LastDigest, 1));
            await db.SaveChangesAsync();
        }

        private static ContactMessage NewMessage(
            DateTime receivedAt,
            ContactMessageStatus status = ContactMessageStatus.New,
            bool read = false,
            bool wantsWhatsApp = true)
        {
            var message = new ContactMessage("Maria", null, "Assunto", "Texto", "5511999998888", wantsWhatsApp);
            typeof(ContactMessage).GetProperty(nameof(ContactMessage.ReceivedAt))!.SetValue(message, receivedAt);
            if (status != ContactMessageStatus.New)
            {
                message.UpdateStatus(status);
            }

            if (read)
            {
                message.MarkAsRead();
            }

            return message;
        }

        private static void AddReply(ContactMessage message, DateTime sentAt, bool isFromMe)
        {
            message.AddWhatsAppMessage(Guid.NewGuid().ToString(), "5511999998888", "sistema", "oi", isFromMe, sentAt);
        }

        private class Sender
        {
            public List<int> Counts { get; } = new();
            public Exception? Failure { get; set; }

            public Task SendAsync(int count, System.Threading.CancellationToken ct)
            {
                if (Failure != null)
                {
                    throw Failure;
                }

                Counts.Add(count);
                return Task.CompletedTask;
            }
        }

        private static async Task<int?> RunAsync(BatuaraDbContext db, Sender sender) =>
            await CreateService(db).RunAsync(sender.SendAsync);

        [Fact]
        public async Task SemNovidade_NaoEnvia()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(-5)));
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().BeNull();

            sender.Counts.Should().BeEmpty();
        }

        [Fact]
        public async Task NewDepoisDoUltimoDigest_Conta()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(1)));
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(-3)));
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().Be(2);

            sender.Counts.Should().Equal(2);
        }

        [Fact]
        public async Task NewAntigaJaLida_NaoGeraEnvio()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(-3), read: true));
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().BeNull();

            sender.Counts.Should().BeEmpty();
        }

        [Fact]
        public async Task InProgressComReplicaDoVisitante_Conta()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            var message = NewMessage(LastDigest.AddDays(-2), ContactMessageStatus.InProgress, read: true);
            AddReply(message, LastDigest.AddHours(2), isFromMe: false);
            db.ContactMessages.Add(message);
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().Be(1);
        }

        [Fact]
        public async Task SoRespostaNossa_NaoConta()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            var message = NewMessage(LastDigest.AddDays(-2), ContactMessageStatus.InProgress, read: true);
            AddReply(message, LastDigest.AddHours(2), isFromMe: true);
            db.ContactMessages.Add(message);
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().BeNull();
        }

        [Fact]
        public async Task ResolvedEArchived_SaoIgnoradas()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            foreach (var status in new[] { ContactMessageStatus.Resolved, ContactMessageStatus.Archived })
            {
                var message = NewMessage(LastDigest.AddHours(1), status);
                AddReply(message, LastDigest.AddHours(2), isFromMe: false);
                db.ContactMessages.Add(message);
            }

            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().BeNull();
        }

        [Fact]
        public async Task SemWhatsAppResponse_TambemEntra()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(1), wantsWhatsApp: false));
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().Be(1);
        }

        [Fact]
        public async Task TotalInclui_NaoLidasAntigasEReplicasNovas_SemLidasSemReplica()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(1)));
            db.ContactMessages.Add(NewMessage(LastDigest.AddDays(-5), ContactMessageStatus.InProgress));
            db.ContactMessages.Add(NewMessage(LastDigest.AddDays(-5), ContactMessageStatus.InProgress, read: true));
            var replied = NewMessage(LastDigest.AddDays(-5), ContactMessageStatus.InProgress, read: true);
            AddReply(replied, LastDigest.AddHours(1), isFromMe: false);
            db.ContactMessages.Add(replied);
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().Be(3);
        }

        [Fact]
        public async Task PrimeiroRun_UsaJanelaDe24Horas()
        {
            using var db = CreateContext();
            db.ContactMessages.Add(NewMessage(DateTime.UtcNow.AddHours(-30), read: true));
            await db.SaveChangesAsync();
            var sender = new Sender();

            (await RunAsync(db, sender)).Should().BeNull();

            db.ContactMessages.Add(NewMessage(DateTime.UtcNow.AddHours(-20)));
            await db.SaveChangesAsync();

            (await RunAsync(db, sender)).Should().Be(1);
        }

        [Fact]
        public async Task Sucesso_GravaLastSentAt()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(1)));
            await db.SaveChangesAsync();
            var before = DateTime.UtcNow;

            await RunAsync(db, new Sender());

            var state = await db.AdminDigestStates.SingleAsync();
            state.LastSentAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(DateTime.UtcNow);
            state.LastSentCount.Should().Be(1);
        }

        [Fact]
        public async Task PrimeiroEnvio_CriaRegistro()
        {
            using var db = CreateContext();
            db.ContactMessages.Add(NewMessage(DateTime.UtcNow.AddHours(-1)));
            await db.SaveChangesAsync();

            await RunAsync(db, new Sender());

            (await db.AdminDigestStates.SingleAsync()).Key.Should().Be(AdminDigestState.PendingContactsKey);
        }

        [Fact]
        public async Task Falha_NaoGravaEstado()
        {
            using var db = CreateContext();
            await SeedLastDigestAsync(db);
            db.ContactMessages.Add(NewMessage(LastDigest.AddHours(1)));
            await db.SaveChangesAsync();
            var sender = new Sender { Failure = new InvalidOperationException("boom") };

            var act = () => RunAsync(db, sender);

            await act.Should().ThrowAsync<InvalidOperationException>();
            (await db.AdminDigestStates.SingleAsync()).LastSentAt.Should().Be(LastDigest);
        }
    }
}
