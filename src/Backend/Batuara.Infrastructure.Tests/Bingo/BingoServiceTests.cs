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
        private class FakeWhatsApp : IWhatsAppService
        {
            public bool Fail { get; set; }
            public string? LastCode { get; private set; }
            public List<(string Phone, string Name, string Text)> Notices { get; } = new();

            public Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
            {
                LastCode = code;
                return Task.CompletedTask;
            }

            public Task SendMemberNoticeAsync(string phoneE164, string memberName, string noticeText, CancellationToken cancellationToken = default)
            {
                Notices.Add((phoneE164, memberName, noticeText));
                if (Fail)
                {
                    throw new InvalidOperationException("WhatsApp fora do ar");
                }

                return Task.CompletedTask;
            }

            public Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default) => Task.FromResult(Guid.NewGuid().ToString());
            public Task SendAdminNotificationAsync(string phoneE164, int pendingCount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendBirthdayGreetingAsync(string phoneE164, string memberName, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendEventInviteAsync(string phoneE164, string memberName, string eventName, string eventDate, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendSiteTutorialLinkAsync(string phoneE164, string memberName, string tutorialUrl, CancellationToken cancellationToken = default) => Task.CompletedTask;
        }

        private class RecordingDispatcher : IBingoLinkDispatcher
        {
            public List<(Guid TabId, string Phone, string Message)> Sent { get; } = new();

            public void Dispatch(Guid tabId, string phone, string customerName, string message)
            {
                Sent.Add((tabId, phone, message));
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

                Public = new BingoPublicService(Db, Dispatcher, Options.Create(new BingoOptions { PublicBaseUrl = "https://exemplo.test/" }));
                Admin = new BingoAdminService(Db);
                Waiter = new BingoWaiterService(Db);
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
            await f.Admin.PayTabAsync(first.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Pix });

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
            await f.Admin.PayTabAsync(paid.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Cash });

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

            await f.Admin.PayTabAsync(tab.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Card });
            await ShouldThrowAsync(() => f.Public.RequestCloseAsync(tab.TabId), BingoErrorKind.Conflict);
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

            var orders = await f.Waiter.GetOrdersAsync();
            orders.Should().ContainSingle();
            orders[0].Mesa.Should().Be(4);
            orders[0].Items.Should().HaveCount(2);

            await f.Waiter.DeliverAsync(waiterId, orders[0].Items[0].Id);

            var delivered = await f.Db.BingoOrderItems.FirstAsync(x => x.Id == orders[0].Items[0].Id);
            delivered.Status.Should().Be(BingoOrderItemStatus.Delivered);
            delivered.DeliveredByHouseMemberId.Should().Be(waiterId);
            delivered.DeliveredAt.Should().NotBeNull();
            (await f.Waiter.GetOrdersAsync())[0].Items.Should().ContainSingle();
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
            await f.Public.RequestCloseAsync(a.TabId);
            await f.Public.RequestCloseAsync(b.TabId);

            (await f.Waiter.GetAccountsAsync()).Select(x => x.TabId).Should().BeEquivalentTo(new[] { a.TabId, b.TabId });

            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiterId, new BingoPayRequest
            {
                TabIds = new List<Guid> { a.TabId, c.TabId },
                Method = BingoPaymentMethod.Pix
            }), BingoErrorKind.Validation);

            var result = await f.Waiter.PayAsync(waiterId, new BingoPayRequest
            {
                TabIds = new List<Guid> { a.TabId, b.TabId },
                Method = BingoPaymentMethod.Card
            });

            result.PaidCount.Should().Be(2);
            result.Total.Should().Be(23m);
            var tabs = await f.Db.BingoTabs.Where(x => x.Id == a.TabId || x.Id == b.TabId).ToListAsync();
            tabs.Should().OnlyContain(t => t.Status == BingoTabStatus.Paid && t.PaymentMethod == BingoPaymentMethod.Card && t.PaidByHouseMemberId == waiterId && t.PaidAt != null);
            await ShouldThrowAsync(() => f.Waiter.PayAsync(waiterId, new BingoPayRequest { TabIds = new List<Guid> { a.TabId }, Method = BingoPaymentMethod.Cash }), BingoErrorKind.Conflict);
        }

        [Fact]
        public async Task CloseAll_Should_Show_All_Unpaid_Tabs_To_Waiters_And_Flag_Customers()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var open = await f.NewTabAsync("11999990001", 1);
            var paid = await f.NewTabAsync("11999990002", 2);
            await f.Admin.PayTabAsync(paid.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Cash });

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

        [Fact]
        public async Task CreateTab_Should_Dispatch_Link_And_Respect_Three_Minute_Limit_Per_Phone()
        {
            var f = new Fixture();
            await f.OpenEventAsync();

            var tab = await f.NewTabAsync("(11) 99999-0001");

            f.Dispatcher.Sent.Should().ContainSingle();
            f.Dispatcher.Sent[0].Phone.Should().Be("5511999990001");
            f.Dispatcher.Sent[0].Message.Should().Be($"Sua comanda do bingo está aberta. Acesse: https://exemplo.test/bingo/comanda/{tab.TabId}");
            f.Dispatcher.Sent[0].Message.Should().NotContain("\n");

            await ShouldThrowAsync(() => f.Public.ResendLinkAsync(tab.TabId), BingoErrorKind.TooManyRequests);
            f.Dispatcher.Sent.Should().ContainSingle();

            var stored = await f.Db.BingoTabs.FirstAsync();
            stored.RegisterLinkAttempt(DateTime.UtcNow.AddMinutes(-4));
            await f.Db.SaveChangesAsync();

            await f.Public.ResendLinkAsync(tab.TabId);
            f.Dispatcher.Sent.Should().HaveCount(2);
            await ShouldThrowAsync(() => f.Public.ResendLinkAsync(tab.TabId), BingoErrorKind.TooManyRequests);
        }

        [Fact]
        public async Task Link_Limit_Should_Apply_Per_Phone_Across_Tabs()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            var first = await f.NewTabAsync("11999990001");
            await f.Admin.PayTabAsync(first.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Pix });

            var second = await f.NewTabAsync("11999990001");

            second.Reused.Should().BeFalse();
            f.Dispatcher.Sent.Should().ContainSingle();
        }

        [Fact]
        public async Task WhatsApp_Failure_Should_Not_Break_Tab_Creation()
        {
            var dbName = Guid.NewGuid().ToString();
            var whatsApp = new FakeWhatsApp { Fail = true };
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDbContext<BatuaraDbContext>(o => o.UseInMemoryDatabase(dbName));
            services.AddSingleton<IWhatsAppService>(whatsApp);
            var provider = services.BuildServiceProvider();
            var dispatcher = new BingoLinkDispatcher(provider.GetRequiredService<IServiceScopeFactory>(), NullLogger<BingoLinkDispatcher>.Instance);

            var db = Fixture.CreateDb(dbName);
            await new BingoAdminService(db).OpenEventAsync(1);
            var service = new BingoPublicService(db, dispatcher, Options.Create(new BingoOptions()));

            var tab = await service.CreateTabAsync(new BingoCreateTabRequest { CustomerName = "Maria", Phone = "11999990001", Mesa = 1 });

            tab.TabId.Should().NotBeEmpty();
            for (var i = 0; i < 50 && whatsApp.Notices.Count == 0; i++)
            {
                await Task.Delay(50);
            }

            whatsApp.Notices.Should().ContainSingle();
            whatsApp.Notices[0].Text.Should().Contain("https://www.batuara.org.br/bingo/comanda/");
            await dispatcher.SendAsync(tab.TabId, "5511999990001", "Maria", "x");
            (await db.BingoTabs.FirstAsync()).LinkSentAt.Should().BeNull();
        }

        [Fact]
        public async Task Link_Dispatcher_Should_Mark_LinkSentAt_On_Success()
        {
            var dbName = Guid.NewGuid().ToString();
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDbContext<BatuaraDbContext>(o => o.UseInMemoryDatabase(dbName));
            services.AddSingleton<IWhatsAppService>(new FakeWhatsApp());
            var dispatcher = new BingoLinkDispatcher(services.BuildServiceProvider().GetRequiredService<IServiceScopeFactory>(), NullLogger<BingoLinkDispatcher>.Instance);
            var db = Fixture.CreateDb(dbName);
            var tab = new BingoTab(1, "Maria", "5511999990001", 1);
            db.BingoTabs.Add(tab);
            await db.SaveChangesAsync();

            await dispatcher.SendAsync(tab.Id, "5511999990001", "Maria", "msg");

            (await Fixture.CreateDb(dbName).BingoTabs.FirstAsync()).LinkSentAt.Should().NotBeNull();
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
            await f.Admin.PayTabAsync(a.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Pix });
            await f.Admin.PayTabAsync(b.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Cash });

            var summary = await f.Admin.GetSummaryAsync(null);

            summary.TotalSold.Should().Be(29m);
            summary.TotalOpen.Should().Be(21m);
            summary.ByPaymentMethod.Single(x => x.Method == BingoPaymentMethod.Pix).Total.Should().Be(21m);
            summary.ByPaymentMethod.Single(x => x.Method == BingoPaymentMethod.Cash).Total.Should().Be(8m);
            var soda = summary.ByItem.Single(x => x.Name == "Refrigerante");
            soda.Quantity.Should().Be(3);
            soda.Total.Should().Be(24m);
            summary.ByItem.Should().NotContain(x => x.Name == "Salada");

            var panel = await f.Admin.GetPanelAsync(null);
            panel.TotalSold.Should().Be(29m);
            panel.Counts.Paid.Should().Be(2);
            panel.Counts.Open.Should().Be(1);
            panel.Counts.PendingItems.Should().Be(4);
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
            await f.OpenEventAsync(2);
            await f.Admin.SetTablesAsync(2, 5);

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
            await f.Admin.PayTabAsync(tab.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Card });
            await f.Admin.CloseEventAsync(1);
            await f.Admin.OpenEventAsync(2);

            var summary = await f.Admin.GetEventSummaryAsync(1);
            var tabs = await f.Admin.GetEventTabsAsync(1);
            var events = await f.Admin.GetEventsAsync();

            summary.TotalSold.Should().Be(30m);
            tabs.Should().ContainSingle();
            tabs[0].PaymentMethod.Should().Be(BingoPaymentMethod.Card);
            tabs[0].Items.Should().ContainSingle();
            events.Single(e => e.Id == 1).TotalSold.Should().Be(30m);
            events.Single(e => e.Id == 1).TabsCount.Should().Be(1);
            (await f.Admin.GetEventSummaryAsync(2)).TotalSold.Should().Be(0m);
            (await f.Admin.GetSettingsAsync(null)).EventId.Should().Be(2);
            (await f.Admin.GetSettingsAsync(1)).Status.Should().Be(BingoEventStatus.Closed);
        }

        [Fact]
        public async Task Tables_Cannot_Shrink_Below_An_Open_Tab()
        {
            var f = new Fixture();
            await f.OpenEventAsync();
            await f.NewTabAsync(mesa: 25);

            await ShouldThrowAsync(() => f.Admin.SetTablesAsync(null, 10), BingoErrorKind.Conflict);

            var grown = await f.Admin.SetTablesAsync(null, 40);
            grown.Mesas.Should().HaveCount(40);
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
            await f.Admin.PayTabAsync(tab.TabId, new BingoPayOneRequest { Method = BingoPaymentMethod.Pix });
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
            await ShouldThrowAsync(() => f.Public.ResendLinkAsync(tab.TabId), BingoErrorKind.Conflict);
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
    }
}
