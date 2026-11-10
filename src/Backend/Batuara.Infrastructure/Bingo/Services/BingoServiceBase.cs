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

            var events = await Db.BingoEvents.Where(x => x.Status != BingoEventStatus.Cancelled).ToListAsync(cancellationToken);
            return events
                .OrderBy(x => x.Status == BingoEventStatus.Draft ? 0 : 1)
                .ThenByDescending(x => x.EventDate)
                .ThenByDescending(x => x.Id)
                .FirstOrDefault()
                ?? throw new BingoException(BingoErrorKind.Conflict, "Nenhum evento de bingo cadastrado.");
        }

        protected static List<BingoTabItemDto> ToItemDtos(IEnumerable<BingoOrderItem> items, bool firstNameOnly = false, IReadOnlyDictionary<int, string>? retrieverNames = null)
        {
            return items
                .OrderBy(x => x.CreatedAt)
                .ThenBy(x => x.Id)
                .Select(x => new BingoTabItemDto
                {
                    Id = x.Id,
                    MenuItemId = x.MenuItemId,
                    Name = x.ItemName,
                    UnitPrice = x.UnitPrice,
                    Quantity = x.Quantity,
                    Status = x.Status,
                    DeliveredAt = x.DeliveredAt,
                    DeliveredByName = firstNameOnly ? FirstName(x.DeliveredByName) : x.DeliveredByName,
                    RetrievedByName = x.RetrievedByHouseMemberId != null && retrieverNames != null && retrieverNames.TryGetValue(x.RetrievedByHouseMemberId.Value, out var rn) ? rn : null,
                    ContestedAt = x.ContestedAt,
                    ContestNote = x.ContestNote,
                    CancelledAt = x.CancelledAt,
                    CancelledByName = x.CancelledByName,
                    CancelReason = x.CancelReason
                })
                .ToList();
        }

        protected static string? FirstName(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
            {
                return null;
            }

            return fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];
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
                Status = tab.Status,
                PhoneVerified = tab.IsPhoneVerified,
                Total = tab.Total,
                AmountDue = tab.AmountDue,
                UndeliveredCount = tab.UndeliveredCount,
                ContestedCount = tab.ContestedCount,
                Items = ToItemDtos(tab.Items)
            };
        }

        protected static string NormalizeText(string? value, int min, int max, string message)
        {
            var text = (value ?? string.Empty).Trim();
            if (text.Length < min || text.Length > max)
            {
                throw new BingoException(BingoErrorKind.Validation, message);
            }

            return text;
        }

        protected async Task<BingoOrderItem> LoadItemForChangeAsync(int itemId, int? eventId, CancellationToken cancellationToken)
        {
            var item = await Db.BingoOrderItems.Include(x => x.Tab).ThenInclude(t => t.Items)
                .FirstOrDefaultAsync(x => x.Id == itemId && (eventId == null || x.Tab.EventId == eventId), cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Item não encontrado.");
            if (item.Tab.IsPaid)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Esta comanda já foi paga.");
            }

            return item;
        }

        internal static string NormalizeName(string value)
        {
            var d = (value ?? string.Empty).Trim().ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder();
            foreach (var c in d)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return string.Join(' ', sb.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries));
        }

        /// <summary>Nomes (normalizados) de itens ja usados em qualquer pedido ou comanda por foto, de qualquer evento.</summary>
        protected async Task<HashSet<string>> GetUsedItemNamesAsync(CancellationToken cancellationToken)
        {
            var used = new HashSet<string>();
            var orderNames = await Db.BingoOrderItems.Select(x => x.ItemName).Distinct().ToListAsync(cancellationToken);
            foreach (var n in orderNames)
            {
                used.Add(NormalizeName(n));
            }

            var photoJson = await Db.BingoPhotoTabs.Select(x => x.ItemsJson).ToListAsync(cancellationToken);
            foreach (var json in photoJson)
            {
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    foreach (var el in doc.RootElement.EnumerateArray())
                    {
                        if (el.TryGetProperty("name", out var nm) && nm.GetString() is { } name)
                        {
                            used.Add(NormalizeName(name));
                        }
                    }
                }
                catch (System.Text.Json.JsonException)
                {
                    // registro antigo ilegivel: ignora
                }
            }

            return used;
        }

        protected async Task CancelItemCoreAsync(int itemId, int? eventId, string reason, string actorName, CancellationToken cancellationToken)
        {
            var text = NormalizeText(reason, 3, 200, "Informe o motivo do cancelamento (3 a 200 caracteres).");
            var item = await LoadItemForChangeAsync(itemId, eventId, cancellationToken);
            if (item.Status == BingoOrderItemStatus.Cancelled)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Item já cancelado.");
            }

            item.Cancel(text, actorName, DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        protected async Task ResolveContestationCoreAsync(int itemId, int? eventId, BingoResolveContestRequest request, string actorName, CancellationToken cancellationToken)
        {
            var note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
            if (note != null && note.Length > 200)
            {
                throw new BingoException(BingoErrorKind.Validation, "A observação deve ter até 200 caracteres.");
            }

            var item = await LoadItemForChangeAsync(itemId, eventId, cancellationToken);
            if (item.Status != BingoOrderItemStatus.Contested)
            {
                throw new BingoException(BingoErrorKind.Conflict, "O item não está em contestação.");
            }

            var now = DateTime.UtcNow;
            if (request.Action == BingoContestResolution.ConfirmDelivered)
            {
                item.ResolveAsDelivered(actorName, now);
            }
            else
            {
                item.Cancel(note ?? "Contestação aceita", actorName, now);
                item.MarkResolved(actorName, now);
            }

            await Db.SaveChangesAsync(cancellationToken);
        }

        protected async Task DeliverCoreAsync(BingoOrderItem item, int? houseMemberId, string actorName, CancellationToken cancellationToken)
        {
            switch (item.Status)
            {
                case BingoOrderItemStatus.Delivered:
                    return;
                case BingoOrderItemStatus.Cancelled:
                    throw new BingoException(BingoErrorKind.Conflict, "Item cancelado.");
                case BingoOrderItemStatus.Contested:
                    throw new BingoException(BingoErrorKind.Conflict, "Item em contestação; resolva a contestação.");
            }

            item.Deliver(houseMemberId, actorName, DateTime.UtcNow);
            await Db.SaveChangesAsync(cancellationToken);
        }

        protected async Task<BingoPayResult> PayCoreAsync(List<BingoTab> tabs, List<Guid> ids, int? paymentMethodId, List<BingoPaymentLineDto>? payments, string paidByName, int? paidByHouseMemberId, string? note, CancellationToken cancellationToken)
        {
            if (ids.Count == 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Selecione ao menos uma comanda.");
            }

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

            var blocked = tabs.Where(x => x.UndeliveredCount > 0 || x.ContestedCount > 0).ToList();
            if (blocked.Count > 0)
            {
                throw new BingoException(
                    BingoErrorKind.Conflict,
                    "Há itens não entregues ou em contestação. Entregue, cancele ou resolva antes de cobrar.",
                    "ITEMS_PENDING",
                    new BingoPendingTabsDataDto
                    {
                        Tabs = blocked.Select(x => new BingoPendingTabDto
                        {
                            TabId = x.Id,
                            CustomerName = x.CustomerName,
                            UndeliveredCount = x.UndeliveredCount,
                            ContestedCount = x.ContestedCount
                        }).ToList()
                    });
            }

            // Sem consumo (nada a pagar) nao tem forma de pagamento; com valor a pagar ela e obrigatoria.
            // O pagamento pode ser dividido em varias formas: a soma tem que ser igual ao valor a pagar.
            var totalDue = tabs.Sum(x => x.AmountDue);
            List<List<BingoPaymentPart>>? perTab = null;
            if (totalDue > 0)
            {
                var lines = payments is { Count: > 0 }
                    ? payments
                    : paymentMethodId is int single
                        ? new List<BingoPaymentLineDto> { new() { PaymentMethodId = single, Amount = totalDue } }
                        : throw new BingoException(BingoErrorKind.Validation, "Escolha a forma de pagamento.");
                var active = await Db.BingoPaymentOptions.Where(x => x.IsActive).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
                var parts = BingoPaymentSplit.Build(lines, active, totalDue);
                perTab = BingoPaymentSplit.Allocate(parts, tabs.Select(x => x.AmountDue).ToList());
            }

            var trimmedNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
            if (trimmedNote != null && trimmedNote.Length > 200)
            {
                throw new BingoException(BingoErrorKind.Validation, "A observação deve ter até 200 caracteres.");
            }

            var now = DateTime.UtcNow;
            for (var i = 0; i < tabs.Count; i++)
            {
                if (perTab is null || perTab[i].Count == 0)
                {
                    tabs[i].MarkPaid(null, null, paidByName, paidByHouseMemberId, trimmedNote, now);
                }
                else
                {
                    tabs[i].MarkPaidSplit(perTab[i], paidByName, paidByHouseMemberId, trimmedNote, now);
                }
            }

            await Db.SaveChangesAsync(cancellationToken);
            return new BingoPayResult { PaidCount = tabs.Count, Total = tabs.Sum(x => x.AmountPaid ?? 0m) };
        }
    }
}
