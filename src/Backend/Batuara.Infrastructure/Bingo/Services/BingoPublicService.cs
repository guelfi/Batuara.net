using System.Security.Cryptography;
using Batuara.Application.Auth.Services;
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
        public static readonly TimeSpan CodeValidity = TimeSpan.FromMinutes(30);
        public static readonly TimeSpan ResendInterval = TimeSpan.FromSeconds(60);
        public static readonly TimeSpan HourlyWindow = TimeSpan.FromHours(1);
        public const int MaxVerificationAttempts = 5;
        public const int MaxCodesPerHour = 3;

        private readonly IBingoCodeDispatcher _codeDispatcher;
        private readonly IPasswordService _passwordService;
        private readonly BingoOptions _options;

        public BingoPublicService(BatuaraDbContext db, IBingoCodeDispatcher codeDispatcher, IPasswordService passwordService, IOptions<BingoOptions> options) : base(db)
        {
            _codeDispatcher = codeDispatcher;
            _passwordService = passwordService;
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

            if (!reused)
            {
                // Quem volta a abrir comanda no mesmo evento com o mesmo celular ja confirmado nao precisa de novo codigo.
                var verifiedAt = await Db.BingoTabs
                    .Where(x => x.EventId == ev.Id && x.Phone == phone && x.PhoneVerifiedAt != null)
                    .Select(x => x.PhoneVerifiedAt)
                    .FirstOrDefaultAsync(cancellationToken);
                if (verifiedAt != null)
                {
                    tab.InheritPhoneVerification(verifiedAt.Value);
                    await Db.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    await IssueAndDispatchCodeAsync(tab, phone, cancellationToken);
                }
            }

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
                AmountDue = tab.AmountDue,
                UndeliveredCount = tab.UndeliveredCount,
                ContestedCount = tab.ContestedCount,
                CloseAllRequested = ev.CloseAllRequested,
                IsOpen = ev.IsOpen,
                PhoneVerified = tab.IsPhoneVerified,
                Menu = await GetMenuAsync(ev.Id, cancellationToken),
                Items = ToItemDtos(tab.Items, firstNameOnly: true)
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

        public async Task ContestItemAsync(Guid tabId, int itemId, string? note, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            var text = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
            if (text != null && text.Length > 200)
            {
                throw new BingoException(BingoErrorKind.Validation, "A observação deve ter até 200 caracteres.");
            }

            var item = tab.Items.FirstOrDefault(x => x.Id == itemId)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item não encontrado.");
            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            if (item.Status != BingoOrderItemStatus.Delivered)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Só é possível contestar um item já entregue.");
            }

            item.Contest(text, DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task RequestCloseAsync(Guid tabId, bool cancelUndelivered = false, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            if (_options.RequirePhoneVerificationToClose && !tab.IsPhoneVerified)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Confirme seu celular para encerrar a conta", "PHONE_NOT_VERIFIED");
            }

            var undelivered = tab.Items
                .Where(x => x.Status == BingoOrderItemStatus.Pending || x.Status == BingoOrderItemStatus.Retrieved)
                .OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
                .ToList();
            if (undelivered.Count > 0)
            {
                if (!cancelUndelivered)
                {
                    throw new BingoException(
                        BingoErrorKind.Conflict,
                        "Há itens ainda não entregues.",
                        "UNDELIVERED_ITEMS",
                        new BingoUndeliveredDataDto
                        {
                            Items = undelivered.Select(x => new BingoUndeliveredItemDto { Id = x.Id, Name = x.ItemName, Quantity = x.Quantity, Status = x.Status }).ToList()
                        });
                }

                var now = DateTime.UtcNow;
                foreach (var item in undelivered)
                {
                    item.Cancel("Cancelado pelo cliente ao encerrar", tab.CustomerName, now);
                }
            }

            tab.RequestClose();
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<BingoCreateTabResult> ReopenAsync(Guid tabId, int mesa, CancellationToken cancellationToken = default)
        {
            var previous = await LoadTabAsync(tabId, cancellationToken);
            if (string.IsNullOrWhiteSpace(previous.Phone))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Os dados desta comanda já foram apagados. Abra uma nova comanda.");
            }

            return await CreateTabAsync(new BingoCreateTabRequest { CustomerName = previous.CustomerName, Phone = previous.Phone, Mesa = mesa }, cancellationToken);
        }

        public async Task CancelCloseAsync(Guid tabId, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            tab.CancelClose();
            await Db.SaveChangesAsync(cancellationToken);
        }

        public async Task<BingoConfirmPhoneResult> ConfirmPhoneAsync(Guid tabId, string code, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (tab.IsPhoneVerified)
            {
                return new BingoConfirmPhoneResult { Verified = true };
            }

            if (tab.VerificationAttempts >= MaxVerificationAttempts)
            {
                throw new BingoException(BingoErrorKind.TooManyRequests, "Muitas tentativas. Peça um novo código.");
            }

            var now = DateTime.UtcNow;
            if (string.IsNullOrEmpty(tab.VerificationCodeHash)
                || tab.VerificationCodeExpiresAt == null
                || tab.VerificationCodeExpiresAt <= now
                || string.IsNullOrWhiteSpace(code))
            {
                throw new BingoException(BingoErrorKind.Validation, "Código inválido ou expirado.");
            }

            tab.RegisterVerificationAttempt();
            if (!_passwordService.VerifyPassword(code.Trim(), tab.VerificationCodeHash))
            {
                await Db.SaveChangesAsync(cancellationToken);
                throw new BingoException(BingoErrorKind.Validation, "Código inválido ou expirado.");
            }

            tab.ConfirmPhone(now);
            await Db.SaveChangesAsync(cancellationToken);
            return new BingoConfirmPhoneResult { Verified = true };
        }

        public async Task ResendCodeAsync(Guid tabId, CancellationToken cancellationToken = default)
        {
            var tab = await LoadTabAsync(tabId, cancellationToken);
            if (string.IsNullOrEmpty(tab.Phone))
            {
                throw new BingoException(BingoErrorKind.Conflict, "Não há celular registrado para esta comanda.");
            }

            if (tab.IsPhoneVerified)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O celular desta comanda já foi confirmado.");
            }

            var now = DateTime.UtcNow;
            if (tab.CodeLastSentAt != null && now - tab.CodeLastSentAt.Value < ResendInterval)
            {
                throw new BingoException(BingoErrorKind.TooManyRequests, "Aguarde um minuto para pedir um novo código.");
            }

            var windowStart = now - HourlyWindow;
            var phone = tab.Phone;
            var sentLastHour = await Db.BingoTabs
                .Where(x => x.Phone == phone && x.CodeWindowStartedAt != null && x.CodeWindowStartedAt > windowStart)
                .SumAsync(x => x.CodeSendCount, cancellationToken);
            if (sentLastHour >= MaxCodesPerHour)
            {
                throw new BingoException(BingoErrorKind.TooManyRequests, "Limite de códigos por hora atingido. Tente mais tarde.");
            }

            await IssueAndDispatchCodeAsync(tab, phone, cancellationToken);
        }

        private async Task IssueAndDispatchCodeAsync(BingoTab tab, string phone, CancellationToken cancellationToken)
        {
            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
            tab.IssueVerificationCode(_passwordService.HashPassword(code), DateTime.UtcNow, CodeValidity);
            await Db.SaveChangesAsync(cancellationToken);
            _codeDispatcher.Dispatch(tab.Id, phone, code);
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
