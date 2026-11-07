using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoPrivacyService : IBingoPrivacyService
    {
        private readonly BatuaraDbContext _db;
        private readonly BingoOptions _options;

        public BingoPrivacyService(BatuaraDbContext db, IOptions<BingoOptions>? options = null)
        {
            _db = db;
            _options = options?.Value ?? new BingoOptions();
        }

        public async Task<int> AnonymizeClosedEventsAsync(DateTime utcNow, CancellationToken cancellationToken = default)
        {
            var paidDays = _options.PaidRetentionDays > 0 ? _options.PaidRetentionDays : 30;
            var unpaidDays = _options.UnpaidRetentionDays > 0 ? _options.UnpaidRetentionDays : 90;
            var closedEvents = await _db.BingoEvents
                .Where(x => x.Status == BingoEventStatus.Closed && x.ClosedAt != null)
                .Select(x => new { x.Id, ClosedAt = x.ClosedAt!.Value })
                .ToListAsync(cancellationToken);

            var paidEventIds = closedEvents.Where(x => x.ClosedAt <= utcNow.AddDays(-paidDays)).Select(x => x.Id).ToList();
            var unpaidEventIds = closedEvents.Where(x => x.ClosedAt <= utcNow.AddDays(-unpaidDays)).Select(x => x.Id).ToList();
            if (paidEventIds.Count == 0)
            {
                return 0;
            }

            var tabs = await _db.BingoTabs
                .Where(x => paidEventIds.Contains(x.EventId) && x.Phone != null)
                .ToListAsync(cancellationToken);

            var count = 0;
            foreach (var tab in tabs)
            {
                // Pagas: retencao curta. Nao pagas: o telefone e necessario para cobrar, retencao longa.
                if (!tab.IsPaid && !unpaidEventIds.Contains(tab.EventId))
                {
                    continue;
                }

                tab.Anonymize(ToInitials(tab.CustomerName));
                count++;
            }

            await _db.SaveChangesAsync(cancellationToken);
            return count;
        }

        public static string ToInitials(string name)
        {
            var initials = (name ?? string.Empty)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(w => w.FirstOrDefault(char.IsLetter))
                .Where(c => c != default)
                .Select(c => char.ToUpperInvariant(c) + ".");

            var result = string.Join(' ', initials);
            return result.Length == 0 ? "-" : result;
        }
    }
}
