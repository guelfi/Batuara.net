using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Notifications
{
    /// <summary>
    /// Regra do digest (PM-049): lembrete diario enquanto houver pendencia.
    /// Pendencia: mensagem New/InProgress nao lida, ou mensagem lida com replica nova do visitante
    /// (WhatsAppMessages.IsFromMe == false) com SentAt &gt; lastDigestAt. Resolved/Archived nunca contam.
    /// lastDigestAt = ultimo envio registrado (ou agora - 24h no primeiro run) — usado apenas para
    /// delimitar replicas novas do visitante. Envia sempre que o total de pendencias for maior que zero.
    /// </summary>
    public class PendingContactDigestService : IPendingDigestService
    {
        private static readonly TimeSpan FirstRunWindow = TimeSpan.FromHours(24);

        private readonly BatuaraDbContext _db;
        private readonly ILogger<PendingContactDigestService> _logger;

        public PendingContactDigestService(BatuaraDbContext db, ILogger<PendingContactDigestService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<int?> RunAsync(Func<int, CancellationToken, Task> send, CancellationToken cancellationToken = default)
        {
            var startedAt = DateTime.UtcNow;
            var state = await _db.AdminDigestStates
                .FirstOrDefaultAsync(x => x.Key == AdminDigestState.PendingContactsKey, cancellationToken);
            var lastDigestAt = state?.LastSentAt ?? startedAt - FirstRunWindow;

            var open = _db.ContactMessages.Where(x =>
                x.Status == ContactMessageStatus.New || x.Status == ContactMessageStatus.InProgress);

            var pending = await open.CountAsync(x =>
                !x.IsRead || x.WhatsAppMessages.Any(m => !m.IsFromMe && m.SentAt > lastDigestAt),
                cancellationToken);

            if (pending == 0)
            {
                _logger.LogInformation("No pending contact messages; admin digest skipped");
                return null;
            }

            await send(pending, cancellationToken);

            if (state == null)
            {
                _db.AdminDigestStates.Add(new AdminDigestState(AdminDigestState.PendingContactsKey, startedAt, pending));
            }
            else
            {
                state.RegisterSent(startedAt, pending);
            }

            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Admin digest sent: {Count} pending contact messages", pending);
            return pending;
        }
    }
}
