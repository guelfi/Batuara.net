using Batuara.Application.Bingo.Services;
using Batuara.Application.Notifications.Services;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class BingoLinkDispatcher : IBingoLinkDispatcher
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BingoLinkDispatcher> _logger;

        public BingoLinkDispatcher(IServiceScopeFactory scopeFactory, ILogger<BingoLinkDispatcher> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public void Dispatch(Guid tabId, string phone, string customerName, string message)
        {
            _ = Task.Run(() => SendAsync(tabId, phone, customerName, message));
        }

        public async Task SendAsync(Guid tabId, string phone, string customerName, string message)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var whatsApp = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();
                await whatsApp.SendMemberNoticeAsync(phone, customerName, message);

                var db = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
                var tab = await db.BingoTabs.FirstOrDefaultAsync(x => x.Id == tabId);
                if (tab != null)
                {
                    tab.RegisterLinkSent(DateTime.UtcNow);
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao enviar o link da comanda {TabId} por WhatsApp", tabId);
            }
        }
    }
}
