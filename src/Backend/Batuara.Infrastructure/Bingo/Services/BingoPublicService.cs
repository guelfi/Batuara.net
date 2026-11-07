using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Application.Common.PhoneNumbers;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoPublicService : BingoServiceBase, IBingoPublicService
    {
        public static readonly TimeSpan LinkCooldown = TimeSpan.FromMinutes(3);

        private readonly IBingoLinkDispatcher _linkDispatcher;
        private readonly BingoOptions _options;

        public BingoPublicService(BatuaraDbContext db, IBingoLinkDispatcher linkDispatcher, IOptions<BingoOptions> options) : base(db)
        {
            _linkDispatcher = linkDispatcher;
            _options = options.Value;
        }

        public async Task<BingoPublicInfoDto> GetInfoAsync(CancellationToken cancellationToken = default)
        {
            var ev = await FindOpenEventAsync(cancellationToken);
            if (ev == null)
            {
                return new BingoPublicInfoDto();
            }

            return new BingoPublicInfoDto
            {
                IsOpen = true,
                CloseAllRequested = ev.CloseAllRequested,
                Mesas = await Db.BingoTables.Where(x => x.EventId == ev.Id).OrderBy(x => x.Number).Select(x => x.Number).ToListAsync(cancellationToken),
                Menu = await GetMenuAsync(ev.Id, cancellationToken)
            };
        }

        public async Task<BingoCreateTabResult> CreateTabAsync(BingoCreateTabRequest request, CancellationToken cancellationToken = default)
        {
            var ev = await FindOpenEventAsync(cancellationToken)
                ?? throw new BingoException(BingoErrorKind.Conflict, "O bingo não está aberto no momento.");

            var phone = PhoneNumberNormalizer.NormalizeBrazilMobile(request.Phone);
            if (string.IsNullOrWhiteSpace(request.CustomerName))
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe o seu nome.");
            }

            if (!await Db.BingoTables.AnyAsync(x => x.EventId == ev.Id && x.Number == request.Mesa, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.Validation, "Mesa inválida.");
            }

            var tab = await Db.BingoTabs.FirstOrDefaultAsync(
                x => x.EventId == ev.Id && x.Phone == phone && x.Status != BingoTabStatus.Paid, cancellationToken);
            var reused = tab != null;
            if (tab == null)
            {
                tab = new BingoTab(ev.Id, request.CustomerName, phone, request.Mesa);
                Db.BingoTabs.Add(tab);
            }

            await QueueLinkAsync(tab, phone, cancellationToken);
            return new BingoCreateTabResult { TabId = tab.Id, Reused = reused };
        }

        public async Task<BingoPublicTabDto> GetTabAsync(Guid tabId, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            var ev = await Db.BingoEvents.FirstAsync(x => x.Id == tab.EventId, cancellationToken);

            return new BingoPublicTabDto
            {
                Id = tab.Id,
                CustomerName = tab.CustomerName,
                Mesa = tab.TableNumber,
                Status = tab.Status,
                Total = tab.Total,
                CloseAllRequested = ev.CloseAllRequested,
                IsOpen = ev.IsOpen,
                Menu = await GetMenuAsync(ev.Id, cancellationToken),
                Items = ToItemDtos(tab.Items)
            };
        }

        public async Task AddItemsAsync(Guid tabId, BingoAddItemsRequest request, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            var ev = await Db.BingoEvents.FirstAsync(x => x.Id == tab.EventId, cancellationToken);
            if (!ev.IsOpen)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O bingo está encerrado; não é possível fazer novos pedidos.");
            }

            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            if (request.Items == null || request.Items.Count == 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe ao menos um item.");
            }

            var menu = await Db.BingoMenuItems.Where(x => x.EventId == ev.Id && x.IsActive).ToListAsync(cancellationToken);
            var newItems = new List<BingoOrderItem>();
            foreach (var line in request.Items)
            {
                if (line.Quantity < 1 || line.Quantity > 20)
                {
                    throw new BingoException(BingoErrorKind.Validation, "A quantidade deve ser de 1 a 20.");
                }

                var menuItem = menu.FirstOrDefault(x => x.Id == line.MenuItemId)
                    ?? throw new BingoException(BingoErrorKind.Validation, "Item do cardápio não encontrado.");
                if (!menuItem.IsAvailable)
                {
                    throw new BingoException(BingoErrorKind.Conflict, $"O item \"{menuItem.Name}\" está esgotado.");
                }

                newItems.Add(new BingoOrderItem(tab.Id, menuItem, line.Quantity));
            }

            Db.BingoOrderItems.AddRange(newItems);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task RequestCloseAsync(Guid tabId, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            tab.RequestClose();
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task ResendLinkAsync(Guid tabId, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (string.IsNullOrEmpty(tab.Phone))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Não há celular registrado para esta comanda.");
            }

            if (!await QueueLinkAsync(tab, tab.Phone, cancellationToken))
            {
                throw new BingoException(BingoErrorKind.TooManyRequests, "Aguarde alguns minutos para reenviar o link.");
            }
        }

        private async Task<bool> QueueLinkAsync(BingoTab tab, string phone, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var since = now - LinkCooldown;
            var recent = await Db.BingoTabs.AnyAsync(x => x.Phone == phone && x.LinkLastAttemptAt > since, cancellationToken);
            if (recent)
            {
                await Db.SaveChangesAsync(cancellationToken);
                return false;
            }

            tab.RegisterLinkAttempt(now);
            await Db.SaveChangesAsync(cancellationToken);

            var baseUrl = string.IsNullOrWhiteSpace(_options.PublicBaseUrl) ? "https://www.batuara.org.br" : _options.PublicBaseUrl.TrimEnd('/');
            var message = $"Sua comanda do bingo está aberta. Acesse: {baseUrl}/bingo/comanda/{tab.Id}";
            _linkDispatcher.Dispatch(tab.Id, phone, tab.CustomerName, message);
            return true;
        }

        private async Task<BingoTab> LoadTabAsync(Guid tabId, CancellationToken cancellationToken)
        {
            return await Db.BingoTabs.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == tabId, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
        }

        private async Task<List<BingoMenuItemDto>> GetMenuAsync(int eventId, CancellationToken cancellationToken)
        {
            var items = await Db.BingoMenuItems
                .Where(x => x.EventId == eventId && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .ToListAsync(cancellationToken);
            return items.Select(ToMenuDto).ToList();
        }
    }
}
