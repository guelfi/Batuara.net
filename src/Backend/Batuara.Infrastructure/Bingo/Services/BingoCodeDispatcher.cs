using Batuara.Application.Bingo.Services;
using Batuara.Application.Notifications.Services;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Bingo.Services
{
    /// <summary>
    /// Envia o codigo de confirmacao do celular (template de autenticacao) em segundo plano.
    /// Nunca bloqueia nem derruba a criacao da comanda; falhas sao registradas na propria comanda.
    /// </summary>
    public class BingoCodeDispatcher : IBingoCodeDispatcher
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BingoCodeDispatcher> _logger;

        public BingoCodeDispatcher(IServiceScopeFactory scopeFactory, ILogger<BingoCodeDispatcher> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public void Dispatch(Guid tabId, string phone, string code)
        {
            _ = Task.Run(() => SendAsync(tabId, phone, code));
        }

        public async Task SendAsync(Guid tabId, string phone, string code)
        {
            string? messageId = null;
            string? error = null;
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var whatsApp = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();
                messageId = await whatsApp.SendAuthCodeAsync(phone, code);
            }
            catch (Exception ex)
            {
                error = "Falha no envio";
                _logger.LogWarning(ex, "Falha ao enviar o codigo da comanda {TabId} por WhatsApp", tabId);
            }

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
                var tab = await db.BingoTabs.FirstOrDefaultAsync(x => x.Id == tabId);
                if (tab != null)
                {
                    if (error == null)
                    {
                        tab.RegisterCodeSent(messageId);
                    }
                    else
                    {
                        tab.RegisterCodeSendFailure(error);
                    }

                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao registrar o envio do codigo da comanda {TabId}", tabId);
            }
        }
    }
}
