using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.HouseMembers.Services;
using Batuara.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.HouseMembers
{
    public class MemberBroadcastServiceTests
    {
        private static BatuaraDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new BatuaraDbContext(options);
        }

        private static MemberBroadcastService CreateService(BatuaraDbContext db, FakeWhatsAppService whatsApp) =>
            new(
                db,
                whatsApp,
                Options.Create(new WhatsAppCloudApiOptions()),
                Options.Create(new MemberBroadcastOptions()),
                NullLogger<MemberBroadcastService>.Instance,
                TimeSpan.Zero);

        private static HouseMember NewMember(string name, string? phone, bool active = true, bool optIn = true)
        {
            var member = new HouseMember(name, null, null, null, null, null, null, phone, null, null, null, null, null, null, null);
            if (!active)
            {
                member.Deactivate();
            }

            if (optIn)
            {
                member.RegisterWhatsAppOptIn(DateTime.UtcNow, "teste");
            }

            return member;
        }

        private sealed class FakeWhatsAppService : IWhatsAppService
        {
            public List<string> SentPhones { get; } = new();
            public List<string> TutorialPhones { get; } = new();
            public HashSet<string> FailFor { get; } = new();

            private string Track(List<string> list, string phone)
            {
                if (FailFor.Contains(phone))
                {
                    throw new InvalidOperationException("falha simulada");
                }

                list.Add(phone);
                return "wamid-" + phone;
            }

            public Task<string> SendAuthCodeAsync(string p, string c, CancellationToken ct = default) => Task.FromResult("id");
            public Task SendContributionReminderAsync(string p, string n, DateTime d, decimal a, CancellationToken ct = default) => Task.CompletedTask;
            public Task<string> SendContactResponseAsync(string p, string t, CancellationToken ct = default) => Task.FromResult("id");
            public Task SendAdminNotificationAsync(string p, int c, CancellationToken ct = default) => Task.CompletedTask;
            public Task SendBirthdayGreetingAsync(string p, string n, CancellationToken ct = default) => Task.CompletedTask;
            public Task SendEventInviteAsync(string p, string n, string e, string d, CancellationToken ct = default) => Task.CompletedTask;
            public Task<string> SendMemberNoticeAsync(string p, string n, string t, CancellationToken ct = default) => Task.FromResult(Track(SentPhones, p));
            public Task<string> SendSiteTutorialLinkAsync(string p, string n, string u, CancellationToken ct = default) => Task.FromResult(Track(TutorialPhones, p));
        }

        [Fact]
        public async Task Preview_ContaElegiveisEExclusoes()
        {
            var db = CreateContext();
            db.HouseMembers.AddRange(
                NewMember("Ativo OptIn", "11999990001"),
                NewMember("Sem Fone", null),
                NewMember("Sem OptIn", "11999990003", optIn: false),
                NewMember("Inativo", "11999990004", active: false));
            await db.SaveChangesAsync();

            var preview = await CreateService(db, new FakeWhatsAppService()).PreviewAsync(MemberBroadcastService.SiteLaunchCampaign);

            Assert.Equal(1, preview.EligibleCount);
            Assert.Equal(1, preview.ExcludedNoPhone);
            Assert.Equal(1, preview.ExcludedNoOptIn);
            Assert.Equal(1, preview.ExcludedInactive);
            Assert.Single(preview.Items);
        }

        [Fact]
        public async Task Send_SemConfirmacao_Falha()
        {
            var db = CreateContext();
            await Assert.ThrowsAsync<ArgumentException>(() =>
                CreateService(db, new FakeWhatsAppService()).SendAsync(MemberBroadcastService.SiteLaunchCampaign, false, null));
        }

        [Fact]
        public async Task Send_CampanhaDesconhecida_Falha()
        {
            var db = CreateContext();
            await Assert.ThrowsAsync<ArgumentException>(() =>
                CreateService(db, new FakeWhatsAppService()).SendAsync("campanha-x", true, null));
            await Assert.ThrowsAsync<ArgumentException>(() =>
                CreateService(db, new FakeWhatsAppService()).PreviewAsync("campanha-x"));
        }

        [Fact]
        public async Task Send_EnviaSoElegiveisERegistraEntrega()
        {
            var db = CreateContext();
            db.HouseMembers.AddRange(
                NewMember("Filho Um", "11999990001"),
                NewMember("Filho Dois", "11999990002"),
                NewMember("Sem OptIn", "11999990003", optIn: false),
                NewMember("Inativo", "11999990004", active: false));
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var result = await CreateService(db, whatsApp).SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);

            Assert.Equal(2, result.Sent);
            Assert.Equal(0, result.Failed);
            Assert.Equal(2, whatsApp.SentPhones.Count);
            Assert.Contains("5511999990001", whatsApp.SentPhones);
            Assert.Equal(2, await db.MemberBroadcastDeliveries.CountAsync(x => x.Status == MemberBroadcastStatus.Sent));
        }

        [Fact]
        public async Task Send_Idempotente_PulaJaEnviados()
        {
            var db = CreateContext();
            db.HouseMembers.AddRange(NewMember("Filho Um", "11999990001"), NewMember("Filho Dois", "11999990002"));
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var service = CreateService(db, whatsApp);
            await service.SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);
            var segundo = await service.SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);

            Assert.Equal(0, segundo.Sent);
            Assert.Equal(2, segundo.SkippedAlreadySent);
            Assert.Equal(2, whatsApp.SentPhones.Count);
        }

        [Fact]
        public async Task Send_MemberIds_RestringeDestinatarios()
        {
            var db = CreateContext();
            var alvo = NewMember("Alvo", "11999990001");
            var fora = NewMember("Fora", "11999990002");
            db.HouseMembers.AddRange(alvo, fora);
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var result = await CreateService(db, whatsApp)
                .SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, new[] { alvo.Id });

            Assert.Equal(1, result.Sent);
            Assert.Single(whatsApp.SentPhones);
            Assert.Equal("5511999990001", whatsApp.SentPhones[0]);
        }

        [Fact]
        public async Task Send_FalhaParcial_RegistraErroESegue()
        {
            var db = CreateContext();
            db.HouseMembers.AddRange(NewMember("Ok", "11999990001"), NewMember("Erro", "11999990002"), NewMember("Ok2", "11999990003"));
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            whatsApp.FailFor.Add("5511999990002");
            var result = await CreateService(db, whatsApp).SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);

            Assert.Equal(2, result.Sent);
            Assert.Equal(1, result.Failed);
            Assert.Single(result.Errors);
            Assert.Equal(1, await db.MemberBroadcastDeliveries.CountAsync(x => x.Status == MemberBroadcastStatus.Failed));
        }

        [Fact]
        public async Task Send_FalhadoPodeSerReenviado()
        {
            var db = CreateContext();
            db.HouseMembers.Add(NewMember("Filho", "11999990001"));
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            whatsApp.FailFor.Add("5511999990001");
            var service = CreateService(db, whatsApp);
            await service.SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);

            whatsApp.FailFor.Clear();
            var retry = await service.SendAsync(MemberBroadcastService.SiteLaunchCampaign, true, null);

            Assert.Equal(1, retry.Sent);
        }

        [Fact]
        public async Task Send_Tutorial_UsaTemplateTutorial()
        {
            var db = CreateContext();
            db.HouseMembers.Add(NewMember("Filho", "11999990001"));
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var result = await CreateService(db, whatsApp).SendAsync(MemberBroadcastService.SiteTutorialCampaign, true, null);

            Assert.Equal(1, result.Sent);
            Assert.Empty(whatsApp.SentPhones);
            Assert.Single(whatsApp.TutorialPhones);
        }
    }
}
