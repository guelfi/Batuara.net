using Batuara.Application.Bingo.Models;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Bingo.Services
{
    public abstract class BingoServiceBase
    {
        protected readonly BatuaraDbContext Db;

        protected BingoServiceBase(BatuaraDbContext db)
        {
            Db = db;
        }

        protected Task<BingoEvent?> FindOpenEventAsync(CancellationToken cancellationToken)
        {
            return Db.BingoEvents.FirstOrDefaultAsync(x => x.Status == BingoEventStatus.Open, cancellationToken);
        }

        protected async Task<BingoEvent> ResolveAdminEventAsync(int? eventId, CancellationToken cancellationToken)
        {
            if (eventId.HasValue)
            {
                return await Db.BingoEvents.FirstOrDefaultAsync(x => x.Id == eventId.Value, cancellationToken)
                    ?? throw new BingoException(BingoErrorKind.NotFound, "Evento não encontrado.");
            }

            var open = await FindOpenEventAsync(cancellationToken);
            if (open != null)
            {
                return open;
            }

            var events = await Db.BingoEvents.ToListAsync(cancellationToken);
            return events
                .OrderBy(x => x.Status == BingoEventStatus.Draft ? 0 : 1)
                .ThenByDescending(x => x.EventDate)
                .ThenByDescending(x => x.Id)
                .FirstOrDefault()
                ?? throw new BingoException(BingoErrorKind.Conflict, "Nenhum evento de bingo cadastrado.");
        }

        protected static List<BingoTabItemDto> ToItemDtos(IEnumerable<BingoOrderItem> items)
        {
            return items
                .OrderBy(x => x.CreatedAt)
                .ThenBy(x => x.Id)
                .Select(x => new BingoTabItemDto
                {
                    Id = x.Id,
                    Name = x.ItemName,
                    UnitPrice = x.UnitPrice,
                    Quantity = x.Quantity,
                    Status = x.Status
                })
                .ToList();
        }

        protected static BingoMenuItemDto ToMenuDto(BingoMenuItem item)
        {
            return new BingoMenuItemDto
            {
                Id = item.Id,
                Name = item.Name,
                UnitPrice = item.UnitPrice,
                IsAvailable = item.IsAvailable
            };
        }

        protected static BingoAccountDto ToAccountDto(BingoTab tab)
        {
            return new BingoAccountDto
            {
                TabId = tab.Id,
                Mesa = tab.TableNumber,
                CustomerName = tab.CustomerName,
                Total = tab.Total,
                Status = tab.Status
            };
        }
    }
}
