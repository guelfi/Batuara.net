using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoAdminService : BingoServiceBase, IBingoAdminService
    {
        private static readonly TimeSpan ConnectedWindow = TimeSpan.FromSeconds(60);

        public BingoAdminService(BatuaraDbContext db) : base(db)
        {
        }

        public async Task<BingoSettingsDto> GetSettingsAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            return ToSettings(await ResolveAdminEventAsync(eventId, cancellationToken));
        }

        public async Task<BingoSettingsDto> UpdateSettingsAsync(int? eventId, BingoUpdateSettingsRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            ev.SetCloseAllRequested(request.CloseAllRequested);
            await Db.SaveChangesAsync(cancellationToken);
            return ToSettings(ev);
        }

        public async Task<List<BingoAdminMenuItemDto>> GetMenuAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var items = await Db.BingoMenuItems
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .ToListAsync(cancellationToken);
            return items.Select(ToAdminMenuDto).ToList();
        }

        public async Task<BingoAdminMenuItemDto> CreateMenuItemAsync(int? eventId, BingoMenuItemRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var orders = await Db.BingoMenuItems.Where(x => x.EventId == ev.Id).Select(x => x.SortOrder).ToListAsync(cancellationToken);
            var item = new BingoMenuItem(ev.Id, request.Name, request.UnitPrice, request.IsAvailable, request.SortOrder ?? (orders.Count == 0 ? 1 : orders.Max() + 1));
            Db.BingoMenuItems.Add(item);
            await Db.SaveChangesAsync(cancellationToken);
            return ToAdminMenuDto(item);
        }

        public async Task<BingoAdminMenuItemDto> UpdateMenuItemAsync(int id, BingoMenuItemRequest request, CancellationToken cancellationToken = default)
        {
            var item = await FindMenuItemAsync(id, cancellationToken);
            item.Update(request.Name, request.UnitPrice, request.IsAvailable, request.SortOrder ?? item.SortOrder);
            await Db.SaveChangesAsync(cancellationToken);
            return ToAdminMenuDto(item);
        }

        public async Task DeleteMenuItemAsync(int id, CancellationToken cancellationToken = default)
        {
            var item = await FindMenuItemAsync(id, cancellationToken);
            item.Remove();
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<BingoAdminMenuItemDto> SetMenuItemAvailabilityAsync(int id, bool isAvailable, CancellationToken cancellationToken = default)
        {
            var item = await FindMenuItemAsync(id, cancellationToken);
            item.SetAvailability(isAvailable);
            await Db.SaveChangesAsync(cancellationToken);
            return ToAdminMenuDto(item);
        }

        public async Task<BingoTablesDto> GetTablesAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            return await BuildTablesAsync(ev.Id, cancellationToken);
        }

        public async Task<BingoTablesDto> SetTablesAsync(int? eventId, int quantidade, CancellationToken cancellationToken = default)
        {
            if (quantidade < 1 || quantidade > 200)
            {
                throw new BingoException(BingoErrorKind.Validation, "A quantidade de mesas deve ser de 1 a 200.");
            }

            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var tables = await Db.BingoTables.Where(x => x.EventId == ev.Id).ToListAsync(cancellationToken);

            var blocked = await Db.BingoTabs
                .Where(x => x.EventId == ev.Id && x.Status != BingoTabStatus.Paid && x.TableNumber > quantidade)
                .Select(x => x.TableNumber)
                .Distinct()
                .ToListAsync(cancellationToken);
            if (blocked.Count > 0)
            {
                throw new BingoException(BingoErrorKind.Conflict,
                    $"Há comandas abertas nas mesas {string.Join(", ", blocked.OrderBy(x => x))}; mova ou receba antes de remover.");
            }

            Db.BingoTables.RemoveRange(tables.Where(x => x.Number > quantidade));
            var existing = tables.Select(x => x.Number).ToHashSet();
            Db.BingoTables.AddRange(Enumerable.Range(1, quantidade).Where(n => !existing.Contains(n)).Select(n => new BingoTable(ev.Id, n)));
            await Db.SaveChangesAsync(cancellationToken);
            return await BuildTablesAsync(ev.Id, cancellationToken);
        }

        public async Task<List<BingoAdminWaiterDto>> GetWaitersAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var waiters = await Db.BingoWaiters
                .Include(x => x.HouseMember)
                .Where(x => x.EventId == ev.Id)
                .ToListAsync(cancellationToken);

            var deliveries = await Db.BingoOrderItems
                .Where(x => x.DeliveredByHouseMemberId != null && x.Tab.EventId == ev.Id)
                .Select(x => x.DeliveredByHouseMemberId!.Value)
                .ToListAsync(cancellationToken);
            var deliveryCount = deliveries.GroupBy(x => x).ToDictionary(g => g.Key, g => g.Count());

            var since = DateTime.UtcNow - ConnectedWindow;
            return waiters
                .OrderBy(x => x.HouseMember.FullName)
                .Select(x => new BingoAdminWaiterDto
                {
                    HouseMemberId = x.HouseMemberId,
                    Name = x.HouseMember.FullName,
                    IsActive = x.IsActive,
                    LastSeenAt = x.LastSeenAt,
                    Connected = x.IsActive && x.LastSeenAt != null && x.LastSeenAt > since,
                    Deliveries = deliveryCount.GetValueOrDefault(x.HouseMemberId)
                })
                .ToList();
        }

        public async Task AddWaiterAsync(int? eventId, int houseMemberId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status == BingoEventStatus.Closed)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O evento está encerrado.");
            }

            var member = await Db.HouseMembers.FirstOrDefaultAsync(x => x.Id == houseMemberId && x.IsActive, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Filho da casa não encontrado.");
            if (string.IsNullOrWhiteSpace(member.MobilePhone))
            {
                throw new BingoException(BingoErrorKind.Validation, "O filho precisa ter celular cadastrado para entrar como garçom.");
            }

            var waiter = await Db.BingoWaiters.FirstOrDefaultAsync(x => x.EventId == ev.Id && x.HouseMemberId == houseMemberId, cancellationToken);
            if (waiter == null)
            {
                Db.BingoWaiters.Add(new BingoWaiter(ev.Id, houseMemberId));
            }
            else
            {
                waiter.Activate();
            }

            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task RemoveWaiterAsync(int? eventId, int houseMemberId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var waiter = await Db.BingoWaiters.FirstOrDefaultAsync(x => x.EventId == ev.Id && x.HouseMemberId == houseMemberId, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Garçom não escalado.");
            Db.BingoWaiters.Remove(waiter);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<int> EndWaiterSessionsAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var waiters = await Db.BingoWaiters.Where(x => x.EventId == ev.Id && x.IsActive).ToListAsync(cancellationToken);
            foreach (var waiter in waiters)
            {
                waiter.Deactivate();
            }

            await Db.SaveChangesAsync(cancellationToken);
            return waiters.Count;
        }

        public async Task<BingoPanelDto> GetPanelAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var tabs = await LoadTabsAsync(ev.Id, cancellationToken);
            var unpaid = tabs.Where(x => !x.IsPaid).ToList();

            return new BingoPanelDto
            {
                EventId = ev.Id,
                EventName = ev.Name,
                IsOpen = ev.IsOpen,
                CloseAllRequested = ev.CloseAllRequested,
                TotalSold = tabs.Where(x => x.IsPaid).Sum(x => x.Total),
                Counts = new BingoPanelCountsDto
                {
                    Open = tabs.Count(x => x.Status == BingoTabStatus.Open),
                    CloseRequested = tabs.Count(x => x.Status == BingoTabStatus.CloseRequested),
                    Paid = tabs.Count(x => x.IsPaid),
                    PendingItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Pending)),
                    RetrievedItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Retrieved)),
                    PhoneVerified = tabs.Count(x => x.IsPhoneVerified),
                    PhoneNotVerified = tabs.Count(x => !x.IsPhoneVerified),
                    CodeDeliveryFailed = tabs.Count(x => x.CodeDeliveryStatus == "Failed")
                },
                Tabs = tabs.Select(ToPanelTab).ToList(),
                PendingByTable = tabs
                    .GroupBy(x => x.TableNumber)
                    .Select(g => new BingoPendingByTableDto
                    {
                        Mesa = g.Key,
                        PendingItems = g.Sum(t => t.Items.Where(i => i.Status == BingoOrderItemStatus.Pending).Sum(i => i.Quantity))
                    })
                    .Where(x => x.PendingItems > 0)
                    .OrderBy(x => x.Mesa)
                    .ToList(),
                RetrievedByTable = tabs
                    .GroupBy(x => x.TableNumber)
                    .Select(g => new BingoRetrievedByTableDto
                    {
                        Mesa = g.Key,
                        RetrievedItems = g.Sum(t => t.Items.Where(i => i.Status == BingoOrderItemStatus.Retrieved).Sum(i => i.Quantity))
                    })
                    .Where(x => x.RetrievedItems > 0)
                    .OrderBy(x => x.Mesa)
                    .ToList(),
                Accounts = new BingoPanelAccountsDto
                {
                    CloseRequested = unpaid.Where(x => x.Status == BingoTabStatus.CloseRequested).OrderBy(x => x.TableNumber).Select(ToAccountDto).ToList(),
                    Open = unpaid.Where(x => x.Status == BingoTabStatus.Open).OrderBy(x => x.TableNumber).Select(ToAccountDto).ToList()
                }
            };
        }

        public async Task<BingoSummaryDto> GetSummaryAsync(int? eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            return await BuildSummaryAsync(ev, cancellationToken);
        }

        public async Task PayTabAsync(Guid tabId, BingoPayOneRequest request, CancellationToken cancellationToken = default)
        {
            var tab = await Db.BingoTabs.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == tabId, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            tab.MarkPaid(request.Method, null, DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task ResetAsync(int? eventId, bool confirmed, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (!ev.IsTest)
            {
                throw new BingoException(BingoErrorKind.Validation, "Somente eventos de teste podem ter os dados zerados.");
            }

            if (!confirmed)
            {
                throw new BingoException(BingoErrorKind.Validation, "Confirme para zerar os dados.");
            }

            var tabs = await Db.BingoTabs.Include(x => x.Items).Where(x => x.EventId == ev.Id).ToListAsync(cancellationToken);
            Db.BingoOrderItems.RemoveRange(tabs.SelectMany(x => x.Items));
            Db.BingoTabs.RemoveRange(tabs);
            ev.SetCloseAllRequested(false);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<BingoEventDto>> GetEventsAsync(CancellationToken cancellationToken = default)
        {
            var events = await Db.BingoEvents.ToListAsync(cancellationToken);
            var tabs = await Db.BingoTabs.Include(x => x.Items).ToListAsync(cancellationToken);

            return events
                .OrderByDescending(x => x.EventDate)
                .ThenByDescending(x => x.Id)
                .Select(ev => ToEventDto(ev, tabs.Where(t => t.EventId == ev.Id).ToList()))
                .ToList();
        }

        public async Task<BingoEventDto> CreateEventAsync(BingoCreateEventRequest request, CancellationToken cancellationToken = default)
        {
            var ev = new BingoEvent(request.Name, DateTime.SpecifyKind(request.EventDate, DateTimeKind.Utc));
            Db.BingoEvents.Add(ev);

            if (request.CopiarDeEventoId.HasValue)
            {
                var sourceId = request.CopiarDeEventoId.Value;
                if (!await Db.BingoEvents.AnyAsync(x => x.Id == sourceId, cancellationToken))
                {
                    throw new BingoException(BingoErrorKind.NotFound, "Evento de origem não encontrado.");
                }

                var menu = await Db.BingoMenuItems.Where(x => x.EventId == sourceId && x.IsActive).ToListAsync(cancellationToken);
                var tables = await Db.BingoTables.Where(x => x.EventId == sourceId).ToListAsync(cancellationToken);
                var waiters = await Db.BingoWaiters.Where(x => x.EventId == sourceId && x.IsActive).ToListAsync(cancellationToken);

                await Db.SaveChangesAsync(cancellationToken);
                Db.BingoMenuItems.AddRange(menu.Select(x => new BingoMenuItem(ev.Id, x.Name, x.UnitPrice, x.IsAvailable, x.SortOrder)));
                Db.BingoTables.AddRange(tables.Select(x => new BingoTable(ev.Id, x.Number)));
                Db.BingoWaiters.AddRange(waiters.Select(x => new BingoWaiter(ev.Id, x.HouseMemberId)));
            }

            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, new List<BingoTab>());
        }

        public async Task<BingoEventDto> OpenEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Draft)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Somente eventos em rascunho podem ser abertos.");
            }

            if (await Db.BingoEvents.AnyAsync(x => x.Status == BingoEventStatus.Open, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Já existe um evento aberto. Encerre-o antes de abrir outro.");
            }

            ev.Open(DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, await LoadTabsAsync(ev.Id, cancellationToken));
        }

        public async Task<BingoEventDto> CloseEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Open)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O evento não está aberto.");
            }

            ev.Close(DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, await LoadTabsAsync(ev.Id, cancellationToken));
        }

        public async Task<BingoSummaryDto> GetEventSummaryAsync(int eventId, CancellationToken cancellationToken = default)
        {
            return await BuildSummaryAsync(await ResolveAdminEventAsync(eventId, cancellationToken), cancellationToken);
        }

        public async Task<List<BingoHistoryTabDto>> GetEventTabsAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var tabs = await LoadTabsAsync(ev.Id, cancellationToken);
            return tabs.Select(x => new BingoHistoryTabDto
            {
                Id = x.Id,
                Mesa = x.TableNumber,
                CustomerName = x.CustomerName,
                Status = x.Status,
                Total = x.Total,
                CreatedAt = x.CreatedAt,
                PhoneVerified = x.IsPhoneVerified,
                CodeDeliveryStatus = x.CodeDeliveryStatus,
                CodeDeliveryError = x.CodeDeliveryError,
                Items = ToItemDtos(x.Items),
                PaymentMethod = x.PaymentMethod,
                PaidAt = x.PaidAt,
                ReminderSentAt = x.ReminderSentAt,
                ReminderDeliveryStatus = x.ReminderDeliveryStatus
            }).ToList();
        }

        private async Task<List<BingoTab>> LoadTabsAsync(int eventId, CancellationToken cancellationToken)
        {
            var tabs = await Db.BingoTabs.Include(x => x.Items).Where(x => x.EventId == eventId).ToListAsync(cancellationToken);
            return tabs.OrderBy(x => x.CreatedAt).ToList();
        }

        private async Task<BingoSummaryDto> BuildSummaryAsync(BingoEvent ev, CancellationToken cancellationToken)
        {
            var tabs = await LoadTabsAsync(ev.Id, cancellationToken);
            var paid = tabs.Where(x => x.IsPaid).ToList();

            return new BingoSummaryDto
            {
                EventId = ev.Id,
                EventName = ev.Name,
                TotalSold = paid.Sum(x => x.Total),
                TotalOpen = tabs.Where(x => !x.IsPaid).Sum(x => x.Total),
                ByPaymentMethod = paid
                    .Where(x => x.PaymentMethod.HasValue)
                    .GroupBy(x => x.PaymentMethod!.Value)
                    .Select(g => new BingoPaymentSummaryDto { Method = g.Key, Count = g.Count(), Total = g.Sum(t => t.Total) })
                    .OrderBy(x => x.Method)
                    .ToList(),
                ByItem = paid
                    .SelectMany(x => x.Items)
                    .GroupBy(x => x.ItemName)
                    .Select(g => new BingoItemSummaryDto { Name = g.Key, Quantity = g.Sum(i => i.Quantity), Total = g.Sum(i => i.UnitPrice * i.Quantity) })
                    .OrderByDescending(x => x.Total)
                    .ThenBy(x => x.Name)
                    .ToList()
            };
        }

        private async Task<BingoTablesDto> BuildTablesAsync(int eventId, CancellationToken cancellationToken)
        {
            var numbers = await Db.BingoTables.Where(x => x.EventId == eventId).OrderBy(x => x.Number).Select(x => x.Number).ToListAsync(cancellationToken);
            return new BingoTablesDto { Quantidade = numbers.Count, Mesas = numbers };
        }

        private async Task<BingoMenuItem> FindMenuItemAsync(int id, CancellationToken cancellationToken)
        {
            return await Db.BingoMenuItems.FirstOrDefaultAsync(x => x.Id == id && x.IsActive, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item do cardápio não encontrado.");
        }

        private static BingoSettingsDto ToSettings(BingoEvent ev)
        {
            return new BingoSettingsDto
            {
                EventId = ev.Id,
                Name = ev.Name,
                Status = ev.Status,
                IsOpen = ev.IsOpen,
                CloseAllRequested = ev.CloseAllRequested
            };
        }

        private static BingoAdminMenuItemDto ToAdminMenuDto(BingoMenuItem item)
        {
            return new BingoAdminMenuItemDto
            {
                Id = item.Id,
                Name = item.Name,
                UnitPrice = item.UnitPrice,
                IsAvailable = item.IsAvailable,
                SortOrder = item.SortOrder
            };
        }

        private BingoPanelTabDto ToPanelTab(BingoTab tab)
        {
            return new BingoPanelTabDto
            {
                Id = tab.Id,
                Mesa = tab.TableNumber,
                CustomerName = tab.CustomerName,
                Status = tab.Status,
                Total = tab.Total,
                CreatedAt = tab.CreatedAt,
                PhoneVerified = tab.IsPhoneVerified,
                CodeDeliveryStatus = tab.CodeDeliveryStatus,
                CodeDeliveryError = tab.CodeDeliveryError,
                Items = ToItemDtos(tab.Items)
            };
        }

        private static BingoEventDto ToEventDto(BingoEvent ev, List<BingoTab> tabs)
        {
            return new BingoEventDto
            {
                Id = ev.Id,
                Name = ev.Name,
                EventDate = ev.EventDate,
                Status = ev.Status,
                IsTest = ev.IsTest,
                CloseAllRequested = ev.CloseAllRequested,
                OpenedAt = ev.OpenedAt,
                ClosedAt = ev.ClosedAt,
                TabsCount = tabs.Count,
                TotalSold = tabs.Where(x => x.IsPaid).Sum(x => x.Total)
            };
        }
    }
}
