using Batuara.Application.Notifications.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Batuara.API.Services
{
    public class PendingContactMessagesHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly AdminNotificationOptions _options;
        private readonly ILogger<PendingContactMessagesHostedService> _logger;
        private static readonly TimeZoneInfo SaoPauloTimeZone = ResolveSaoPauloTimeZone();

        public PendingContactMessagesHostedService(
            IServiceScopeFactory scopeFactory,
            IOptions<AdminNotificationOptions> options,
            ILogger<PendingContactMessagesHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.Phone))
            {
                _logger.LogInformation("Pending contact messages notification service is disabled");
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var delay = GetDelayUntilNextDigest();
                    await Task.Delay(delay, stoppingToken);
                    await SendDigestAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Pending contact messages notification failed");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
        }

        private TimeSpan GetDelayUntilNextDigest()
        {
            var hour = Math.Clamp(_options.DigestHour, 0, 23);
            var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, SaoPauloTimeZone);
            var nextLocal = nowLocal.Date.AddHours(hour);
            if (nextLocal <= nowLocal)
            {
                nextLocal = nextLocal.AddDays(1);
            }

            var nextUtc = TimeZoneInfo.ConvertTimeToUtc(nextLocal, SaoPauloTimeZone);
            return nextUtc - DateTime.UtcNow;
        }

        private async Task SendDigestAsync(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
            var whatsApp = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();

            var pending = await db.ContactMessages.CountAsync(
                x => x.Status == ContactMessageStatus.New || x.Status == ContactMessageStatus.InProgress,
                cancellationToken);

            if (pending == 0)
            {
                _logger.LogInformation("No pending contact messages; admin digest skipped");
                return;
            }

            await whatsApp.SendAdminNotificationAsync(_options.Phone, pending, cancellationToken);
            _logger.LogInformation("Admin digest sent: {Count} pending contact messages", pending);
        }

        private static TimeZoneInfo ResolveSaoPauloTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.CreateCustomTimeZone("America/Sao_Paulo", TimeSpan.FromHours(-3), "Sao Paulo", "Sao Paulo");
            }
        }
    }
}
