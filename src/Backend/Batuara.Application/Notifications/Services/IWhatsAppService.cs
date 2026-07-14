namespace Batuara.Application.Notifications.Services
{
    public interface IWhatsAppService
    {
        Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default);
        Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default);
        Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default);
    }
}
