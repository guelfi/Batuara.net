using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoWaiterService : BingoServiceBase, IBingoWaiterService
    {
        public BingoWaiterService(BatuaraDbContext db) : base(db)
        {
        }

        public async Task<BingoWaiterMeDto> GetMeAsync(int houseMemberId, CancellationToken cancellationToken = default)
        {
            var ev = await FindOpenEventAsync(cancellationToken);
            if (ev == null)
            {
                return new BingoWaiterMeDto { IsWaiter = false, EventOpen = false, EventName = null };
            }

            var isWaiter = await Db.BingoWaiters.AnyAsync(
                x => x.EventId == ev.Id && x.HouseMemberId == houseMemberId && x.IsActive, cancellationToken);
            return new BingoWaiterMeDto { IsWaiter = isWaiter, EventOpen = true, EventName = ev.Name };
        }

        public async Task EnsureAccessAsync(int houseMemberId, CancellationToken cancellationToken = default)
        {
            var ev = await FindOpenEventAsync(cancellationToken)
                ?? throw new BingoException(BingoErrorKind.Unauthorized, "O bingo está encerrado.");

            var waiter = await Db.BingoWaiters.FirstOrDefaultAsync(
                x => x.EventId == ev.Id && x.HouseMemberId == houseMemberId && x.IsActive, cancellationToken);
            if (waiter == null || !await Db.HouseMembers.AnyAsync(x => x.Id == houseMemberId && x.IsActive, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Unauthorized, "Sessão encerrada. Entre novamente.");
            }

            waiter.Touch(DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<BingoWaiterOrderDto>> GetOrdersAsync(int houseMemberId, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var pending = await Db.BingoOrderItems
                .Include(x => x.Tab)
                .Where(x => (x.Status == BingoOrderItemStatus.Pending || x.Status == BingoOrderItemStatus.Retrieved) && x.Tab.EventId == ev.Id)
                .ToListAsync(cancellationToken);

            var retrieverIds = pending.Where(x => x.RetrievedByHouseMemberId != null).Select(x => x.RetrievedByHouseMemberId!.Value).Distinct().ToList();
            var names = await Db.HouseMembers.Where(x => retrieverIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.FullName, cancellationToken);

            return pending
                .GroupBy(x => x.TabId)
                .Select(g => new BingoWaiterOrderDto
                {
                    Mesa = g.First().Tab.TableNumber,
                    TabId = g.Key,
                    CustomerName = g.First().Tab.CustomerName,
                    Items = g.OrderBy(i => i.CreatedAt).ThenBy(i => i.Id)
                        .Select(i => new BingoWaiterOrderItemDto { Id = i.Id, Name = i.ItemName, Quantity = i.Quantity, CreatedAt = i.CreatedAt,
                            Status = i.Status,
                            RetrievedByName = i.RetrievedByHouseMemberId != null && names.TryGetValue(i.RetrievedByHouseMemberId.Value, out var n) ? n : null,
                            RetrievedByMe = i.RetrievedByHouseMemberId == houseMemberId
                        })
                        .ToList()
                })
                .OrderBy(x => x.Items[0].CreatedAt)
                .ToList();
        }

        public async Task RetrieveAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default)
        {
            var item = await FindItemAsync(itemId, cancellationToken);
            if (item.Status == BingoOrderItemStatus.Retrieved)
            {
                if (item.RetrievedByHouseMemberId == houseMemberId)
                {
                    return;
                }

                var name = item.RetrievedByHouseMemberId == null ? null : await Db.HouseMembers
                    .Where(x => x.Id == item.RetrievedByHouseMemberId).Select(x => x.FullName).FirstOrDefaultAsync(cancellationToken);
                throw new BingoException(BingoErrorKind.Conflict, $"Item já retirado por {name ?? "outro garçom"}");
            }

            if (item.Status == BingoOrderItemStatus.Delivered)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Item já entregue.");
            }

            if (item.Status != BingoOrderItemStatus.Pending)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Item cancelado ou em contestação.");
            }

            item.Retrieve(houseMemberId, DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task ReturnAsync(int itemId, CancellationToken cancellationToken = default)
        {
            var item = await FindItemAsync(itemId, cancellationToken);
            if (item.Status == BingoOrderItemStatus.Delivered)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Item já entregue.");
            }

            if (item.Status == BingoOrderItemStatus.Cancelled || item.Status == BingoOrderItemStatus.Contested)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Item cancelado ou em contestação.");
            }

            if (item.Status == BingoOrderItemStatus.Retrieved)
            {
                item.Return();
                await Db.SaveChangesAsync(cancellationToken);
            }
        }

        private async Task<Domain.Entities.BingoOrderItem> FindItemAsync(int itemId, CancellationToken cancellationToken)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            return await Db.BingoOrderItems
                .Include(x => x.Tab)
                .FirstOrDefaultAsync(x => x.Id == itemId && x.Tab.EventId == ev.Id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item não encontrado.");
        }

        public async Task DeliverAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var item = await Db.BingoOrderItems
                .Include(x => x.Tab)
                .FirstOrDefaultAsync(x => x.Id == itemId && x.Tab.EventId == ev.Id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item não encontrado.");

            await DeliverCoreAsync(item, houseMemberId, await GetMemberNameAsync(houseMemberId, cancellationToken), cancellationToken);
        }

        public async Task CancelItemAsync(int houseMemberId, int itemId, string reason, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            await CancelItemCoreAsync(itemId, ev.Id, reason, await GetMemberNameAsync(houseMemberId, cancellationToken), cancellationToken);
        }

        public async Task ResolveContestationAsync(int houseMemberId, int itemId, BingoResolveContestRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            await ResolveContestationCoreAsync(itemId, ev.Id, request, await GetMemberNameAsync(houseMemberId, cancellationToken), cancellationToken);
        }

        public async Task<List<BingoPaymentMethodDto>> GetPaymentMethodsAsync(CancellationToken cancellationToken = default)
        {
            var list = await Db.BingoPaymentOptions.Where(x => x.IsActive).ToListAsync(cancellationToken);
            return list.OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
                .Select(x => new BingoPaymentMethodDto { Id = x.Id, Name = x.Name }).ToList();
        }

        private async Task<string> GetMemberNameAsync(int houseMemberId, CancellationToken cancellationToken)
        {
            return await Db.HouseMembers.Where(x => x.Id == houseMemberId).Select(x => x.FullName).FirstOrDefaultAsync(cancellationToken)
                ?? "Garçom";
        }

        public async Task ChangeTableAsync(Guid tabId, int mesa, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var tab = await Db.BingoTabs.FirstOrDefaultAsync(x => x.Id == tabId && x.EventId == ev.Id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");

            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            if (!await Db.BingoTables.AnyAsync(x => x.EventId == ev.Id && x.Number == mesa, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Validation, "Mesa inválida.");
            }

            tab.ChangeTable(mesa);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<BingoAccountDto>> GetAccountsAsync(bool all = false, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var tabs = await Db.BingoTabs
                .Include(x => x.Items)
                .Where(x => x.EventId == ev.Id && x.Status != BingoTabStatus.Paid)
                .ToListAsync(cancellationToken);

            return tabs
                .Where(x => all || x.Status == BingoTabStatus.CloseRequested || ev.CloseAllRequested)
                .OrderBy(x => all && x.Status != BingoTabStatus.CloseRequested ? 1 : 0)
                .ThenBy(x => x.TableNumber)
                .ThenBy(x => x.CustomerName)
                .Select(ToAccountDto)
                .ToList();
        }

        public async Task<BingoPayResult> PayAsync(int houseMemberId, BingoPayRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var ids = (request.TabIds ?? new List<Guid>()).Distinct().ToList();
            var tabs = await Db.BingoTabs
                .Include(x => x.Items)
                .Where(x => x.EventId == ev.Id && ids.Contains(x.Id))
                .ToListAsync(cancellationToken);
            return await PayCoreAsync(tabs, ids, request.PaymentMethodId, await GetMemberNameAsync(houseMemberId, cancellationToken), houseMemberId, null, cancellationToken);
        }

        private async Task<Domain.Entities.BingoEvent> RequireOpenEventAsync(CancellationToken cancellationToken)
        {
            return await FindOpenEventAsync(cancellationToken)
                ?? throw new BingoException(BingoErrorKind.Unauthorized, "O bingo está encerrado.");
        }
    }
}
