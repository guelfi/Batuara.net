using Batuara.Application.Bingo.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoPrivacyService : IBingoPrivacyService
    {
        public static readonly TimeSpan Retention = TimeSpan.FromDays(30);

        private readonly BatuaraDbContext _db;

        public BingoPrivacyService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<int> AnonymizeClosedEventsAsync(DateTime utcNow, CancellationToken cancellationToken = default)
        {
            var limit = utcNow - Retention;
            var eventIds = await _db.BingoEvents
                .Where(x => x.Status == BingoEventStatus.Closed && x.ClosedAt != null && x.ClosedAt <= limit)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            if (eventIds.Count == 0)
            {
                return 0;
            }

            var tabs = await _db.BingoTabs
                .Where(x => eventIds.Contains(x.EventId) && x.Phone != null)
                .ToListAsync(cancellationToken);

            foreach (var tab in tabs)
            {
                tab.Anonymize(ToInitials(tab.CustomerName));
            }

            await _db.SaveChangesAsync(cancellationToken);
            return tabs.Count;
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
