using Batuara.Application.Bingo.Services;

namespace Batuara.API.Services
{
    public class BingoPrivacyHostedService : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BingoPrivacyHostedService> _logger;

        public BingoPrivacyHostedService(IServiceScopeFactory scopeFactory, ILogger<BingoPrivacyHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var privacy = scope.ServiceProvider.GetRequiredService<IBingoPrivacyService>();
                    var count = await privacy.AnonymizeClosedEventsAsync(DateTime.UtcNow, stoppingToken);
                    if (count > 0)
                    {
                        _logger.LogInformation("Bingo: {Count} comandas anonimizadas (LGPD)", count);
                    }

                    await Task.Delay(Interval, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Falha ao anonimizar comandas do bingo");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
        }
    }
}
