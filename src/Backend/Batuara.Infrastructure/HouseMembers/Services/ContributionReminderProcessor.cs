using Batuara.Application.Notifications.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.HouseMembers.Services
{
    public class ContributionReminderProcessor
    {
        private readonly BatuaraDbContext _db;
        private readonly IWhatsAppService _whatsAppService;
        private readonly ContributionReminderOptions _options;
        private readonly ILogger<ContributionReminderProcessor> _logger;

        public ContributionReminderProcessor(
            BatuaraDbContext db,
            IWhatsAppService whatsAppService,
            IOptions<ContributionReminderOptions> options,
            ILogger<ContributionReminderProcessor> logger)
        {
            _db = db;
            _whatsAppService = whatsAppService;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<int> ProcessDueRemindersAsync(CancellationToken cancellationToken = default)
        {
            if (!_options.Enabled)
            {
                return 0;
            }

            var now = DateTime.UtcNow;
            var dueLimit = now.Date.AddDays(Math.Max(0, _options.DaysBeforeDue));
            var retryBefore = now.AddMinutes(-Math.Max(1, _options.RetryIntervalMinutes));
            var batchSize = Math.Max(1, _options.MaxMessagesPerRun);
            var maxAttempts = Math.Max(1, _options.MaxAttempts);

            var contributions = await _db.HouseMemberContributions
                .Include(x => x.HouseMember)
                .Where(x =>
                    x.Status == ContributionPaymentStatus.Pending &&
                    x.AllowWhatsAppReminder &&
                    x.ReminderSentAt == null &&
                    x.ReminderAttemptCount < maxAttempts &&
                    x.DueDate.Date <= dueLimit &&
                    (x.ReminderLastAttemptAt == null || x.ReminderLastAttemptAt <= retryBefore) &&
                    x.HouseMember != null &&
                    x.HouseMember.IsActive &&
                    x.HouseMember.MobilePhone != null)
                .OrderBy(x => x.DueDate)
                .ThenBy(x => x.Id)
                .Take(batchSize)
                .ToListAsync(cancellationToken);

            var sent = 0;
            foreach (var contribution in contributions)
            {
                try
                {
                    await _whatsAppService.SendContributionReminderAsync(
                        contribution.HouseMember!.MobilePhone!,
                        contribution.HouseMember.FullName,
                        contribution.DueDate,
                        contribution.Amount,
                        cancellationToken);

                    contribution.MarkReminderSent(now);
                    sent += 1;
                }
                catch (Exception ex)
                {
                    contribution.MarkReminderAttempt(now);
                    _logger.LogWarning(ex, "Failed to send contribution reminder for contribution {ContributionId}", contribution.Id);
                }

                await _db.SaveChangesAsync(cancellationToken);
            }

            return sent;
        }
    }
}
