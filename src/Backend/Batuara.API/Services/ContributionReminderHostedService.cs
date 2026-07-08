using Batuara.Infrastructure.HouseMembers.Services;
using Microsoft.Extensions.Options;

namespace Batuara.API.Services
{
    public class ContributionReminderHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ContributionReminderOptions _options;
        private readonly ILogger<ContributionReminderHostedService> _logger;

        public ContributionReminderHostedService(
            IServiceScopeFactory scopeFactory,
            IOptions<ContributionReminderOptions> options,
            ILogger<ContributionReminderHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _options = options.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.Enabled)
            {
                _logger.LogInformation("Contribution reminder service is disabled");
                return;
            }

            var interval = TimeSpan.FromMinutes(Math.Max(1, _options.IntervalMinutes));

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var processor = scope.ServiceProvider.GetRequiredService<ContributionReminderProcessor>();
                    var sent = await processor.ProcessDueRemindersAsync(stoppingToken);
                    if (sent > 0)
                    {
                        _logger.LogInformation("Contribution reminder service sent {Count} reminders", sent);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Contribution reminder service failed");
                }

                await Task.Delay(interval, stoppingToken);
            }
        }
    }
}
