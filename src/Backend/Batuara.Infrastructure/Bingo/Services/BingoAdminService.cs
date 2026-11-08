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
            if (ev.Status != BingoEventStatus.Draft)
            {
                throw new BingoException(BingoErrorKind.Conflict,
                    "O número de mesas só pode ser alterado antes de o evento começar.");
            }

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
            var retrieverIds = tabs.SelectMany(x => x.Items)
                .Where(i => i.Status == BingoOrderItemStatus.Retrieved && i.RetrievedByHouseMemberId != null)
                .Select(i => i.RetrievedByHouseMemberId!.Value).Distinct().ToList();
            var retrieverNames = await Db.HouseMembers.Where(x => retrieverIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.FullName, cancellationToken);

            return new BingoPanelDto
            {
                EventId = ev.Id,
                EventName = ev.Name,
                IsOpen = ev.IsOpen,
                CloseAllRequested = ev.CloseAllRequested,
                TotalSold = tabs.Where(x => x.IsPaid).Sum(x => x.PaidAmount),
                Counts = new BingoPanelCountsDto
                {
                    Open = tabs.Count(x => x.Status == BingoTabStatus.Open),
                    CloseRequested = tabs.Count(x => x.Status == BingoTabStatus.CloseRequested),
                    Paid = tabs.Count(x => x.IsPaid),
                    PendingItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Pending)),
                    RetrievedItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Retrieved)),
                    ContestedItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Contested)),
                    CancelledItems = tabs.Sum(x => x.Items.Count(i => i.Status == BingoOrderItemStatus.Cancelled)),
                    PhoneVerified = tabs.Count(x => x.IsPhoneVerified),
                    PhoneNotVerified = tabs.Count(x => !x.IsPhoneVerified),
                    CodeDeliveryFailed = tabs.Count(x => x.CodeDeliveryStatus == "Failed")
                },
                Tabs = tabs.Select(t => ToPanelTab(t, retrieverNames)).ToList(),
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

        public async Task<BingoPayResult> PayTabsAsync(string actorName, BingoAdminPayRequest request, CancellationToken cancellationToken = default)
        {
            var ids = (request.TabIds ?? new List<Guid>()).Distinct().ToList();
            var tabs = await Db.BingoTabs.Include(x => x.Items).Where(x => ids.Contains(x.Id)).ToListAsync(cancellationToken);
            return await PayCoreAsync(tabs, ids, request.PaymentMethodId, actorName, null, request.Note, cancellationToken);
        }

        public Task CancelItemAsync(string actorName, int itemId, string reason, CancellationToken cancellationToken = default)
            => CancelItemCoreAsync(itemId, null, reason, actorName, cancellationToken);

        public Task ResolveContestationAsync(string actorName, int itemId, BingoResolveContestRequest request, CancellationToken cancellationToken = default)
            => ResolveContestationCoreAsync(itemId, null, request, actorName, cancellationToken);

        public async Task DeliverItemAsync(string actorName, int itemId, CancellationToken cancellationToken = default)
        {
            var item = await LoadItemForChangeAsync(itemId, null, cancellationToken);
            await DeliverCoreAsync(item, null, actorName, cancellationToken);
        }

        public async Task<List<BingoAccountDto>> GetTableTabsAsync(int? eventId, int mesa, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            var tabs = await Db.BingoTabs.Include(x => x.Items)
                .Where(x => x.EventId == ev.Id && x.TableNumber == mesa && x.Status != BingoTabStatus.Paid)
                .ToListAsync(cancellationToken);
            return tabs.OrderBy(x => x.CustomerName).ThenBy(x => x.CreatedAt).Select(ToAccountDto).ToList();
        }

        public async Task<List<BingoAdminPaymentMethodDto>> GetPaymentMethodsAsync(CancellationToken cancellationToken = default)
        {
            var list = await Db.BingoPaymentOptions.ToListAsync(cancellationToken);
            return list.OrderBy(x => x.SortOrder).ThenBy(x => x.Name).Select(ToPaymentMethodDto).ToList();
        }

        public async Task<BingoAdminPaymentMethodDto> CreatePaymentMethodAsync(BingoPaymentMethodRequest request, CancellationToken cancellationToken = default)
        {
            var name = NormalizeText(request.Name, 1, 60, "Informe o nome da forma de pagamento (até 60 caracteres).");
            await EnsureUniquePaymentNameAsync(name, null, cancellationToken);
            var option = new BingoPaymentOption(name, request.IsActive, request.SortOrder);
            Db.BingoPaymentOptions.Add(option);
            await Db.SaveChangesAsync(cancellationToken);
            return ToPaymentMethodDto(option);
        }

        public async Task<BingoAdminPaymentMethodDto> UpdatePaymentMethodAsync(int id, BingoPaymentMethodRequest request, CancellationToken cancellationToken = default)
        {
            var name = NormalizeText(request.Name, 1, 60, "Informe o nome da forma de pagamento (até 60 caracteres).");
            var option = await Db.BingoPaymentOptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Forma de pagamento não encontrada.");
            await EnsureUniquePaymentNameAsync(name, id, cancellationToken);
            option.Update(name, request.IsActive, request.SortOrder);
            await Db.SaveChangesAsync(cancellationToken);
            return ToPaymentMethodDto(option);
        }

        public async Task DeletePaymentMethodAsync(int id, CancellationToken cancellationToken = default)
        {
            var option = await Db.BingoPaymentOptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Forma de pagamento não encontrada.");
            option.Deactivate();
            await Db.SaveChangesAsync(cancellationToken);
        }

        private async Task EnsureUniquePaymentNameAsync(string name, int? exceptId, CancellationToken cancellationToken)
        {
            var all = await Db.BingoPaymentOptions.Select(x => new { x.Id, x.Name }).ToListAsync(cancellationToken);
            if (all.Any(x => x.Id != exceptId && string.Equals(x.Name, name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Já existe uma forma de pagamento com este nome.");
            }
        }

        private static BingoAdminPaymentMethodDto ToPaymentMethodDto(BingoPaymentOption x)
            => new() { Id = x.Id, Name = x.Name, IsActive = x.IsActive, SortOrder = x.SortOrder };

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
            // comandas de papel fotografadas tambem sao lancamentos do evento
            Db.BingoPhotoTabs.RemoveRange(await Db.BingoPhotoTabs.Where(x => x.EventId == ev.Id).ToListAsync(cancellationToken));
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

        public async Task<BingoEventDto> SuspendEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Open)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Só um evento aberto pode ser suspenso.");
            }

            ev.Suspend();
            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, await LoadTabsAsync(ev.Id, cancellationToken));
        }

        public async Task<BingoEventDto> ResumeEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Suspended)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Só um evento suspenso pode ser retomado.");
            }

            if (await Db.BingoEvents.AnyAsync(x => x.Status == BingoEventStatus.Open, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Já existe um evento aberto. Suspenda ou encerre-o antes de retomar este.");
            }

            ev.Resume();
            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, await LoadTabsAsync(ev.Id, cancellationToken));
        }

        public async Task<BingoEventDto> ReopenEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Closed)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Só um evento encerrado pode ser reaberto.");
            }

            if (await Db.BingoEvents.AnyAsync(x => x.Status == BingoEventStatus.Open, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Já existe um evento aberto. Suspenda ou encerre-o antes de reabrir este.");
            }

            ev.Reopen();
            await Db.SaveChangesAsync(cancellationToken);
            return ToEventDto(ev, await LoadTabsAsync(ev.Id, cancellationToken));
        }

        public async Task<BingoEventDto> CloseEventAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var ev = await ResolveAdminEventAsync(eventId, cancellationToken);
            if (ev.Status != BingoEventStatus.Open && ev.Status != BingoEventStatus.Suspended)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O evento não está aberto nem suspenso.");
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
                AmountDue = x.IsPaid ? x.PaidAmount : x.AmountDue,
                UndeliveredCount = x.UndeliveredCount,
                ContestedCount = x.ContestedCount,
                PaymentMethod = x.PaymentLabel,
                PaidByName = x.PaidByName,
                PaidAt = x.PaidAt,
                CreatedAt = x.CreatedAt,
                PhoneVerified = x.IsPhoneVerified,
                CodeDeliveryStatus = x.CodeDeliveryStatus,
                CodeDeliveryError = x.CodeDeliveryError,
                Items = ToItemDtos(x.Items),
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

            const string NoName = "Não informado";
            const string NoMethod = "Não informado";

            // Comandas de papel fotografadas entram no resumo (itens ja validados contra o cardapio ao salvar).
            var photoRows = await Db.BingoPhotoTabs
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .Select(x => new { x.Total, x.ItemsJson })
                .ToListAsync(cancellationToken);
            var photoItems = photoRows
                .SelectMany(r => System.Text.Json.JsonSerializer.Deserialize<List<ComandaFotoItem>>(
                    r.ItemsJson, new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web)) ?? new())
                .ToList();
            var photoTotal = photoRows.Sum(r => r.Total);
            var digitalItems = paid
                .SelectMany(x => x.Items)
                .Where(i => i.Status == BingoOrderItemStatus.Delivered)
                .Select(i => new BingoItemSummaryDto { Name = i.ItemName, Quantity = i.Quantity, Total = i.UnitPrice * i.Quantity });
            var photoLines = photoItems
                .Select(i => new BingoItemSummaryDto { Name = i.Matched ? i.Name : $"{i.Name} (fora do cardápio)", Quantity = i.Quantity, Total = i.UnitPrice * i.Quantity });

            return new BingoSummaryDto
            {
                EventId = ev.Id,
                EventName = ev.Name,
                TotalSold = paid.Sum(x => x.PaidAmount),
                TotalOpen = tabs.Where(x => !x.IsPaid).Sum(x => x.Total),
                CancelledTotal = tabs.SelectMany(x => x.Items).Where(i => i.Status == BingoOrderItemStatus.Cancelled).Sum(i => i.UnitPrice * i.Quantity),
                ContestedOpen = tabs.Where(x => !x.IsPaid).Sum(x => x.ContestedCount),
                PhotoCount = photoRows.Count,
                PhotoTotal = photoTotal,
                PhotoUnmatched = photoItems.Count(i => !i.Matched),
                GrandTotal = paid.Sum(x => x.PaidAmount) + photoTotal,
                ByPaymentMethod = paid
                    .GroupBy(x => x.PaymentLabel ?? NoMethod)
                    .Select(g => new BingoPaymentSummaryDto { Method = g.Key, Count = g.Count(), Total = g.Sum(t => t.PaidAmount) })
                    .OrderBy(x => x.Method)
                    .ToList(),
                ByWaiter = paid
                    .GroupBy(x => string.IsNullOrWhiteSpace(x.PaidByName) ? NoName : x.PaidByName!)
                    .Select(g => new BingoWaiterSummaryDto
                    {
                        Name = g.Key,
                        Count = g.Count(),
                        Total = g.Sum(t => t.PaidAmount),
                        ByMethod = g.GroupBy(t => t.PaymentLabel ?? NoMethod)
                            .Select(m => new BingoMethodTotalDto { Method = m.Key, Total = m.Sum(t => t.PaidAmount) })
                            .OrderBy(m => m.Method)
                            .ToList()
                    })
                    .OrderBy(x => x.Name)
                    .ToList(),
                ByItem = digitalItems
                    .Concat(photoLines)
                    .GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                    .Select(g => new BingoItemSummaryDto { Name = g.First().Name, Quantity = g.Sum(i => i.Quantity), Total = g.Sum(i => i.Total) })
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

        private BingoPanelTabDto ToPanelTab(BingoTab tab, IReadOnlyDictionary<int, string>? retrieverNames = null)
        {
            return new BingoPanelTabDto
            {
                Id = tab.Id,
                Mesa = tab.TableNumber,
                CustomerName = tab.CustomerName,
                Status = tab.Status,
                Total = tab.Total,
                AmountDue = tab.IsPaid ? tab.PaidAmount : tab.AmountDue,
                UndeliveredCount = tab.UndeliveredCount,
                ContestedCount = tab.ContestedCount,
                PaymentMethod = tab.PaymentLabel,
                PaidByName = tab.PaidByName,
                PaidAt = tab.PaidAt,
                CreatedAt = tab.CreatedAt,
                PhoneVerified = tab.IsPhoneVerified,
                CodeDeliveryStatus = tab.CodeDeliveryStatus,
                CodeDeliveryError = tab.CodeDeliveryError,
                Items = ToItemDtos(tab.Items, retrieverNames: retrieverNames)
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
                TotalSold = tabs.Where(x => x.IsPaid).Sum(x => x.PaidAmount)
            };
        }
    }
}
