namespace Batuara.Application.Notifications.Services
{
    public interface IWhatsAppService
    {
        Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default);
        Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default);
        Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default);
        Task SendAdminNotificationAsync(string phoneE164, int pendingCount, CancellationToken cancellationToken = default);
        Task SendBirthdayGreetingAsync(string phoneE164, string memberName, CancellationToken cancellationToken = default);
        Task SendEventInviteAsync(string phoneE164, string memberName, string eventName, string eventDate, CancellationToken cancellationToken = default);
        Task SendMemberNoticeAsync(string phoneE164, string memberName, string noticeText, CancellationToken cancellationToken = default);
        Task SendSiteTutorialLinkAsync(string phoneE164, string memberName, string tutorialUrl, CancellationToken cancellationToken = default);
    }
}
