using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.MemberAuth.Models;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Auth.Services;
using Batuara.Infrastructure.Bingo.Services;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.HouseMembers.Services;
using Batuara.Infrastructure.MemberAuth.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.Bingo
{
    public class BingoServiceTests
    {
        private class FakeConfig : Microsoft.Extensions.Configuration.IConfiguration
        {
            public string? this[string key]
            {
                get => key == "JwtSettings:Secret" ? "test-secret-key-with-at-least-32-characters-long" : null;
                set { }
            }

            public IEnumerable<Microsoft.Extensions.Configuration.IConfigurationSection> GetChildren() => Array.Empty<Microsoft.Extensions.Configuration.IConfigurationSection>();
            public Microsoft.Extensions.Primitives.IChangeToken GetReloadToken() => throw new NotSupportedException();
            public Microsoft.Extensions.Configuration.IConfigurationSection GetSection(string key) => throw new NotSupportedException();
        }

        private class FakeWhatsApp : IWhatsAppService
        {
            public bool Fail { get; set; }
            public string? LastCode { get; private set; }
            public List<string> Codes { get; } = new();
            public HashSet<string> FailNoticePhones { get; } = new();
            public List<(string Phone, string Name, string Text)> Notices { get; } = new();

            public Task<string> SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
            {
                LastCode = code;
                Codes.Add(code);
                if (Fail)
                {
                    throw new InvalidOperationException("WhatsApp fora do ar");
                }

                return Task.FromResult("code-msg-id");
            }

            public Task<string> SendMemberNoticeAsync(string phoneE164, string memberName, string noticeText, CancellationToken cancellationToken = default)
            {
                Notices.Add((phoneE164, memberName, noticeText));
                if (Fail || FailNoticePhones.Contains(phoneE164))
                {
                    throw new InvalidOperationException("WhatsApp fora do ar");
                }

                return Task.FromResult("notice-msg-id");
            }

            public Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default) => Task.FromResult(Guid.NewGuid().ToString());
            public Task SendAdminNotificationAsync(string phoneE164, int pendingCount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendBirthdayGreetingAsync(string phoneE164, string memberName, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendEventInviteAsync(string phoneE164, string memberName, string eventName, string eventDate, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendSiteTutorialLinkAsync(string phoneE164, string memberName, string tutorialUrl, CancellationToken cancellationToken = default) => Task.CompletedTask;
        }

        private class RecordingDispatcher : IBingoCodeDispatcher
        {
            public List<(Guid TabId, string Phone, string Code)> Sent { get; } = new();

            public void Dispatch(Guid tabId, string phone, string code)
            {
                Sent.Add((tabId, phone, code));
            }
        }

        private class Fixture
        {
            public string DbName { get; } = Guid.NewGuid().ToString();
            public BatuaraDbContext Db { get; }
            public RecordingDispatcher Dispatcher { get; } = new();
            public FakeWhatsApp WhatsApp { get; } = new();
            public BingoPublicService Public { get; }
            public BingoAdminService Admin { get; }
            public BingoWaiterService Waiter { get; }
            public PasswordService Passwords { get; } = new(Options.Create(new PasswordRequirements()));
            public int CashId { get; private set; }
            public int PixId { get; private set; }
            public int CardId { get; private set; }
            public int DebitId { get; private set; }

            public Fixture()
            {
                Db = CreateDb(DbName);
                var jwt = new JwtService(
                    Options.Create(new JwtSettings
                    {
                        Secret = "test-secret-key-with-at-least-32-characters-long",
                        Issuer = "batuara-tests",
                        Audience = "batuara-tests",
                        AccessTokenExpirationMinutes = 60,
                        RefreshTokenExpirationDays = 7
                    }),
                    NullLogger<JwtService>.Instance);
                var memberAuth = new MemberAuthService(Db, Passwords, jwt, WhatsApp, NullLogger<MemberAuthService>.Instance);

                Public = new BingoPublicService(Db, Dispatcher, Passwords, Options.Create(new BingoOptions()));
                Admin = new BingoAdminService(Db);
                Waiter = new BingoWaiterService(Db);

                var cash = new BingoPaymentOption("Dinheiro", true, 1);
                var pix = new BingoPaymentOption("Pix", true, 2);
                var card = new BingoPaymentOption("Cartão de crédito", true, 3);
                var debit = new BingoPaymentOption("Cartão de débito", true, 4);
                Db.BingoPaymentOptions.AddRange(cash, pix, card, debit);
                Db.SaveChanges();
                CashId = cash.Id;
                PixId = pix.Id;
                CardId = card.Id;
                DebitId = debit.Id;
            }

            public Task PayAdminAsync(Guid tabId, int? methodId = null)
                => Admin.PayTabsAsync("Admin Teste", new BingoAdminPayRequest { TabIds = new List<Guid> { tabId }, PaymentMethodId = methodId ?? PixId });

            public async Task DeliverAllAsync(Guid tabId)
            {
                var ids = await Db.BingoOrderItems.Where(x => x.TabId == tabId && (x.Status == BingoOrderItemStatus.Pending || x.Status == BingoOrderItemStatus.Retrieved)).Select(x => x.Id).ToListAsync();
                foreach (var id in ids)
                {
                    await Admin.DeliverItemAsync("Admin Teste", id);
                }
            }

            public static BatuaraDbContext CreateDb(string name)
            {
                var options = new DbContextOptionsBuilder<BatuaraDbContext>().UseInMemoryDatabase(name).Options;
                var db = new BatuaraDbContext(options);
                db.Database.EnsureCreated();
                return db;
            }

            public async Task<int> CreateMemberAsync(string phone, string name = "Filho Garcom")
            {
                var (created, _, _) = await new HouseMemberService(Db).CreateAsync(new CreateHouseMemberRequest
                {
                    FullName = name,
                    BirthDate = DateTime.UtcNow.Date.AddYears(-30),
                    EntryDate = DateTime.UtcNow.Date.AddYears(-1),
                    MobilePhone = phone,
                    Contributions = new List<HouseMemberContributionInput>()
                });
                return created!.Id;
            }

            public async Task<int> OpenEventAsync(int eventId = 1)
            {
                await Admin.OpenEventAsync(eventId);
                return eventId;
            }

            public async Task<int> ScheduleWaiterAsync(string phone = "11911112222")
            {
                var memberId = await CreateMemberAsync(phone);
                await Admin.AddWaiterAsync(null, memberId);
                return memberId;
            }

            public Task<BingoCreateTabResult> NewTabAsync(string phone = "11999990001", int mesa = 1, string name = "Maria da Silva")
                => Public.CreateTabAsync(new BingoCreateTabRequest { CustomerName = name, Phone = phone, Mesa = mesa });

            public async Task<int> MenuIdAsync(string name, int eventId = 1)
                => (await Db.BingoMenuItems.FirstAsync(x => x.EventId == eventId && x.Name == name)).Id;

            public async Task OrderAsync(Guid tabId, string itemName, int quantity)
                => await Public.AddItemsAsync(tabId, new BingoAddItemsRequest
                {
                    Items = new List<BingoOrderLineRequest> { new() { MenuItemId = await MenuIdAsync(itemName), Quantity = quantity } }
                });
        }

        private static async Task ShouldThrowAsync(Func<Task> act, BingoErrorKind kind)
        {
            var ex = await act.Should().ThrowAsync<BingoException>();
            ex.Which.Kind.Should().Be(kind);
        }

        [Fact]
        public async Task Seed_Should_Provide_Two_Draft_Events_With_Menu_And_Tables()
        {
            var f = new Fixture();
            var events = await f.Admin.GetEventsAsync();

            events.Should().HaveCount(2);
            events.Should().OnlyContain(e => e.Status == BingoEventStatus.Draft);
            events.Single(e => e.IsTest).Name.Should().Be("Teste");
            (await f.Admin.GetMenuAsync(1)).Should().HaveCount(16);
            (await f.Admin.GetMenuAsync(2)).Should().HaveCount(16);
            (await f.Admin.GetTablesAsync(1)).Quantidade.Should().Be(30);
            (await f.Admin.GetSettingsAsync(null)).EventId.Should().Be(1);
            (await f.Public.GetInfoAsync()).IsOpen.Should().BeFalse();
        }

        [Fact]
        public async Task CreateTab_Should_Reuse_Open_Tab_For_Same_Phone()
        {
            var f = new Fixture();
            await f.OpenEventAsync();

            var first = await f.NewTabAsync("(11) 99999-0001", 3);
            var second = await f.NewTabAsync("11999990001", 5, "Outro Nome");

            first.Reused.Should().BeFalse();
            second.Reused.Should().BeTrue();
            second.TabId.Should().Be(first.TabId);
            (await f.Db.BingoTabs.CountAsync()).Should().Be(1);
            (await f.Public.GetTabAsync(first.TabId)).Mesa.Should().Be(3);
        }

        [Fact]
        public async Task CreateTab_After_Payment_Should_Open_A_New_Tab()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var first = await f.NewTabAsync();
            await f.PayAdminAsync(first.TabId, f.PixId);

            var second = await f.NewTabAsync();

            second.Reused.Should().BeFalse();
            second.TabId.Should().NotBe(first.TabId);
        }

        [Fact]
        public async Task CreateTab_Should_Be_Refused_When_No_Event_Is_Open()
        {
            var f = new Fixture();

            await ShouldThrowAsync(() => f.NewTabAsync(), BingoErrorKind.Conflict);

            await f.OpenEventAsync();
            await f.Admin.CloseEventAsync(1);
            await ShouldThrowAsync(() => f.NewTabAsync(), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task CreateTab_With_Unknown_Table_Should_Fail()
        {
            var f = new Fixture();
            await f.OpenEventAsync();

            await ShouldThrowAsync(() => f.NewTabAsync(mesa: 99), BingoErrorKind.Validation);
        }

        [Fact]
        public async Task AddItems_Should_Reject_Sold_Out_Item()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var menuId = await f.MenuIdAsync("Salada");
            await f.Admin.SetMenuItemAvailabilityAsync(menuId, false);

            await ShouldThrowAsync(() => f.OrderAsync(tab.TabId, "Salada", 1), BingoErrorKind.Conflict);
            (await f.Db.BingoOrderItems.CountAsync()).Should().Be(0);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(21)]
        [InlineData(-3)]
        public async Task AddItems_Should_Reject_Invalid_Quantity(int quantity)
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();

            await ShouldThrowAsync(() => f.OrderAsync(tab.TabId, "Água", quantity), BingoErrorKind.Validation);
        }

        [Fact]
        public async Task AddItems_Should_Reject_Paid_Tab_And_Closed_Event()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var paid = await f.NewTabAsync("11999990001");
            var open = await f.NewTabAsync("11999990002");
            await f.PayAdminAsync(paid.TabId, f.CashId);

            await ShouldThrowAsync(() => f.OrderAsync(paid.TabId, "Água", 1), BingoErrorKind.Conflict);

            await f.Admin.CloseEventAsync(1);
            await ShouldThrowAsync(() => f.OrderAsync(open.TabId, "Água", 1), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task AddItems_Should_Snapshot_Price()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 2);

            var menuId = await f.MenuIdAsync("Cachorro-quente");
            await f.Admin.UpdateMenuItemAsync(menuId, new BingoMenuItemRequest { Name = "Cachorro-quente", UnitPrice = 12.50m, IsAvailable = true });
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 1);

            var view = await f.Public.GetTabAsync(tab.TabId);
            view.Items.Select(i => i.UnitPrice).Should().Equal(10m, 12.50m);
            view.Total.Should().Be(32.50m);
            view.Menu.Single(m => m.Name == "Cachorro-quente").UnitPrice.Should().Be(12.50m);
        }

        [Fact]
        public async Task RequestClose_Should_Mark_Tab_And_Refuse_Paid()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();

            await f.Public.RequestCloseAsync(tab.TabId);
            (await f.Public.GetTabAsync(tab.TabId)).Status.Should().Be(BingoTabStatus.CloseRequested);

            await f.PayAdminAsync(tab.TabId, f.CardId);
            await ShouldThrowAsync(() => f.Public.RequestCloseAsync(tab.TabId), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task CancelClose_Should_Reopen_Tab_And_Refuse_Paid()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();

            await f.Public.RequestCloseAsync(tab.TabId);
            await f.Public.CancelCloseAsync(tab.TabId);
            (await f.Public.GetTabAsync(tab.TabId)).Status.Should().Be(BingoTabStatus.Open);

            await f.Public.RequestCloseAsync(tab.TabId);
            await f.PayAdminAsync(tab.TabId, f.CardId);
            await ShouldThrowAsync(() => f.Public.CancelCloseAsync(tab.TabId), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Waiter_Should_Retrieve_Return_And_Deliver_From_Any_State()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var ana = await f.ScheduleWaiterAsync("11911112222");
            var bia = await f.CreateMemberAsync("11933334444", "Bia Garcom");
            await f.Admin.AddWaiterAsync(null, bia);
            var tab = await f.NewTabAsync(mesa: 5);
            await f.OrderAsync(tab.TabId, "Água", 2);
            await f.OrderAsync(tab.TabId, "Salada", 1);
            await f.OrderAsync(tab.TabId, "Refrigerante", 1);
            var ids = (await f.Waiter.GetOrdersAsync(ana))[0].Items.Select(i => i.Id).ToList();

            await f.Waiter.RetrieveAsync(ana, ids[0]);
            await ShouldThrowAsync(() => f.Waiter.RetrieveAsync(bia, ids[0]), BingoErrorKind.Conflict);
            var ex = await Assert.ThrowsAsync<BingoException>(() => f.Waiter.RetrieveAsync(bia, ids[0]));
            ex.Message.Should().Contain("já retirado por Filho Garcom");
            await ShouldThrowAsync(() => f.Waiter.RetrieveAsync(ana, 9999), BingoErrorKind.NotFound);

            var mine = (await f.Waiter.GetOrdersAsync(ana))[0].Items;
            mine.Should().HaveCount(3);
            mine.Single(i => i.Id == ids[0]).Status.Should().Be(BingoOrderItemStatus.Retrieved);
            mine.Single(i => i.Id == ids[0]).RetrievedByMe.Should().BeTrue();
            mine.Single(i => i.Id == ids[0]).RetrievedByName.Should().Be("Filho Garcom");
            mine.Single(i => i.Id == ids[1]).Status.Should().Be(BingoOrderItemStatus.Pending);
            mine.Single(i => i.Id == ids[1]).RetrievedByName.Should().BeNull();
            var theirs = (await f.Waiter.GetOrdersAsync(bia))[0].Items.Single(i => i.Id == ids[0]);
            theirs.RetrievedByMe.Should().BeFalse();
            theirs.RetrievedByName.Should().Be("Filho Garcom");

            var panel = await f.Admin.GetPanelAsync(null);
            panel.Counts.RetrievedItems.Should().Be(1);
            panel.Counts.PendingItems.Should().Be(2);
            panel.RetrievedByTable.Should().ContainSingle().Which.Should().BeEquivalentTo(new BingoRetrievedByTableDto { Mesa = 5, RetrievedItems = 2 });
            panel.PendingByTable.Single().PendingItems.Should().Be(2);
            panel.Tabs.Single().Items.Select(i => i.Status).Should().Contain(BingoOrderItemStatus.Retrieved);
            (await f.Public.GetTabAsync(tab.TabId)).Items.Count(i => i.Status == BingoOrderItemStatus.Retrieved).Should().Be(1);

            // outro garcom devolve; volta a Pending e limpa a retirada
            await f.Waiter.ReturnAsync(ids[0]);
            var back = await f.Db.BingoOrderItems.AsNoTracking().FirstAsync(x => x.Id == ids[0]);
            back.Status.Should().Be(BingoOrderItemStatus.Pending);
            back.RetrievedByHouseMemberId.Should().BeNull();
            back.RetrievedAt.Should().BeNull();

            // entregar a partir de Retrieved e de Pending, por garcom diferente de quem retirou
            await f.Waiter.RetrieveAsync(ana, ids[1]);
            await f.Waiter.DeliverAsync(bia, ids[1]);
            await f.Waiter.DeliverAsync(bia, ids[2]);
            var d = await f.Db.BingoOrderItems.AsNoTracking().FirstAsync(x => x.Id == ids[1]);
            d.Status.Should().Be(BingoOrderItemStatus.Delivered);
            d.DeliveredByHouseMemberId.Should().Be(bia);

            // entregue nao volta nem e retirado de novo; entregar de novo e idempotente
            await ShouldThrowAsync(() => f.Waiter.ReturnAsync(ids[1]), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Waiter.RetrieveAsync(ana, ids[1]), BingoErrorKind.Conflict);
            await f.Waiter.DeliverAsync(ana, ids[1]);
            (await f.Db.BingoOrderItems.AsNoTracking().FirstAsync(x => x.Id == ids[1])).DeliveredByHouseMemberId.Should().Be(bia);
            (await f.Waiter.GetOrdersAsync(ana))[0].Items.Should().ContainSingle().Which.Id.Should().Be(ids[0]);
        }

        [Fact]
        public async Task Waiter_Not_Scheduled_Should_Be_Blocked()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var outsider = await f.CreateMemberAsync("11955556666", "Fora da escala");
            await ShouldThrowAsync(() => f.Waiter.EnsureAccessAsync(outsider), BingoErrorKind.Unauthorized);
        }

        [Fact]
        public async Task Waiter_Should_Deliver_Item_And_Record_Who_And_When()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync(mesa: 4);
            await f.OrderAsync(tab.TabId, "Água", 2);
            await f.OrderAsync(tab.TabId, "Salada", 1);

            var orders = await f.Waiter.GetOrdersAsync(waiterId);
            orders.Should().ContainSingle();
            orders[0].Mesa.Should().Be(4);
            orders[0].Items.Should().HaveCount(2);

            await f.Waiter.DeliverAsync(waiterId, orders[0].Items[0].Id);

            var delivered = await f.Db.BingoOrderItems.FirstAsync(x => x.Id == orders[0].Items[0].Id);
            delivered.Status.Should().Be(BingoOrderItemStatus.Delivered);
            delivered.DeliveredByHouseMemberId.Should().Be(waiterId);
            delivered.DeliveredAt.Should().NotBeNull();
            (await f.Waiter.GetOrdersAsync(waiterId))[0].Items.Should().ContainSingle();
            (await f.Admin.GetWaitersAsync(null)).Single().Deliveries.Should().Be(1);
            await ShouldThrowAsync(() => f.Waiter.DeliverAsync(waiterId, 9999), BingoErrorKind.NotFound);
        }

        [Fact]
        public async Task Waiter_Should_Correct_Table()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync(mesa: 2);

            await f.Waiter.ChangeTableAsync(tab.TabId, 9);

            (await f.Public.GetTabAsync(tab.TabId)).Mesa.Should().Be(9);
            await ShouldThrowAsync(() => f.Waiter.ChangeTableAsync(tab.TabId, 500), BingoErrorKind.Validation);
        }

        [Fact]
        public async Task Waiter_Should_Pay_Several_Tabs_Of_The_Same_Table_Together()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            var a = await f.NewTabAsync("11999990001", 6);
            var b = await f.NewTabAsync("11999990002", 6, "Joao");
            var c = await f.NewTabAsync("11999990003", 7, "Ana");
            await f.OrderAsync(a.TabId, "Refrigerante", 2);
            await f.OrderAsync(b.TabId, "Cerveja Heineken", 1);
            await f.DeliverAllAsync(a.TabId);
            await f.DeliverAllAsync(b.TabId);
            await f.Public.RequestCloseAsync(a.TabId);
            await f.Public.RequestCloseAsync(b.TabId);

            (await f.Waiter.GetAccountsAsync()).Select(x => x.TabId).Should().BeEquivalentTo(new[] { a.TabId, b.TabId });

            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiterId, new BingoPayRequest
            {
                TabIds = new List<Guid> { a.TabId, c.TabId },
                PaymentMethodId = f.PixId
            }), BingoErrorKind.Validation);

            var result = await f.Waiter.PayAsync(waiterId, new BingoPayRequest
            {
                TabIds = new List<Guid> { a.TabId, b.TabId },
                PaymentMethodId = f.CardId
            });

            result.PaidCount.Should().Be(2);
            result.Total.Should().Be(23m);
            var tabs = await f.Db.BingoTabs.Where(x => x.Id == a.TabId || x.Id == b.TabId).ToListAsync();
            tabs.Should().OnlyContain(t => t.Status == BingoTabStatus.Paid && t.PaymentMethodName == "Cartão de crédito" && t.AmountPaid > 0 && t.PaidByName == "Filho Garcom" && t.PaidByHouseMemberId == waiterId && t.PaidAt != null);
            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiterId, new BingoPayRequest { TabIds = new List<Guid> { a.TabId }, PaymentMethodId = f.CashId }), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task CloseAll_Should_Show_All_Unpaid_Tabs_To_Waiters_And_Flag_Customers()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var open = await f.NewTabAsync("11999990001", 1);
            var paid = await f.NewTabAsync("11999990002", 2);
            await f.PayAdminAsync(paid.TabId, f.CashId);

            (await f.Waiter.GetAccountsAsync()).Should().BeEmpty();
            (await f.Public.GetTabAsync(open.TabId)).CloseAllRequested.Should().BeFalse();

            await f.Admin.UpdateSettingsAsync(null, new BingoUpdateSettingsRequest { CloseAllRequested = true });

            var accounts = await f.Waiter.GetAccountsAsync();
            accounts.Should().ContainSingle();
            accounts[0].TabId.Should().Be(open.TabId);
            (await f.Public.GetTabAsync(open.TabId)).CloseAllRequested.Should().BeTrue();
            (await f.Public.GetInfoAsync()).CloseAllRequested.Should().BeTrue();
        }

        [Fact]
        public async Task Waiter_Access_Should_Require_Active_Schedule_And_Update_LastSeen()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var outsider = await f.CreateMemberAsync("11977770000", "Nao Escalado");
            var waiterId = await f.ScheduleWaiterAsync();

            await ShouldThrowAsync(() => f.Waiter.EnsureAccessAsync(outsider), BingoErrorKind.Unauthorized);

            await f.Waiter.EnsureAccessAsync(waiterId);
            (await f.Admin.GetWaitersAsync(null)).Single().LastSeenAt.Should().NotBeNull();
            (await f.Admin.GetWaitersAsync(null)).Single().Connected.Should().BeTrue();
        }

        [Fact]
        public async Task Removing_Waiter_Should_Invalidate_Access()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            await f.Waiter.EnsureAccessAsync(waiterId);

            await f.Admin.RemoveWaiterAsync(null, waiterId);

            await ShouldThrowAsync(() => f.Waiter.EnsureAccessAsync(waiterId), BingoErrorKind.Unauthorized);
            await ShouldThrowAsync(() => f.Admin.RemoveWaiterAsync(null, waiterId), BingoErrorKind.NotFound);
        }

        [Fact]
        public async Task Ending_Sessions_Should_Invalidate_Access_And_Allow_Rescheduling()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync();

            (await f.Admin.EndWaiterSessionsAsync(null)).Should().Be(1);
            await ShouldThrowAsync(() => f.Waiter.EnsureAccessAsync(waiterId), BingoErrorKind.Unauthorized);

            await f.Admin.AddWaiterAsync(null, waiterId);
            await f.Waiter.EnsureAccessAsync(waiterId);
        }

        [Fact]
        public async Task Closing_Event_Should_Invalidate_Waiters()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            await f.Waiter.EnsureAccessAsync(waiterId);

            await f.Admin.CloseEventAsync(1);

            await ShouldThrowAsync(() => f.Waiter.EnsureAccessAsync(waiterId), BingoErrorKind.Unauthorized);
        }

        private static MemberAuthService CreateMemberAuth(Fixture f, BingoOptions? options = null)
        {
            var jwt = new JwtService(
                Options.Create(new JwtSettings
                {
                    Secret = "test-secret-key-with-at-least-32-characters-long",
                    Issuer = "batuara-tests",
                    Audience = "batuara-tests",
                    AccessTokenExpirationMinutes = 60,
                    RefreshTokenExpirationDays = 7
                }), NullLogger<JwtService>.Instance);
            return new MemberAuthService(f.Db, f.Passwords, jwt, f.WhatsApp, NullLogger<MemberAuthService>.Instance, Options.Create(options ?? new BingoOptions()));
        }

        private static async Task<MemberLoginResponse> LoginAsync(Fixture f, MemberAuthService auth, string phone)
        {
            await auth.RequestCodeAsync(new MemberRequestCodeRequest { MobilePhone = phone }, null);
            return await auth.VerifyCodeAsync(new MemberVerifyCodeRequest { MobilePhone = phone, Code = f.WhatsApp.LastCode! });
        }

        [Fact]
        public async Task Normal_Login_Should_Issue_Ten_Hour_Token_Only_For_Scheduled_Waiters()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync("11911112222");
            await f.CreateMemberAsync("11922223333", "Nao Escalado");
            var auth = CreateMemberAuth(f);

            var other = await LoginAsync(f, auth, "11922223333");
            (other.ExpiresAt - DateTime.UtcNow).Should().BeCloseTo(TimeSpan.FromMinutes(60), TimeSpan.FromMinutes(1));

            var login = await LoginAsync(f, auth, "11911112222");
            login.User.Name.Should().Be("Filho Garcom");
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(login.Token);
            jwt.Claims.Should().Contain(c => c.Type == "houseMemberId" && c.Value == waiterId.ToString());
            (login.ExpiresAt - DateTime.UtcNow).Should().BeCloseTo(TimeSpan.FromHours(10), TimeSpan.FromMinutes(1));
        }

        [Fact]
        public async Task Normal_Login_Should_Honor_Configured_Waiter_Hours_And_Ignore_Closed_Events()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            await f.ScheduleWaiterAsync("11911112222");

            var login = await LoginAsync(f, CreateMemberAuth(f, new BingoOptions { WaiterSessionHours = 4 }), "11911112222");
            (login.ExpiresAt - DateTime.UtcNow).Should().BeCloseTo(TimeSpan.FromHours(4), TimeSpan.FromMinutes(1));

            await f.Admin.CloseEventAsync(1);
            var after = await LoginAsync(f, CreateMemberAuth(f), "11911112222");
            (after.ExpiresAt - DateTime.UtcNow).Should().BeCloseTo(TimeSpan.FromMinutes(60), TimeSpan.FromMinutes(1));
        }

        [Fact]
        public async Task Me_Should_Report_Scheduled_Not_Scheduled_And_No_Open_Event()
        {
            var f = new Fixture();

            var none = await f.Waiter.GetMeAsync(1);
            none.IsWaiter.Should().BeFalse();
            none.EventOpen.Should().BeFalse();
            none.EventName.Should().BeNull();

            await f.OpenEventAsync();
            var waiterId = await f.ScheduleWaiterAsync("11911112222");
            var outsider = await f.CreateMemberAsync("11922223333", "Nao Escalado");

            var yes = await f.Waiter.GetMeAsync(waiterId);
            yes.IsWaiter.Should().BeTrue();
            yes.EventOpen.Should().BeTrue();
            yes.EventName.Should().NotBeNullOrEmpty();

            var no = await f.Waiter.GetMeAsync(outsider);
            no.IsWaiter.Should().BeFalse();
            no.EventOpen.Should().BeTrue();

            await f.Admin.RemoveWaiterAsync(null, waiterId);
            (await f.Waiter.GetMeAsync(waiterId)).IsWaiter.Should().BeFalse();
        }

        private static BingoPublicService PublicWith(Fixture f, BingoOptions options)
            => new(f.Db, f.Dispatcher, f.Passwords, Options.Create(options));

        private async Task<BingoTab> StoredTabAsync(Fixture f)
        {
            f.Db.ChangeTracker.Clear();
            return await f.Db.BingoTabs.FirstAsync();
        }

        [Fact]
        public async Task CreateTab_Should_Dispatch_Code_And_Not_Resend_On_Reopen()
        {
            var f = new Fixture();
            await f.OpenEventAsync();

            var tab = await f.NewTabAsync("(11) 99999-0001");

            f.Dispatcher.Sent.Should().ContainSingle();
            var sent = f.Dispatcher.Sent[0];
            sent.TabId.Should().Be(tab.TabId);
            sent.Phone.Should().Be("5511999990001");
            sent.Code.Should().MatchRegex("^[0-9]{6}$");

            var stored = await StoredTabAsync(f);
            stored.VerificationCodeHash.Should().NotBeNullOrEmpty().And.NotContain(sent.Code);
            f.Passwords.VerifyPassword(sent.Code, stored.VerificationCodeHash!).Should().BeTrue();
            stored.VerificationCodeExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(30), TimeSpan.FromMinutes(1));
            stored.IsPhoneVerified.Should().BeFalse();
            (await f.Public.GetTabAsync(tab.TabId)).PhoneVerified.Should().BeFalse();

            var again = await f.NewTabAsync("11999990001");
            again.Reused.Should().BeTrue();
            f.Dispatcher.Sent.Should().ContainSingle();
        }

        [Fact]
        public async Task Code_Dispatcher_Should_Record_MessageId_And_Never_Break_Creation_On_Failure()
        {
            var dbName = Guid.NewGuid().ToString();
            var whatsApp = new FakeWhatsApp { Fail = true };
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDbContext<BatuaraDbContext>(o => o.UseInMemoryDatabase(dbName));
            services.AddSingleton<IWhatsAppService>(whatsApp);
            var dispatcher = new BingoCodeDispatcher(services.BuildServiceProvider().GetRequiredService<IServiceScopeFactory>(), NullLogger<BingoCodeDispatcher>.Instance);

            var db = Fixture.CreateDb(dbName);
            await new BingoAdminService(db).OpenEventAsync(1);
            var passwords = new PasswordService(Options.Create(new PasswordRequirements()));
            var service = new BingoPublicService(db, dispatcher, passwords, Options.Create(new BingoOptions()));

            var tab = await service.CreateTabAsync(new BingoCreateTabRequest { CustomerName = "Maria", Phone = "11999990001", Mesa = 1 });

            tab.TabId.Should().NotBeEmpty();
            for (var i = 0; i < 100 && whatsApp.Codes.Count == 0; i++)
            {
                await Task.Delay(50);
            }

            whatsApp.Codes.Should().ContainSingle();
            for (var i = 0; i < 100; i++)
            {
                if ((await Fixture.CreateDb(dbName).BingoTabs.FirstAsync()).CodeDeliveryStatus != null)
                {
                    break;
                }

                await Task.Delay(50);
            }

            var failed = await Fixture.CreateDb(dbName).BingoTabs.FirstAsync();
            failed.CodeDeliveryStatus.Should().Be("Failed");
            failed.CodeMessageId.Should().BeNull();

            whatsApp.Fail = false;
            await dispatcher.SendAsync(tab.TabId, "5511999990001", "123456");
            var ok = await Fixture.CreateDb(dbName).BingoTabs.FirstAsync();
            ok.CodeDeliveryStatus.Should().Be("Sent");
            ok.CodeMessageId.Should().Be("code-msg-id");
        }

        [Fact]
        public async Task ConfirmPhone_Should_Accept_Right_Code()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();

            var result = await f.Public.ConfirmPhoneAsync(tab.TabId, f.Dispatcher.Sent[0].Code);

            result.Verified.Should().BeTrue();
            (await f.Public.GetTabAsync(tab.TabId)).PhoneVerified.Should().BeTrue();
            var stored = await StoredTabAsync(f);
            stored.PhoneVerifiedAt.Should().NotBeNull();
            stored.VerificationCodeHash.Should().BeNull();
        }

        [Fact]
        public async Task New_Tab_Of_Verified_Phone_Inherits_Verification_Without_New_Code()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var first = await f.NewTabAsync();
            await f.Public.ConfirmPhoneAsync(first.TabId, f.Dispatcher.Sent[0].Code);
            await f.PayAdminAsync(first.TabId, f.CardId);
            var sent = f.Dispatcher.Sent.Count;

            var second = await f.NewTabAsync(mesa: 2);

            second.TabId.Should().NotBe(first.TabId);
            (await f.Public.GetTabAsync(second.TabId)).PhoneVerified.Should().BeTrue();
            f.Dispatcher.Sent.Count.Should().Be(sent);
        }

        [Fact]
        public async Task Reopen_Reuses_Name_And_Phone_And_Only_Needs_Mesa()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var first = await f.NewTabAsync(name: "Maria da Silva");
            await f.Public.ConfirmPhoneAsync(first.TabId, f.Dispatcher.Sent[0].Code);
            await f.PayAdminAsync(first.TabId, f.CardId);

            var second = await f.Public.ReopenAsync(first.TabId, 2);

            second.TabId.Should().NotBe(first.TabId);
            var view = await f.Public.GetTabAsync(second.TabId);
            view.CustomerName.Should().Be("Maria da Silva");
            view.Mesa.Should().Be(2);
            view.PhoneVerified.Should().BeTrue();
        }

        [Fact]
        public async Task Exit_Check_By_Short_Code_Finds_The_Tab()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var code = tab.TabId.ToString("N").Substring(0, 6).ToUpperInvariant();

            var found = await f.Waiter.GetExitCheckByCodeAsync(code.Substring(0, 3) + " " + code.Substring(3));
            found.TabId.Should().Be(tab.TabId);
            await ShouldThrowAsync(() => f.Waiter.GetExitCheckByCodeAsync("12"), BingoErrorKind.Validation);
        }

        [Fact]
        public async Task Customer_Can_Cancel_Own_Item_Only_While_Pending()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            await f.OrderAsync(tab.TabId, "Salada", 1);
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 1);
            var items = (await f.Public.GetTabAsync(tab.TabId)).Items;

            await f.Public.CancelOwnItemAsync(tab.TabId, items[0].Id);
            (await f.Public.GetTabAsync(tab.TabId)).Items.Single(i => i.Id == items[0].Id).Status.Should().Be(BingoOrderItemStatus.Cancelled);

            await f.Waiter.RetrieveAsync(waiterId, items[1].Id);
            await ShouldThrowAsync(() => f.Public.CancelOwnItemAsync(tab.TabId, items[1].Id), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Contestation_Is_Listed_For_Waiters_And_Allowed_Only_Once_Per_Item()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var waiterId = await f.ScheduleWaiterAsync();
            await f.OrderAsync(tab.TabId, "Salada", 1);
            var item = (await f.Public.GetTabAsync(tab.TabId)).Items.Single();
            await f.Waiter.DeliverAsync(waiterId, item.Id);

            await f.Public.ContestItemAsync(tab.TabId, item.Id, "nao chegou");
            var list = await f.Waiter.GetContestationsAsync();
            list.Should().ContainSingle();
            list[0].ContestNote.Should().Be("nao chegou");
            list[0].DeliveredByName.Should().NotBeNullOrWhiteSpace();

            await f.Waiter.ResolveContestationAsync(waiterId, item.Id, new BingoResolveContestRequest { Action = BingoContestResolution.ConfirmDelivered });
            (await f.Waiter.GetContestationsAsync()).Should().BeEmpty();
            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, item.Id, "de novo"), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Exit_Check_Requires_Payment_And_Registers_Only_First_Release()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var waiterId = await f.ScheduleWaiterAsync();

            (await f.Waiter.GetExitCheckAsync(tab.TabId)).Paid.Should().BeFalse();
            await ShouldThrowAsync(() => f.Waiter.ReleaseExitAsync(waiterId, tab.TabId), BingoErrorKind.Conflict);

            await f.PayAdminAsync(tab.TabId, f.CardId);
            var first = await f.Waiter.ReleaseExitAsync(waiterId, tab.TabId);
            first.Paid.Should().BeTrue();
            first.ExitCheckedByName.Should().NotBeNullOrWhiteSpace();

            var again = await f.Waiter.ReleaseExitAsync(waiterId, tab.TabId);
            again.ExitCheckedAt.Should().Be(first.ExitCheckedAt);
        }

        [Fact]
        public async Task ConfirmPhone_Should_Reject_Wrong_Or_Expired_Code()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var code = f.Dispatcher.Sent[0].Code;
            var wrong = code == "000000" ? "111111" : "000000";

            await ShouldThrowAsync(() => f.Public.ConfirmPhoneAsync(tab.TabId, wrong), BingoErrorKind.Validation);
            (await StoredTabAsync(f)).VerificationAttempts.Should().Be(1);

            var stored = await f.Db.BingoTabs.FirstAsync();
            stored.IssueVerificationCode(f.Passwords.HashPassword(code), DateTime.UtcNow.AddHours(-1), TimeSpan.FromMinutes(30));
            await f.Db.SaveChangesAsync();

            await ShouldThrowAsync(() => f.Public.ConfirmPhoneAsync(tab.TabId, code), BingoErrorKind.Validation);
            (await f.Public.GetTabAsync(tab.TabId)).PhoneVerified.Should().BeFalse();
        }

        [Fact]
        public async Task ConfirmPhone_Should_Block_After_Five_Wrong_Attempts()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var code = f.Dispatcher.Sent[0].Code;
            var wrong = code == "000000" ? "111111" : "000000";

            for (var i = 0; i < 5; i++)
            {
                await ShouldThrowAsync(() => f.Public.ConfirmPhoneAsync(tab.TabId, wrong), BingoErrorKind.Validation);
            }

            await ShouldThrowAsync(() => f.Public.ConfirmPhoneAsync(tab.TabId, code), BingoErrorKind.TooManyRequests);
            (await StoredTabAsync(f)).VerificationAttempts.Should().Be(5);
        }

        [Fact]
        public async Task ResendCode_Should_Respect_Sixty_Second_Interval_And_Reset_Attempts()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var firstCode = f.Dispatcher.Sent[0].Code;

            await ShouldThrowAsync(() => f.Public.ResendCodeAsync(tab.TabId), BingoErrorKind.TooManyRequests);
            f.Dispatcher.Sent.Should().ContainSingle();

            var stored = await f.Db.BingoTabs.FirstAsync();
            stored.RegisterVerificationAttempt();
            stored.IssueVerificationCode(f.Passwords.HashPassword(firstCode), DateTime.UtcNow.AddSeconds(-90), TimeSpan.FromMinutes(30));
            stored.RegisterVerificationAttempt();
            await f.Db.SaveChangesAsync();

            await f.Public.ResendCodeAsync(tab.TabId);

            f.Dispatcher.Sent.Should().HaveCount(2);
            var refreshed = await StoredTabAsync(f);
            refreshed.VerificationAttempts.Should().Be(0);
            f.Passwords.VerifyPassword(f.Dispatcher.Sent[1].Code, refreshed.VerificationCodeHash!).Should().BeTrue();
            await ShouldThrowAsync(() => f.Public.ResendCodeAsync(tab.TabId), BingoErrorKind.TooManyRequests);
        }

        [Fact]
        public async Task ResendCode_Should_Limit_Three_Per_Hour_Per_Phone()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();

            var stored = await f.Db.BingoTabs.FirstAsync();
            stored.IssueVerificationCode("h", DateTime.UtcNow.AddMinutes(-10), TimeSpan.FromMinutes(30));
            stored.IssueVerificationCode("h", DateTime.UtcNow.AddMinutes(-5), TimeSpan.FromMinutes(30));
            await f.Db.SaveChangesAsync();
            (await StoredTabAsync(f)).CodeSendCount.Should().Be(3);

            await ShouldThrowAsync(() => f.Public.ResendCodeAsync(tab.TabId), BingoErrorKind.TooManyRequests);
            f.Dispatcher.Sent.Should().ContainSingle();
        }

        [Fact]
        public async Task Close_Should_Require_Verified_Phone_Only_When_Configured()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            var strict = PublicWith(f, new BingoOptions { RequirePhoneVerificationToClose = true });

            var ex = await FluentActions.Awaiting(() => strict.RequestCloseAsync(tab.TabId)).Should().ThrowAsync<BingoException>();
            ex.Which.Kind.Should().Be(BingoErrorKind.Conflict);
            ex.Which.Message.Should().Be("Confirme seu celular para encerrar a conta");

            await strict.ConfirmPhoneAsync(tab.TabId, f.Dispatcher.Sent[0].Code);
            await strict.RequestCloseAsync(tab.TabId);
            (await f.Public.GetTabAsync(tab.TabId)).Status.Should().Be(BingoTabStatus.CloseRequested);

            var other = await f.NewTabAsync("11999990002", 2);
            await f.Public.RequestCloseAsync(other.TabId);
            (await f.Public.GetTabAsync(other.TabId)).Status.Should().Be(BingoTabStatus.CloseRequested);
        }

        [Fact]
        public async Task Panel_And_History_Should_Expose_Verification_And_Delivery()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var a = await f.NewTabAsync("11999990001", 1);
            await f.NewTabAsync("11999990002", 2);
            await f.NewTabAsync("11999990003", 3);
            await f.Public.ConfirmPhoneAsync(a.TabId, f.Dispatcher.Sent[0].Code);
            var tabs = await f.Db.BingoTabs.OrderBy(x => x.CreatedAt).ToListAsync();
            tabs[1].RegisterCodeSent("wamid.b");
            tabs[2].RegisterCodeSendFailure("131026 - Message undeliverable");
            await f.Db.SaveChangesAsync();

            var panel = await f.Admin.GetPanelAsync(null);

            panel.Counts.PhoneVerified.Should().Be(1);
            panel.Counts.PhoneNotVerified.Should().Be(2);
            panel.Counts.CodeDeliveryFailed.Should().Be(1);
            panel.Tabs.Single(x => x.Id == a.TabId).PhoneVerified.Should().BeTrue();
            panel.Tabs.Should().ContainSingle(x => x.CodeDeliveryStatus == "Failed" && x.CodeDeliveryError == "131026 - Message undeliverable");

            var history = await f.Admin.GetEventTabsAsync(1);
            history.Should().HaveCount(3);
            history.Should().OnlyContain(x => x.ReminderSentAt == null && x.ReminderDeliveryStatus == null);
        }

        private static BingoReminderService NewReminders(Fixture f)
            => new(f.Db, f.WhatsApp, NullLogger<BingoReminderService>.Instance, TimeSpan.Zero);

        private static async Task<(Guid A, Guid B, Guid C, Guid D)> SeedDebtsAsync(Fixture f)
        {
            await f.OpenEventAsync();
            var a = await f.NewTabAsync("11999990001", 1, "Ana Lima");
            var b = await f.NewTabAsync("11999990002", 2, "Bia Souza");
            var c = await f.NewTabAsync("11999990003", 3, "Carla Dias");
            var d = await f.NewTabAsync("11999990004", 4, "Duda Reis");
            await f.OrderAsync(a.TabId, "Refrigerante", 2);
            await f.OrderAsync(a.TabId, "Água", 1);
            await f.OrderAsync(b.TabId, "Salada", 1);
            await f.OrderAsync(d.TabId, "Cachorro-quente", 1);
            await f.DeliverAllAsync(a.TabId);
            await f.DeliverAllAsync(b.TabId);
            await f.DeliverAllAsync(d.TabId);
            await f.PayAdminAsync(b.TabId, f.PixId);
            return (a.TabId, b.TabId, c.TabId, d.TabId);
        }

        [Fact]
        public async Task Reminders_Should_Only_Work_For_Closed_Events()
        {
            var f = new Fixture();
            await SeedDebtsAsync(f);
            var reminders = NewReminders(f);

            await ShouldThrowAsync(() => reminders.PreviewAsync(1), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => reminders.SendAsync(1, true), BingoErrorKind.Conflict);
            f.WhatsApp.Notices.Should().BeEmpty();
        }

        [Fact]
        public async Task Reminders_Preview_Should_List_Unpaid_With_Phone_And_Total()
        {
            var f = new Fixture();
            var (a, _, _, d) = await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);

            var preview = await NewReminders(f).PreviewAsync(1);

            preview.Count.Should().Be(2);
            preview.TotalOwed.Should().Be(31m);
            preview.Items.Select(x => x.TabId).Should().BeEquivalentTo(new[] { a, d });
            preview.Items.Single(x => x.TabId == a).Total.Should().Be(21m);
            preview.Items.Single(x => x.TabId == a).Mesa.Should().Be(1);
            preview.Items.Single(x => x.TabId == a).CustomerName.Should().Be("Ana Lima");
            preview.Items.Should().OnlyContain(x => x.ReminderSentAt == null);
        }

        [Fact]
        public async Task Reminders_Send_Should_Require_Confirmation()
        {
            var f = new Fixture();
            await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);

            await ShouldThrowAsync(() => NewReminders(f).SendAsync(1, false), BingoErrorKind.Validation);
            f.WhatsApp.Notices.Should().BeEmpty();
        }

        [Fact]
        public async Task Reminders_Send_Should_Send_One_Per_Tab_With_Template_Text()
        {
            var f = new Fixture();
            var (a, _, _, _) = await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);
            var reminders = NewReminders(f);

            var result = await reminders.SendAsync(1, true);

            result.Should().BeEquivalentTo(new BingoReminderResultDto { Sent = 2, Skipped = 0, Failed = 0 });
            f.WhatsApp.Notices.Should().HaveCount(2);
            f.WhatsApp.Notices.Should().Contain(n => n.Text == "Sua comanda do bingo ficou em aberto no valor de R$ 21,00. Procure a Casa de Caridade para acertar. Obrigado!");
            f.WhatsApp.Notices.Should().OnlyContain(n => !n.Text.Contains("\n"));
            var stored = await f.Db.BingoTabs.FirstAsync(x => x.Id == a);
            stored.ReminderSentAt.Should().NotBeNull();
            stored.ReminderMessageId.Should().Be("notice-msg-id");
            stored.ReminderDeliveryStatus.Should().Be("Sent");

            var second = await reminders.SendAsync(1, true);

            second.Should().BeEquivalentTo(new BingoReminderResultDto { Sent = 0, Skipped = 2, Failed = 0 });
            f.WhatsApp.Notices.Should().HaveCount(2);
            (await reminders.PreviewAsync(1)).Items.Should().OnlyContain(x => x.ReminderSentAt != null);
            (await f.Admin.GetEventTabsAsync(1)).Count(x => x.ReminderSentAt != null).Should().Be(2);
        }

        [Fact]
        public async Task Reminders_Partial_Failure_Should_Not_Stop_Others_And_Can_Be_Retried()
        {
            var f = new Fixture();
            var (a, _, _, d) = await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);
            f.WhatsApp.FailNoticePhones.Add("5511999990001");
            var reminders = NewReminders(f);

            var result = await reminders.SendAsync(1, true);

            result.Should().BeEquivalentTo(new BingoReminderResultDto { Sent = 1, Skipped = 0, Failed = 1 });
            var failed = await f.Db.BingoTabs.FirstAsync(x => x.Id == a);
            failed.ReminderSentAt.Should().BeNull();
            failed.ReminderDeliveryStatus.Should().Be("Failed");
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == d)).ReminderSentAt.Should().NotBeNull();

            f.WhatsApp.FailNoticePhones.Clear();
            var retry = await reminders.SendAsync(1, true);
            retry.Should().BeEquivalentTo(new BingoReminderResultDto { Sent = 1, Skipped = 1, Failed = 0 });
        }

        [Fact]
        public async Task Privacy_Should_Keep_Unpaid_Tabs_For_Ninety_Days_And_Paid_For_Thirty()
        {
            var f = new Fixture();
            var (a, b, _, _) = await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);
            var privacy = new BingoPrivacyService(f.Db);

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(10))).Should().Be(0);

            // 31 dias: so a comanda paga (b) perde o telefone; as nao pagas (a, c, d) seguem cobraveis
            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(31))).Should().Be(1);
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == b)).Phone.Should().BeNull();
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == a)).Phone.Should().NotBeNull();
            (await f.Db.BingoTabs.CountAsync(x => x.Phone != null)).Should().Be(3);

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(89))).Should().Be(0);

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(91))).Should().Be(3);
            var anonymized = await f.Db.BingoTabs.FirstAsync(x => x.Id == a);
            anonymized.Phone.Should().BeNull();
            anonymized.CustomerName.Should().Be("A. L.");
            (await f.Db.BingoTabs.CountAsync(x => x.Phone != null)).Should().Be(0);
        }

        [Fact]
        public async Task Privacy_Retention_Should_Be_Configurable()
        {
            var f = new Fixture();
            var (a, b, _, _) = await SeedDebtsAsync(f);
            await f.Admin.CloseEventAsync(1);
            var privacy = new BingoPrivacyService(f.Db, Options.Create(new BingoOptions { PaidRetentionDays = 5, UnpaidRetentionDays = 20 }));

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(6))).Should().Be(1);
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == a)).Phone.Should().NotBeNull();
            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(21))).Should().Be(3);
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == b)).Phone.Should().BeNull();
        }

        [Fact]
        public async Task Summary_Should_Total_Paid_Open_By_Method_And_Item()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var a = await f.NewTabAsync("11999990001", 1);
            var b = await f.NewTabAsync("11999990002", 2);
            var c = await f.NewTabAsync("11999990003", 3);
            await f.OrderAsync(a.TabId, "Refrigerante", 2);
            await f.OrderAsync(a.TabId, "Água", 1);
            await f.OrderAsync(b.TabId, "Refrigerante", 1);
            await f.OrderAsync(c.TabId, "Salada", 3);
            await f.DeliverAllAsync(a.TabId);
            await f.DeliverAllAsync(b.TabId);
            await f.PayAdminAsync(a.TabId, f.PixId);
            await f.PayAdminAsync(b.TabId, f.CashId);

            var summary = await f.Admin.GetSummaryAsync(null);

            summary.TotalSold.Should().Be(29m);
            summary.TotalOpen.Should().Be(21m);
            summary.ByPaymentMethod.Single(x => x.Method == "Pix").Total.Should().Be(21m);
            summary.ByPaymentMethod.Single(x => x.Method == "Dinheiro").Total.Should().Be(8m);
            var soda = summary.ByItem.Single(x => x.Name == "Refrigerante");
            soda.Quantity.Should().Be(3);
            soda.Total.Should().Be(24m);
            summary.ByItem.Should().NotContain(x => x.Name == "Salada");

            var panel = await f.Admin.GetPanelAsync(null);
            panel.TotalSold.Should().Be(29m);
            panel.Counts.Paid.Should().Be(2);
            panel.Counts.Open.Should().Be(1);
            panel.Counts.PendingItems.Should().Be(1);
            panel.PendingByTable.Single(x => x.Mesa == 3).PendingItems.Should().Be(3);
            panel.Accounts.Open.Should().ContainSingle();
        }

        [Fact]
        public async Task Reset_Should_Only_Work_On_Test_Events_And_Keep_Menu_Tables_And_Waiters()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);
            await f.Admin.CloseEventAsync(1);
            await f.OpenEventAsync(2);
            var memberId = await f.CreateMemberAsync("11911112222");
            await f.Admin.AddWaiterAsync(2, memberId);
            var tab = await f.Public.CreateTabAsync(new BingoCreateTabRequest { CustomerName = "Teste", Phone = "11999990001", Mesa = 1 });
            await f.Public.AddItemsAsync(tab.TabId, new BingoAddItemsRequest
            {
                Items = new List<BingoOrderLineRequest> { new() { MenuItemId = await f.MenuIdAsync("Água", 2), Quantity = 1 } }
            });

            await ShouldThrowAsync(() => f.Admin.ResetAsync(1, true), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Admin.ResetAsync(2, false), BingoErrorKind.Validation);

            await f.Admin.ResetAsync(2, true);

            (await f.Db.BingoTabs.CountAsync()).Should().Be(0);
            (await f.Db.BingoOrderItems.CountAsync()).Should().Be(0);
            (await f.Admin.GetMenuAsync(2)).Should().HaveCount(16);
            (await f.Admin.GetTablesAsync(2)).Quantidade.Should().Be(30);
            (await f.Admin.GetWaitersAsync(2)).Should().ContainSingle();
        }

        [Fact]
        public async Task Reset_Should_Never_Delete_Real_Event_Data()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);
            await f.NewTabAsync();

            await ShouldThrowAsync(() => f.Admin.ResetAsync(null, true), BingoErrorKind.Validation);

            (await f.Db.BingoTabs.CountAsync()).Should().Be(1);
        }

        [Fact]
        public async Task Only_One_Event_Can_Be_Open_At_A_Time()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);

            await ShouldThrowAsync(() => f.Admin.OpenEventAsync(2), BingoErrorKind.Conflict);

            await f.Admin.CloseEventAsync(1);
            var opened = await f.Admin.OpenEventAsync(2);
            opened.Status.Should().Be(BingoEventStatus.Open);
            await ShouldThrowAsync(() => f.Admin.OpenEventAsync(1), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Admin.CloseEventAsync(1), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Public_Endpoints_Should_Use_The_Currently_Open_Event()
        {
            var f = new Fixture();
            await f.Admin.SetTablesAsync(2, 5);
            await f.OpenEventAsync(2);

            var info = await f.Public.GetInfoAsync();

            info.IsOpen.Should().BeTrue();
            info.Mesas.Should().Equal(1, 2, 3, 4, 5);
            info.Menu.Should().HaveCount(16);
            var tab = await f.NewTabAsync(mesa: 5);
            (await f.Db.BingoTabs.FirstAsync(x => x.Id == tab.TabId)).EventId.Should().Be(2);
            await ShouldThrowAsync(() => f.NewTabAsync("11999990002", 6), BingoErrorKind.Validation);
        }

        [Fact]
        public async Task CreateEvent_Should_Copy_Menu_Tables_And_Waiters_From_Source()
        {
            var f = new Fixture();
            var memberId = await f.CreateMemberAsync("11911112222");
            await f.Admin.AddWaiterAsync(1, memberId);
            var menuId = await f.MenuIdAsync("Salada");
            await f.Admin.SetMenuItemAvailabilityAsync(menuId, false);
            await f.Admin.SetTablesAsync(1, 12);

            var created = await f.Admin.CreateEventAsync(new BingoCreateEventRequest
            {
                Name = "Bingo de 2027",
                EventDate = new DateTime(2027, 5, 1),
                CopiarDeEventoId = 1
            });

            created.Status.Should().Be(BingoEventStatus.Draft);
            created.IsTest.Should().BeFalse();
            (await f.Admin.GetMenuAsync(created.Id)).Should().HaveCount(16);
            (await f.Admin.GetMenuAsync(created.Id)).Single(x => x.Name == "Salada").IsAvailable.Should().BeFalse();
            (await f.Admin.GetTablesAsync(created.Id)).Quantidade.Should().Be(12);
            (await f.Admin.GetWaitersAsync(created.Id)).Should().ContainSingle(w => w.HouseMemberId == memberId);
            (await f.Admin.GetMenuAsync(1)).Should().HaveCount(16);

            var empty = await f.Admin.CreateEventAsync(new BingoCreateEventRequest { Name = "Vazio", EventDate = new DateTime(2027, 6, 1) });
            (await f.Admin.GetMenuAsync(empty.Id)).Should().BeEmpty();
            await ShouldThrowAsync(() => f.Admin.CreateEventAsync(new BingoCreateEventRequest { Name = "X", EventDate = DateTime.UtcNow, CopiarDeEventoId = 999 }), BingoErrorKind.NotFound);
        }

        [Fact]
        public async Task Event_History_Should_Keep_Summary_And_Tabs_After_Closing()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 3);
            await f.DeliverAllAsync(tab.TabId);
            await f.PayAdminAsync(tab.TabId, f.CardId);
            await f.Admin.CloseEventAsync(1);
            await f.Admin.OpenEventAsync(2);

            var summary = await f.Admin.GetEventSummaryAsync(1);
            var tabs = await f.Admin.GetEventTabsAsync(1);
            var events = await f.Admin.GetEventsAsync();

            summary.TotalSold.Should().Be(30m);
            tabs.Should().ContainSingle();
            tabs[0].PaymentMethod.Should().Be("Cartão de crédito");
            tabs[0].Items.Should().ContainSingle();
            events.Single(e => e.Id == 1).TotalSold.Should().Be(30m);
            events.Single(e => e.Id == 1).TabsCount.Should().Be(1);
            (await f.Admin.GetEventSummaryAsync(2)).TotalSold.Should().Be(0m);
            (await f.Admin.GetSettingsAsync(null)).EventId.Should().Be(2);
            (await f.Admin.GetSettingsAsync(1)).Status.Should().Be(BingoEventStatus.Closed);
        }

        [Fact]
        public async Task Tables_Can_Only_Change_While_Event_Is_Draft()
        {
            var f = new Fixture();
            var draft = await f.Admin.SetTablesAsync(null, 40);
            draft.Mesas.Should().HaveCount(40);

            await f.OpenEventAsync();
            await f.NewTabAsync(mesa: 25);

            await ShouldThrowAsync(() => f.Admin.SetTablesAsync(null, 10), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Admin.SetTablesAsync(null, 60), BingoErrorKind.Conflict);
            (await f.Admin.GetTablesAsync(null)).Mesas.Should().HaveCount(40);

            var openEventId = (await f.Admin.GetSettingsAsync(null)).EventId;
            await f.Admin.CloseEventAsync(openEventId);
            await ShouldThrowAsync(() => f.Admin.SetTablesAsync(openEventId, 20), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Menu_Delete_Should_Hide_Item_Without_Breaking_History()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Salada", 1);
            var menuId = await f.MenuIdAsync("Salada");

            await f.Admin.DeleteMenuItemAsync(menuId);

            (await f.Admin.GetMenuAsync(null)).Should().NotContain(x => x.Name == "Salada");
            (await f.Public.GetTabAsync(tab.TabId)).Items.Should().ContainSingle(i => i.Name == "Salada");
        }

        [Fact]
        public async Task Privacy_Should_Anonymize_Tabs_Of_Events_Closed_For_More_Than_30_Days()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);
            var tab = await f.NewTabAsync("11999990001", 1, "Maria da Silva");
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 2);
            await f.DeliverAllAsync(tab.TabId);
            await f.PayAdminAsync(tab.TabId, f.PixId);
            await f.Admin.CloseEventAsync(1);
            var privacy = new BingoPrivacyService(f.Db);

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(10))).Should().Be(0);
            (await f.Db.BingoTabs.FirstAsync()).Phone.Should().NotBeNull();

            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(31))).Should().Be(1);

            var stored = await f.Db.BingoTabs.Include(x => x.Items).FirstAsync();
            stored.Phone.Should().BeNull();
            stored.CustomerName.Should().Be("M. D. S.");
            stored.Total.Should().Be(20m);
            stored.Items.Should().ContainSingle();
            (await f.Admin.GetEventSummaryAsync(1)).TotalSold.Should().Be(20m);
            (await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(60))).Should().Be(0);
            await ShouldThrowAsync(() => f.Public.ResendCodeAsync(tab.TabId), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Privacy_Should_Not_Touch_Open_Or_Draft_Events()
        {
            var f = new Fixture();
            await f.OpenEventAsync(1);
            await f.NewTabAsync();

            (await new BingoPrivacyService(f.Db).AnonymizeClosedEventsAsync(DateTime.UtcNow.AddDays(90))).Should().Be(0);
            (await f.Db.BingoTabs.FirstAsync()).Phone.Should().NotBeNull();
        }

        [Theory]
        [InlineData("Maria da Silva", "M. D. S.")]
        [InlineData("  joao ", "J.")]
        [InlineData("", "-")]
        public void ToInitials_Should_Reduce_Name(string name, string expected)
        {
            BingoPrivacyService.ToInitials(name).Should().Be(expected);
        }

        // ---------- contestacao, cancelamento, valores e formas de pagamento ----------

        private static async Task<List<int>> ItemIdsAsync(Fixture f, Guid tabId)
            => await f.Db.BingoOrderItems.Where(x => x.TabId == tabId).OrderBy(x => x.Id).Select(x => x.Id).ToListAsync();

        [Fact]
        public async Task Contest_Should_Only_Work_On_Delivered_Item_Of_Unpaid_Tab()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.OrderAsync(tab.TabId, "Salada", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);

            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, ids[0], "nao chegou"), BingoErrorKind.Conflict);

            await f.Waiter.DeliverAsync(waiter, ids[0]);
            await f.Public.ContestItemAsync(tab.TabId, ids[0], "  nao recebi  ");

            var view = await f.Public.GetTabAsync(tab.TabId);
            var item = view.Items.Single(i => i.Id == ids[0]);
            item.Status.Should().Be(BingoOrderItemStatus.Contested);
            item.ContestNote.Should().Be("nao recebi");
            item.ContestedAt.Should().NotBeNull();
            view.ContestedCount.Should().Be(1);
            view.AmountDue.Should().Be(0m);
            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, ids[0], null), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, 9999, null), BingoErrorKind.NotFound);
            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, ids[1], new string('x', 201)), BingoErrorKind.Validation);

            await f.Waiter.DeliverAsync(waiter, ids[1]);
            await f.Waiter.ResolveContestationAsync(waiter, ids[0], new BingoResolveContestRequest { Action = BingoContestResolution.ConfirmDelivered });
            await f.PayAdminAsync(tab.TabId);
            await ShouldThrowAsync(() => f.Public.ContestItemAsync(tab.TabId, ids[1], null), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Close_With_Undelivered_Items_Should_Return_409_With_Code_And_Items()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync(name: "Maria da Silva");
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.OrderAsync(tab.TabId, "Salada", 2);
            await f.OrderAsync(tab.TabId, "Refrigerante", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);
            await f.Waiter.RetrieveAsync(waiter, ids[1]);
            await f.Waiter.DeliverAsync(waiter, ids[2]);

            var ex = await Assert.ThrowsAsync<BingoException>(() => f.Public.RequestCloseAsync(tab.TabId));
            ex.Kind.Should().Be(BingoErrorKind.Conflict);
            ex.Code.Should().Be("UNDELIVERED_ITEMS");
            ex.Message.Should().Be("Há itens ainda não entregues.");
            var data = ex.Data.Should().BeOfType<BingoUndeliveredDataDto>().Subject;
            data.Items.Select(i => (i.Id, i.Status)).Should().BeEquivalentTo(new[]
            {
                (ids[0], BingoOrderItemStatus.Pending), (ids[1], BingoOrderItemStatus.Retrieved)
            });
            (await f.Public.GetTabAsync(tab.TabId)).Status.Should().Be(BingoTabStatus.Open);

            await f.Public.RequestCloseAsync(tab.TabId, true);

            var view = await f.Public.GetTabAsync(tab.TabId);
            view.Status.Should().Be(BingoTabStatus.CloseRequested);
            view.Items.Where(i => i.Status == BingoOrderItemStatus.Cancelled).Should().HaveCount(2);
            view.Items.First(i => i.Id == ids[0]).CancelReason.Should().Be("Cancelado pelo cliente ao encerrar");
            view.Items.First(i => i.Id == ids[0]).CancelledByName.Should().Be("Maria da Silva");
            view.Items.First(i => i.Id == ids[0]).CancelledAt.Should().NotBeNull();
            view.Total.Should().Be(8m);
            view.AmountDue.Should().Be(8m);
            view.UndeliveredCount.Should().Be(0);
        }

        [Fact]
        public async Task Close_Should_Not_Be_Blocked_By_Contested_Items()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);
            await f.Waiter.DeliverAsync(waiter, ids[0]);
            await f.Public.ContestItemAsync(tab.TabId, ids[0], null);

            await f.Public.RequestCloseAsync(tab.TabId);

            (await f.Public.GetTabAsync(tab.TabId)).Status.Should().Be(BingoTabStatus.CloseRequested);
        }

        [Fact]
        public async Task Close_With_Unverified_Phone_Should_Carry_Code()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var strict = new BingoPublicService(f.Db, f.Dispatcher, f.Passwords, Options.Create(new BingoOptions { RequirePhoneVerificationToClose = true }));
            var tab = await f.NewTabAsync();

            var ex = await Assert.ThrowsAsync<BingoException>(() => strict.RequestCloseAsync(tab.TabId));
            ex.Code.Should().Be("PHONE_NOT_VERIFIED");
        }

        [Fact]
        public async Task Waiter_Cancel_Item_Should_Require_Reason_And_Record_Audit()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.OrderAsync(tab.TabId, "Salada", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);

            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, ids[0], "  "), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, ids[0], "ab"), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, ids[0], new string('x', 201)), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, 9999, "motivo"), BingoErrorKind.NotFound);

            await f.Waiter.CancelItemAsync(waiter, ids[0], "Acabou a agua");

            var item = (await f.Public.GetTabAsync(tab.TabId)).Items.Single(i => i.Id == ids[0]);
            item.Status.Should().Be(BingoOrderItemStatus.Cancelled);
            item.CancelReason.Should().Be("Acabou a agua");
            item.CancelledByName.Should().Be("Filho Garcom");
            item.CancelledAt.Should().NotBeNull();
            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, ids[0], "de novo"), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Waiter.RetrieveAsync(waiter, ids[0]), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Waiter.DeliverAsync(waiter, ids[0]), BingoErrorKind.Conflict);
            (await f.Waiter.GetOrdersAsync(waiter)).Single().Items.Select(i => i.Id).Should().Equal(ids[1]);

            // cancela mesmo item entregue
            await f.Waiter.DeliverAsync(waiter, ids[1]);
            await f.Admin.CancelItemAsync("Douglas Admin", ids[1], "Erro de lancamento");
            (await f.Db.BingoOrderItems.FindAsync(ids[1]))!.CancelledByName.Should().Be("Douglas Admin");

            await f.PayAdminAsync(tab.TabId);
            await ShouldThrowAsync(() => f.Waiter.CancelItemAsync(waiter, ids[1], "tarde demais"), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Resolve_Contestation_Should_Confirm_Or_Cancel()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.OrderAsync(tab.TabId, "Salada", 1);
            await f.OrderAsync(tab.TabId, "Refrigerante", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);
            foreach (var id in ids)
            {
                await f.Waiter.DeliverAsync(waiter, id);
                await f.Public.ContestItemAsync(tab.TabId, id, null);
            }

            await f.Waiter.ResolveContestationAsync(waiter, ids[0], new BingoResolveContestRequest { Action = BingoContestResolution.ConfirmDelivered });
            await f.Waiter.ResolveContestationAsync(waiter, ids[1], new BingoResolveContestRequest { Action = BingoContestResolution.Cancel });
            await f.Admin.ResolveContestationAsync("Douglas Admin", ids[2], new BingoResolveContestRequest { Action = BingoContestResolution.Cancel, Note = "Cliente tem razao" });

            var items = (await f.Public.GetTabAsync(tab.TabId)).Items;
            items[0].Status.Should().Be(BingoOrderItemStatus.Delivered);
            items[1].Status.Should().Be(BingoOrderItemStatus.Cancelled);
            items[1].CancelReason.Should().Be("Contestação aceita");
            items[2].CancelReason.Should().Be("Cliente tem razao");
            var stored = await f.Db.BingoOrderItems.OrderBy(x => x.Id).ToListAsync();
            stored[0].ResolvedAt.Should().NotBeNull();
            stored[0].ResolvedByName.Should().Be("Filho Garcom");
            stored[2].ResolvedByName.Should().Be("Douglas Admin");
            await ShouldThrowAsync(() => f.Waiter.ResolveContestationAsync(waiter, ids[0], new BingoResolveContestRequest { Action = BingoContestResolution.Cancel }), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Amounts_Should_Reflect_Item_Statuses()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 2);              // 10 entregue
            await f.OrderAsync(tab.TabId, "Salada", 1);            // 7 pendente
            await f.OrderAsync(tab.TabId, "Refrigerante", 1);      // 8 retirado
            await f.OrderAsync(tab.TabId, "Fatia de bolo", 1);     // 5 contestado
            await f.OrderAsync(tab.TabId, "Cachorro-quente", 1);   // 10 cancelado
            var ids = await ItemIdsAsync(f, tab.TabId);
            await f.Waiter.DeliverAsync(waiter, ids[0]);
            await f.Waiter.RetrieveAsync(waiter, ids[2]);
            await f.Waiter.DeliverAsync(waiter, ids[3]);
            await f.Public.ContestItemAsync(tab.TabId, ids[3], null);
            await f.Waiter.CancelItemAsync(waiter, ids[4], "Sem estoque");

            var view = await f.Public.GetTabAsync(tab.TabId);
            view.Total.Should().Be(30m);
            view.AmountDue.Should().Be(10m);
            view.UndeliveredCount.Should().Be(2);
            view.ContestedCount.Should().Be(1);

            var panel = await f.Admin.GetPanelAsync(null);
            var pt = panel.Tabs.Single();
            (pt.Total, pt.AmountDue, pt.UndeliveredCount, pt.ContestedCount).Should().Be((30m, 10m, 2, 1));
            panel.Counts.ContestedItems.Should().Be(1);
            panel.Counts.CancelledItems.Should().Be(1);
            panel.Counts.PendingItems.Should().Be(1);
            panel.Counts.RetrievedItems.Should().Be(1);
            panel.Accounts.Open.Single().AmountDue.Should().Be(10m);

            var account = (await f.Waiter.GetAccountsAsync(true)).Single();
            (account.Total, account.AmountDue, account.UndeliveredCount, account.ContestedCount).Should().Be((30m, 10m, 2, 1));
            account.Items.Should().HaveCount(5);
            account.PhoneVerified.Should().BeFalse();
        }

        [Fact]
        public async Task Item_Dto_Should_Show_First_Name_In_Public_And_Full_Name_For_Staff()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.OrderAsync(tab.TabId, "Salada", 1);
            var ids = await ItemIdsAsync(f, tab.TabId);
            await f.Waiter.DeliverAsync(waiter, ids[0]);
            await f.Admin.DeliverItemAsync("Douglas Admin Souza", ids[1]);

            var publicItems = (await f.Public.GetTabAsync(tab.TabId)).Items;
            publicItems[0].DeliveredByName.Should().Be("Filho");
            publicItems[0].DeliveredAt.Should().NotBeNull();
            publicItems[1].DeliveredByName.Should().Be("Douglas");
            var staff = (await f.Waiter.GetAccountsAsync(true)).Single().Items;
            staff[0].DeliveredByName.Should().Be("Filho Garcom");
            var stored = await f.Db.BingoOrderItems.OrderBy(x => x.Id).ToListAsync();
            stored[0].DeliveredByHouseMemberId.Should().Be(waiter);
            stored[1].DeliveredByHouseMemberId.Should().BeNull();
            stored[1].DeliveredByName.Should().Be("Douglas Admin Souza");
        }

        [Fact]
        public async Task Pay_Should_Validate_Method_Table_And_Block_Pending_Items()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var a = await f.NewTabAsync("11999990001", 4, "Ana");
            var b = await f.NewTabAsync("11999990002", 4, "Bia");
            var c = await f.NewTabAsync("11999990003", 5, "Cris");
            await f.OrderAsync(a.TabId, "Água", 2);
            await f.OrderAsync(b.TabId, "Salada", 1);
            await f.OrderAsync(b.TabId, "Refrigerante", 1);
            await f.OrderAsync(c.TabId, "Água", 1);
            var inactive = await f.Admin.CreatePaymentMethodAsync(new BingoPaymentMethodRequest { Name = "Fiado", IsActive = false });
            await f.DeliverAllAsync(a.TabId);
            await f.DeliverAllAsync(c.TabId);
            var bIds = await ItemIdsAsync(f, b.TabId);
            await f.Waiter.DeliverAsync(waiter, bIds[0]);

            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { a.TabId }, PaymentMethodId = inactive.Id }), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { a.TabId }, PaymentMethodId = 9999 }), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid>(), PaymentMethodId = f.PixId }), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { a.TabId, c.TabId }, PaymentMethodId = f.PixId }), BingoErrorKind.Validation);

            var ex = await Assert.ThrowsAsync<BingoException>(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { a.TabId, b.TabId }, PaymentMethodId = f.PixId }));
            ex.Kind.Should().Be(BingoErrorKind.Conflict);
            ex.Message.Should().Be("Há itens não entregues ou em contestação. Entregue, cancele ou resolva antes de cobrar.");
            var pending = ex.Data.Should().BeOfType<BingoPendingTabsDataDto>().Subject.Tabs.Should().ContainSingle().Subject;
            (pending.TabId, pending.CustomerName, pending.UndeliveredCount, pending.ContestedCount).Should().Be((b.TabId, "Bia", 1, 0));
            (await f.Db.BingoTabs.CountAsync(x => x.Status == BingoTabStatus.Paid)).Should().Be(0);

            // contestacao tambem bloqueia
            await f.Public.ContestItemAsync(b.TabId, bIds[0], null);
            await f.Waiter.DeliverAsync(waiter, bIds[1]);
            var ex2 = await Assert.ThrowsAsync<BingoException>(() => f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { b.TabId }, PaymentMethodId = f.PixId }));
            ex2.Data.Should().BeOfType<BingoPendingTabsDataDto>().Which.Tabs.Single().ContestedCount.Should().Be(1);
            await f.Waiter.CancelItemAsync(waiter, bIds[0], "Cliente tem razao");

            // comanda Open (cliente nao tocou em Encerrar) pode ser paga; cobra so o entregue
            var result = await f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { a.TabId, b.TabId }, PaymentMethodId = f.PixId });

            result.PaidCount.Should().Be(2);
            result.Total.Should().Be(18m);
            var tabs = await f.Db.BingoTabs.Where(x => x.Id == a.TabId || x.Id == b.TabId).OrderBy(x => x.CustomerName).ToListAsync();
            tabs.Select(t => t.AmountPaid).Should().Equal(10m, 8m);
            tabs.Should().OnlyContain(t => t.PaymentMethodId == f.PixId && t.PaymentMethodName == "Pix" && t.PaidByName == "Filho Garcom" && t.PaidByHouseMemberId == waiter);
        }

        [Fact]
        public async Task Pay_Tab_With_Zero_Due_Should_Close_As_Zero()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var empty = await f.NewTabAsync("11999990001", 1);
            var cancelled = await f.NewTabAsync("11999990002", 1, "Joao");
            await f.OrderAsync(cancelled.TabId, "Água", 1);
            await f.Waiter.CancelItemAsync(waiter, (await ItemIdsAsync(f, cancelled.TabId))[0], "Desistiu");

            var result = await f.Admin.PayTabsAsync("Douglas Admin", new BingoAdminPayRequest
            {
                TabIds = new List<Guid> { empty.TabId, cancelled.TabId },
                PaymentMethodId = f.CashId,
                Note = "  sem consumo  "
            });

            result.Total.Should().Be(0m);
            var tabs = await f.Db.BingoTabs.ToListAsync();
            tabs.Should().OnlyContain(t => t.Status == BingoTabStatus.Paid && t.AmountPaid == 0m && t.PaidNote == "sem consumo" && t.PaidByName == "Douglas Admin" && t.PaidByHouseMemberId == null);
            await ShouldThrowAsync(() => f.Admin.PayTabsAsync("x", new BingoAdminPayRequest { TabIds = new List<Guid> { empty.TabId }, PaymentMethodId = f.CashId }), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task Payment_Methods_Crud_And_Waiter_Sees_Only_Active_Sorted()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();

            (await f.Waiter.GetPaymentMethodsAsync()).Select(x => x.Name).Should().Equal("Dinheiro", "Pix", "Cartão de crédito", "Cartão de débito");

            var created = await f.Admin.CreatePaymentMethodAsync(new BingoPaymentMethodRequest { Name = "  Vale-refeição ", IsActive = true, SortOrder = 0 });
            created.Name.Should().Be("Vale-refeição");
            await ShouldThrowAsync(() => f.Admin.CreatePaymentMethodAsync(new BingoPaymentMethodRequest { Name = "PIX", IsActive = true, SortOrder = 9 }), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Admin.CreatePaymentMethodAsync(new BingoPaymentMethodRequest { Name = " ", IsActive = true }), BingoErrorKind.Validation);
            await ShouldThrowAsync(() => f.Admin.CreatePaymentMethodAsync(new BingoPaymentMethodRequest { Name = new string('a', 61) }), BingoErrorKind.Validation);

            (await f.Waiter.GetPaymentMethodsAsync()).First().Name.Should().Be("Vale-refeição");

            var updated = await f.Admin.UpdatePaymentMethodAsync(f.PixId, new BingoPaymentMethodRequest { Name = "Pix (QR)", IsActive = true, SortOrder = 20 });
            updated.Name.Should().Be("Pix (QR)");
            await ShouldThrowAsync(() => f.Admin.UpdatePaymentMethodAsync(f.PixId, new BingoPaymentMethodRequest { Name = "dinheiro", IsActive = true }), BingoErrorKind.Conflict);
            await ShouldThrowAsync(() => f.Admin.UpdatePaymentMethodAsync(9999, new BingoPaymentMethodRequest { Name = "x" }), BingoErrorKind.NotFound);
            (await f.Waiter.GetPaymentMethodsAsync()).Last().Name.Should().Be("Pix (QR)");

            await f.Admin.DeletePaymentMethodAsync(f.DebitId);

            var all = await f.Admin.GetPaymentMethodsAsync();
            all.Should().HaveCount(5);
            all.Single(x => x.Id == f.DebitId).IsActive.Should().BeFalse();
            (await f.Waiter.GetPaymentMethodsAsync()).Select(x => x.Id).Should().NotContain(f.DebitId);
            (await f.Db.BingoPaymentOptions.CountAsync()).Should().Be(5);
            await ShouldThrowAsync(() => f.Admin.DeletePaymentMethodAsync(9999), BingoErrorKind.NotFound);
            waiter.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task Summary_Should_Break_Down_By_Waiter_Method_Cancelled_And_Contested()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var ana = await f.ScheduleWaiterAsync("11911112222");
            var bia = await f.CreateMemberAsync("11933334444", "Bia Garcom");
            await f.Admin.AddWaiterAsync(null, bia);
            var a = await f.NewTabAsync("11999990001", 1, "A");
            var b = await f.NewTabAsync("11999990002", 2, "B");
            var c = await f.NewTabAsync("11999990003", 3, "C");
            var d = await f.NewTabAsync("11999990004", 4, "D");
            await f.OrderAsync(a.TabId, "Refrigerante", 2);   // 16
            await f.OrderAsync(b.TabId, "Água", 1);            // 5
            await f.OrderAsync(b.TabId, "Salada", 1);          // 7 cancelado
            await f.OrderAsync(c.TabId, "Refrigerante", 1);    // 8
            await f.OrderAsync(d.TabId, "Água", 1);            // 5 contestado (conta aberta)
            await f.DeliverAllAsync(a.TabId);
            await f.DeliverAllAsync(c.TabId);
            var bIds = await ItemIdsAsync(f, b.TabId);
            await f.Waiter.DeliverAsync(ana, bIds[0]);
            await f.Waiter.CancelItemAsync(ana, bIds[1], "Sem salada");
            var dIds = await ItemIdsAsync(f, d.TabId);
            await f.Waiter.DeliverAsync(ana, dIds[0]);
            await f.Public.ContestItemAsync(d.TabId, dIds[0], null);

            await f.Waiter.PayAsync(ana, new BingoPayRequest { TabIds = new List<Guid> { a.TabId }, PaymentMethodId = f.PixId });
            await f.Waiter.PayAsync(ana, new BingoPayRequest { TabIds = new List<Guid> { b.TabId }, PaymentMethodId = f.CashId });
            await f.Waiter.PayAsync(bia, new BingoPayRequest { TabIds = new List<Guid> { c.TabId }, PaymentMethodId = f.PixId });

            var summary = await f.Admin.GetSummaryAsync(null);

            summary.TotalSold.Should().Be(29m);
            summary.CancelledTotal.Should().Be(7m);
            summary.ContestedOpen.Should().Be(1);
            summary.ByPaymentMethod.Select(x => (x.Method, x.Count, x.Total)).Should().BeEquivalentTo(new[]
            {
                ("Pix", 2, 24m), ("Dinheiro", 1, 5m)
            });
            summary.ByWaiter.Select(x => (x.Name, x.Count, x.Total)).Should().BeEquivalentTo(new[]
            {
                ("Filho Garcom", 2, 21m), ("Bia Garcom", 1, 8m)
            });
            summary.ByWaiter.Single(x => x.Name == "Filho Garcom").ByMethod.Select(m => (m.Method, m.Total)).Should().BeEquivalentTo(new[]
            {
                ("Pix", 16m), ("Dinheiro", 5m)
            });
            summary.ByItem.Select(x => (x.Name, x.Quantity)).Should().BeEquivalentTo(new[]
            {
                ("Refrigerante", 3), ("Água", 1)
            });
            var panel = await f.Admin.GetPanelAsync(null);
            panel.TotalSold.Should().Be(29m);
            panel.Tabs.Single(t => t.Id == a.TabId).PaidByName.Should().Be("Filho Garcom");
            var history = await f.Admin.GetEventTabsAsync(1);
            history.Single(t => t.Id == c.TabId).PaymentMethod.Should().Be("Pix");
            history.Single(t => t.Id == c.TabId).PaidByName.Should().Be("Bia Garcom");
            history.Single(t => t.Id == c.TabId).AmountDue.Should().Be(8m);
            history.Single(t => t.Id == c.TabId).PaidAt.Should().NotBeNull();
        }

        [Fact]
        public async Task Legacy_Payment_Method_Should_Produce_Label_When_Name_Is_Null()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var tab = await f.NewTabAsync();
            await f.OrderAsync(tab.TabId, "Água", 1);
            await f.DeliverAllAsync(tab.TabId);
            await f.PayAdminAsync(tab.TabId);
            var stored = await f.Db.BingoTabs.FirstAsync();
            typeof(BingoTab).GetProperty("PaymentMethodName")!.SetValue(stored, null);
            typeof(BingoTab).GetProperty("PaymentMethod")!.SetValue(stored, BingoPaymentMethod.Card);
            typeof(BingoTab).GetProperty("AmountPaid")!.SetValue(stored, null);
            await f.Db.SaveChangesAsync();

            var summary = await f.Admin.GetSummaryAsync(null);

            summary.ByPaymentMethod.Single().Method.Should().Be("Cartão");
            summary.TotalSold.Should().Be(5m);
        }

        [Fact]
        public async Task Admin_Table_Tabs_Should_List_Unpaid_Tabs_Of_The_Table()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var a = await f.NewTabAsync("11999990001", 9, "Zeca");
            var b = await f.NewTabAsync("11999990002", 9, "Ana");
            var c = await f.NewTabAsync("11999990003", 10, "Outro");
            var paid = await f.NewTabAsync("11999990004", 9, "Paga");
            await f.OrderAsync(a.TabId, "Água", 1);
            await f.PayAdminAsync(paid.TabId);
            await f.Public.RequestCloseAsync(b.TabId);

            var tabs = await f.Admin.GetTableTabsAsync(null, 9);

            tabs.Select(t => t.CustomerName).Should().Equal("Ana", "Zeca");
            tabs.Single(t => t.TabId == a.TabId).Items.Should().ContainSingle();
            tabs.Single(t => t.TabId == a.TabId).Total.Should().Be(5m);
            tabs.Single(t => t.TabId == a.TabId).UndeliveredCount.Should().Be(1);
            tabs.Select(t => t.TabId).Should().NotContain(new[] { c.TabId, paid.TabId });
            (await f.Admin.GetTableTabsAsync(null, 30)).Should().BeEmpty();
        }

        [Fact]
        public async Task Waiter_Accounts_Todas_Should_List_All_Unpaid_CloseRequested_First()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var open1 = await f.NewTabAsync("11999990001", 2, "Beto");
            var open2 = await f.NewTabAsync("11999990002", 1, "Ana");
            var closing = await f.NewTabAsync("11999990003", 8, "Zeca");
            var paid = await f.NewTabAsync("11999990004", 1, "Paga");
            await f.PayAdminAsync(paid.TabId);
            await f.Public.RequestCloseAsync(closing.TabId);

            (await f.Waiter.GetAccountsAsync()).Select(x => x.TabId).Should().Equal(closing.TabId);

            var all = await f.Waiter.GetAccountsAsync(true);

            all.Select(x => x.TabId).Should().Equal(closing.TabId, open2.TabId, open1.TabId);
            all.Select(x => x.Status).Should().Equal(BingoTabStatus.CloseRequested, BingoTabStatus.Open, BingoTabStatus.Open);

            // garcom fecha a conta de uma comanda aberta (cliente pediu a conta de viva voz)
            var result = await f.Waiter.PayAsync(waiter, new BingoPayRequest { TabIds = new List<Guid> { open2.TabId }, PaymentMethodId = f.CashId });
            result.PaidCount.Should().Be(1);
            (await f.Waiter.GetAccountsAsync(true)).Should().HaveCount(2);
        }

        [Fact]
        public async Task Reminders_Should_Use_Amount_Due_And_Ignore_Zero()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var waiter = await f.ScheduleWaiterAsync();
            var delivered = await f.NewTabAsync("11999990001", 1, "Ana Lima");
            var pending = await f.NewTabAsync("11999990002", 2, "Bia Souza");
            var mixed = await f.NewTabAsync("11999990003", 3, "Carla Dias");
            await f.OrderAsync(delivered.TabId, "Refrigerante", 2);
            await f.OrderAsync(pending.TabId, "Salada", 1);
            await f.OrderAsync(mixed.TabId, "Água", 1);
            await f.OrderAsync(mixed.TabId, "Salada", 1);
            await f.DeliverAllAsync(delivered.TabId);
            await f.Waiter.DeliverAsync(waiter, (await ItemIdsAsync(f, mixed.TabId))[0]);
            await f.Admin.CloseEventAsync(1);
            var reminders = NewReminders(f);

            var preview = await reminders.PreviewAsync(1);

            preview.Items.Select(x => x.TabId).Should().BeEquivalentTo(new[] { delivered.TabId, mixed.TabId });
            preview.TotalOwed.Should().Be(21m);
            preview.Items.Single(x => x.TabId == mixed.TabId).AmountDue.Should().Be(5m);

            await reminders.SendAsync(1, true);

            f.WhatsApp.Notices.Should().Contain(n => n.Text.Contains("R$ 5,00"));
            f.WhatsApp.Notices.Should().Contain(n => n.Text.Contains("R$ 16,00"));
        }
            [Fact]
        public async Task ComandaFoto_Should_Save_Sum_And_Report_All_Photographed_Tabs()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var config = new FakeConfig();
            var svc = new ComandaFotoService(f.Db, new System.Net.Http.HttpClient(), config, Options.Create(new ComandaFotoOptions()));
            var photo = Convert.ToBase64String(new byte[] { 1, 2, 3 });

            svc.IsTokenValid(svc.GetAccessToken()).Should().BeTrue();
            svc.IsTokenValid("errado").Should().BeFalse();

            var first = await svc.SaveAsync(new ComandaFotoSaveRequest
            {
                Label = "Mesa 3",
                ImageBase64 = photo,
                Items = new() { new() { Name = "Água", Quantity = 2, UnitPrice = 5 }, new() { Name = "Salada", Quantity = 1, UnitPrice = 7 } }
            }, CancellationToken.None);
            first.Total.Should().Be(17m);

            await svc.SaveAsync(new ComandaFotoSaveRequest
            {
                ImageBase64 = photo,
                Items = new() { new() { Name = "água", Quantity = 1, UnitPrice = 5 } }
            }, CancellationToken.None);

            var report = await svc.GetReportAsync(CancellationToken.None);
            report.Count.Should().Be(2);
            report.GrandTotal.Should().Be(22m);
            report.ItemTotals.Single(i => i.Name.ToLower() == "água").Quantity.Should().Be(3);

            await svc.DiscardAsync(first.Id, CancellationToken.None);
            (await svc.GetReportAsync(CancellationToken.None)).GrandTotal.Should().Be(5m);

            var act = () => svc.ExtractAsync(new ComandaFotoExtractRequest { ImageBase64 = photo }, CancellationToken.None);
            await act.Should().ThrowAsync<BingoException>();
        }
    }
}
