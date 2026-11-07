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

        public async Task<List<BingoWaiterOrderDto>> GetOrdersAsync(CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var pending = await Db.BingoOrderItems
                .Include(x => x.Tab)
                .Where(x => x.Status == BingoOrderItemStatus.Pending && x.Tab.EventId == ev.Id)
                .ToListAsync(cancellationToken);

            return pending
                .GroupBy(x => x.TabId)
                .Select(g => new BingoWaiterOrderDto
                {
                    Mesa = g.First().Tab.TableNumber,
                    TabId = g.Key,
                    CustomerName = g.First().Tab.CustomerName,
                    Items = g.OrderBy(i => i.CreatedAt).ThenBy(i => i.Id)
                        .Select(i => new BingoWaiterOrderItemDto { Id = i.Id, Name = i.ItemName, Quantity = i.Quantity, CreatedAt = i.CreatedAt })
                        .ToList()
                })
                .OrderBy(x => x.Items[0].CreatedAt)
                .ToList();
        }

        public async Task DeliverAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var item = await Db.BingoOrderItems
                .Include(x => x.Tab)
                .FirstOrDefaultAsync(x => x.Id == itemId && x.Tab.EventId == ev.Id, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item não encontrado.");

            if (item.Status == BingoOrderItemStatus.Pending)
            {
                item.Deliver(houseMemberId, DateTime.UtcNow);
                await Db.SaveChangesAsync(cancellationToken);
            }
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

        public async Task<List<BingoAccountDto>> GetAccountsAsync(CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var tabs = await Db.BingoTabs
                .Include(x => x.Items)
                .Where(x => x.EventId == ev.Id && x.Status != BingoTabStatus.Paid)
                .ToListAsync(cancellationToken);

            return tabs
                .Where(x => x.Status == BingoTabStatus.CloseRequested || ev.CloseAllRequested)
                .OrderBy(x => x.TableNumber)
                .ThenBy(x => x.CustomerName)
                .Select(ToAccountDto)
                .ToList();
        }

        public async Task<BingoPayResult> PayAsync(int houseMemberId, BingoPayRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await RequireOpenEventAsync(cancellationToken);
            var ids = (request.TabIds ?? new List<Guid>()).Distinct().ToList();
            if (ids.Count == 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Selecione ao menos uma comanda.");
            }

            var tabs = await Db.BingoTabs
                .Include(x => x.Items)
                .Where(x => x.EventId == ev.Id && ids.Contains(x.Id))
                .ToListAsync(cancellationToken);

            if (tabs.Count != ids.Count)
            {
                throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
            }

            if (tabs.Any(x => x.IsPaid))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Uma das comandas já foi paga.");
            }

            if (tabs.Select(x => x.TableNumber).Distinct().Count() > 1)
            {
                throw new BingoException(BingoErrorKind.Validation, "O pagamento conjunto é só para comandas da mesma mesa.");
            }

            var now = DateTime.UtcNow;
            foreach (var tab in tabs)
            {
                tab.MarkPaid(request.Method, houseMemberId, now);
            }

            await Db.SaveChangesAsync(cancellationToken);
            return new BingoPayResult { PaidCount = tabs.Count, Total = tabs.Sum(x => x.Total) };
        }

        private async Task<Domain.Entities.BingoEvent> RequireOpenEventAsync(CancellationToken cancellationToken)
        {
            return await FindOpenEventAsync(cancellationToken)
                ?? throw new BingoException(BingoErrorKind.Unauthorized, "O bingo está encerrado.");
        }
    }
}
