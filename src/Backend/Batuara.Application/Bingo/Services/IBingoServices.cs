using Batuara.Application.Bingo.Models;

namespace Batuara.Application.Bingo.Services
{
    public interface IBingoPublicService
    {
        Task<BingoPublicInfoDto> GetInfoAsync(CancellationToken cancellationToken = default);
        Task<BingoCreateTabResult> CreateTabAsync(BingoCreateTabRequest request, CancellationToken cancellationToken = default);
        Task<BingoPublicTabDto> GetTabAsync(Guid tabId, CancellationToken cancellationToken = default);
        Task AddItemsAsync(Guid tabId, BingoAddItemsRequest request, CancellationToken cancellationToken = default);
        Task<BingoCreateTabResult> ReopenAsync(Guid tabId, int mesa, CancellationToken cancellationToken = default);
        Task CancelCloseAsync(Guid tabId, CancellationToken cancellationToken = default);
        Task RequestCloseAsync(Guid tabId, bool cancelUndelivered = false, CancellationToken cancellationToken = default);
        Task ContestItemAsync(Guid tabId, int itemId, string? note, CancellationToken cancellationToken = default);
        Task<BingoConfirmPhoneResult> ConfirmPhoneAsync(Guid tabId, string code, CancellationToken cancellationToken = default);
        Task ResendCodeAsync(Guid tabId, CancellationToken cancellationToken = default);
    }

    public interface IBingoCodeDispatcher
    {
        void Dispatch(Guid tabId, string phone, string code);
    }

    public interface IBingoReminderService
    {
        Task<BingoReminderPreviewDto> PreviewAsync(int eventId, CancellationToken cancellationToken = default);
        Task<BingoReminderResultDto> SendAsync(int eventId, bool confirmed, CancellationToken cancellationToken = default);
    }

    public interface IBingoWaiterService
    {
        Task<BingoWaiterMeDto> GetMeAsync(int houseMemberId, CancellationToken cancellationToken = default);
        Task EnsureAccessAsync(int houseMemberId, CancellationToken cancellationToken = default);
        Task<List<BingoWaiterOrderDto>> GetOrdersAsync(int houseMemberId, CancellationToken cancellationToken = default);
        Task RetrieveAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default);
        Task ReturnAsync(int itemId, CancellationToken cancellationToken = default);
        Task DeliverAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default);
        Task CancelItemAsync(int houseMemberId, int itemId, string reason, CancellationToken cancellationToken = default);
        Task ResolveContestationAsync(int houseMemberId, int itemId, BingoResolveContestRequest request, CancellationToken cancellationToken = default);
        Task<List<BingoPaymentMethodDto>> GetPaymentMethodsAsync(CancellationToken cancellationToken = default);
        Task ChangeTableAsync(Guid tabId, int mesa, CancellationToken cancellationToken = default);
        Task<List<BingoAccountDto>> GetAccountsAsync(bool all = false, CancellationToken cancellationToken = default);
        Task<BingoExitCheckDto> GetExitCheckByCodeAsync(string code, CancellationToken cancellationToken = default);
        Task<BingoExitCheckDto> GetExitCheckAsync(Guid tabId, CancellationToken cancellationToken = default);
        Task<BingoExitCheckDto> ReleaseExitAsync(int houseMemberId, Guid tabId, CancellationToken cancellationToken = default);
        Task<BingoPayResult> PayAsync(int houseMemberId, BingoPayRequest request, CancellationToken cancellationToken = default);
    }

    public interface IBingoAdminService
    {
        Task<BingoSettingsDto> GetSettingsAsync(int? eventId, CancellationToken cancellationToken = default);
        Task<BingoSettingsDto> UpdateSettingsAsync(int? eventId, BingoUpdateSettingsRequest request, CancellationToken cancellationToken = default);

        Task<List<BingoAdminMenuItemDto>> GetMenuAsync(int? eventId, CancellationToken cancellationToken = default);
        Task<BingoAdminMenuItemDto> CreateMenuItemAsync(int? eventId, BingoMenuItemRequest request, CancellationToken cancellationToken = default);
        Task<BingoAdminMenuItemDto> UpdateMenuItemAsync(int id, BingoMenuItemRequest request, CancellationToken cancellationToken = default);
        Task DeleteMenuItemAsync(int id, CancellationToken cancellationToken = default);
        Task<BingoAdminMenuItemDto> SetMenuItemAvailabilityAsync(int id, bool isAvailable, CancellationToken cancellationToken = default);

        Task<BingoTablesDto> GetTablesAsync(int? eventId, CancellationToken cancellationToken = default);
        Task<BingoTablesDto> SetTablesAsync(int? eventId, int quantidade, CancellationToken cancellationToken = default);

        Task<List<BingoAdminWaiterDto>> GetWaitersAsync(int? eventId, CancellationToken cancellationToken = default);
        Task AddWaiterAsync(int? eventId, int houseMemberId, CancellationToken cancellationToken = default);
        Task RemoveWaiterAsync(int? eventId, int houseMemberId, CancellationToken cancellationToken = default);
        Task<int> EndWaiterSessionsAsync(int? eventId, CancellationToken cancellationToken = default);

        Task<BingoPanelDto> GetPanelAsync(int? eventId, CancellationToken cancellationToken = default);
        Task<BingoSummaryDto> GetSummaryAsync(int? eventId, CancellationToken cancellationToken = default);
        Task<BingoPayResult> PayTabsAsync(string actorName, BingoAdminPayRequest request, CancellationToken cancellationToken = default);
        Task CancelItemAsync(string actorName, int itemId, string reason, CancellationToken cancellationToken = default);
        Task ResolveContestationAsync(string actorName, int itemId, BingoResolveContestRequest request, CancellationToken cancellationToken = default);
        Task DeliverItemAsync(string actorName, int itemId, CancellationToken cancellationToken = default);
        Task<List<BingoAccountDto>> GetTableTabsAsync(int? eventId, int mesa, CancellationToken cancellationToken = default);
        Task<List<BingoAdminPaymentMethodDto>> GetPaymentMethodsAsync(CancellationToken cancellationToken = default);
        Task<BingoAdminPaymentMethodDto> CreatePaymentMethodAsync(BingoPaymentMethodRequest request, CancellationToken cancellationToken = default);
        Task<BingoAdminPaymentMethodDto> UpdatePaymentMethodAsync(int id, BingoPaymentMethodRequest request, CancellationToken cancellationToken = default);
        Task DeletePaymentMethodAsync(int id, CancellationToken cancellationToken = default);
        Task ResetAsync(int? eventId, bool confirmed, CancellationToken cancellationToken = default);

        Task<List<BingoEventDto>> GetEventsAsync(CancellationToken cancellationToken = default);
        Task<BingoEventDto> CreateEventAsync(BingoCreateEventRequest request, CancellationToken cancellationToken = default);
        Task<BingoEventDto> OpenEventAsync(int eventId, CancellationToken cancellationToken = default);
        Task<BingoEventDto> CloseEventAsync(int eventId, CancellationToken cancellationToken = default);
        Task<BingoSummaryDto> GetEventSummaryAsync(int eventId, CancellationToken cancellationToken = default);
        Task<List<BingoHistoryTabDto>> GetEventTabsAsync(int eventId, CancellationToken cancellationToken = default);
    }

    public interface IBingoPrivacyService
    {
        Task<int> AnonymizeClosedEventsAsync(DateTime utcNow, CancellationToken cancellationToken = default);
    }
}
