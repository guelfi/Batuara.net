using Batuara.Application.Notifications.Services;
using Batuara.Infrastructure.Notifications;
using Microsoft.Extensions.Options;

namespace Batuara.API.Services
{
    public class PendingContactMessagesHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly AdminNotificationOptions _options;
        private readonly ILogger<PendingContactMessagesHostedService> _logger;
        private static readonly TimeSpan RetryDelay = TimeSpan.FromHours(1);
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
                    await Task.Delay(GetDelayUntilNextDigest(), stoppingToken);

                    if (!await TrySendDigestAsync(stoppingToken))
                    {
                        // Uma unica nova tentativa 1h depois, no mesmo dia.
                        await Task.Delay(RetryDelay, stoppingToken);
                        await TrySendDigestAsync(stoppingToken);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }

        private async Task<bool> TrySendDigestAsync(CancellationToken cancellationToken)
        {
            try
            {
                await SendDigestAsync(cancellationToken);
                return true;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Pending contact messages notification failed");
                return false;
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
            var digest = scope.ServiceProvider.GetRequiredService<IPendingDigestService>();
            var whatsApp = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();

            await digest.RunAsync(
                (count, ct) => whatsApp.SendAdminNotificationAsync(_options.Phone, count, ct),
                cancellationToken);
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
