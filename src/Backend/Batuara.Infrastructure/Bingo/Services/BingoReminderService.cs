using System.Globalization;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Bingo.Services
{
    /// <summary>Lembrete pos-evento de comanda em aberto (no maximo um por comanda).</summary>
    public class BingoReminderService : BingoServiceBase, IBingoReminderService
    {
        public static readonly TimeSpan DefaultSendInterval = TimeSpan.FromMilliseconds(300);
        private static readonly CultureInfo PtBr = new("pt-BR");

        private readonly IWhatsAppService _whatsApp;
        private readonly ILogger<BingoReminderService> _logger;
        private readonly TimeSpan _sendInterval;

        public BingoReminderService(BatuaraDbContext db, IWhatsAppService whatsApp, ILogger<BingoReminderService> logger)
            : this(db, whatsApp, logger, DefaultSendInterval)
        {
        }

        public BingoReminderService(BatuaraDbContext db, IWhatsAppService whatsApp, ILogger<BingoReminderService> logger, TimeSpan sendInterval) : base(db)
        {
            _whatsApp = whatsApp;
            _logger = logger;
            _sendInterval = sendInterval;
        }

        public async Task<BingoReminderPreviewDto> PreviewAsync(int eventId, CancellationToken cancellationToken = default)
        {
            var tabs = await LoadEligibleAsync(eventId, cancellationToken);
            return new BingoReminderPreviewDto
            {
                Count = tabs.Count,
                TotalOwed = tabs.Sum(x => x.AmountDue),
                Items = tabs.Select(x => new BingoReminderItemDto
                {
                    TabId = x.Id,
                    CustomerName = x.CustomerName,
                    Mesa = x.TableNumber,
                    Total = x.AmountDue,
                    AmountDue = x.AmountDue,
                    ReminderSentAt = x.ReminderSentAt
                }).ToList()
            };
        }

        public async Task<BingoReminderResultDto> SendAsync(int eventId, bool confirmed, CancellationToken cancellationToken = default)
        {
            if (!confirmed)
            {
                throw new BingoException(BingoErrorKind.Validation, "Confirmação obrigatória para enviar os lembretes.");
            }

            var tabs = await LoadEligibleAsync(eventId, cancellationToken);
            var result = new BingoReminderResultDto();
            var first = true;
            foreach (var tab in tabs)
            {
                if (tab.ReminderSentAt != null)
                {
                    result.Skipped++;
                    continue;
                }

                if (!first && _sendInterval > TimeSpan.Zero)
                {
                    await Task.Delay(_sendInterval, cancellationToken);
                }

                first = false;
                var text = $"Sua comanda do bingo ficou em aberto no valor de R$ {tab.AmountDue.ToString("N2", PtBr)}. Procure a Casa de Caridade para acertar. Obrigado!";
                try
                {
                    var messageId = await _whatsApp.SendMemberNoticeAsync(tab.Phone!, tab.CustomerName, text, cancellationToken);
                    tab.RegisterReminderSent(messageId, DateTime.UtcNow);
                    result.Sent++;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    tab.RegisterReminderFailure("Falha no envio");
                    result.Failed++;
                    _logger.LogWarning(ex, "Falha ao enviar lembrete da comanda {TabId}", tab.Id);
                }

                await Db.SaveChangesAsync(cancellationToken);
            }

            return result;
        }

        private async Task<List<BingoTab>> LoadEligibleAsync(int eventId, CancellationToken cancellationToken)
        {
            var ev = await Db.BingoEvents.FirstOrDefaultAsync(x => x.Id == eventId, cancellationToken)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Evento não encontrado.");
            if (ev.Status != BingoEventStatus.Closed)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Só é possível enviar lembretes de eventos encerrados.");
            }

            var tabs = await Db.BingoTabs.Include(x => x.Items)
                .Where(x => x.EventId == eventId && x.Status != BingoTabStatus.Paid && x.Phone != null)
                .ToListAsync(cancellationToken);
            return tabs.Where(x => x.AmountDue > 0).OrderBy(x => x.TableNumber).ThenBy(x => x.CreatedAt).ToList();
        }
    }
}
