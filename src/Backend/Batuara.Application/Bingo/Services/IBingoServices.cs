using Batuara.Application.Bingo.Models;

namespace Batuara.Application.Bingo.Services
{
    public interface IBingoPublicService
    {
        Task<BingoPublicInfoDto> GetInfoAsync(CancellationToken cancellationToken = default);
        Task<BingoCreateTabResult> CreateTabAsync(BingoCreateTabRequest request, CancellationToken cancellationToken = default);
        Task<BingoPublicTabDto> GetTabAsync(Guid tabId, CancellationToken cancellationToken = default);
        Task AddItemsAsync(Guid tabId, BingoAddItemsRequest request, CancellationToken cancellationToken = default);
        Task RequestCloseAsync(Guid tabId, CancellationToken cancellationToken = default);
        Task ResendLinkAsync(Guid tabId, CancellationToken cancellationToken = default);
    }

    public interface IBingoLinkDispatcher
    {
        void Dispatch(Guid tabId, string phone, string customerName, string message);
    }

    public interface IBingoWaiterService
    {
        Task<BingoWaiterLoginResponse> VerifyCodeAsync(BingoWaiterVerifyCodeRequest request, CancellationToken cancellationToken = default);
        Task EnsureAccessAsync(int houseMemberId, CancellationToken cancellationToken = default);
        Task<List<BingoWaiterOrderDto>> GetOrdersAsync(CancellationToken cancellationToken = default);
        Task DeliverAsync(int houseMemberId, int itemId, CancellationToken cancellationToken = default);
        Task ChangeTableAsync(Guid tabId, int mesa, CancellationToken cancellationToken = default);
        Task<List<BingoAccountDto>> GetAccountsAsync(CancellationToken cancellationToken = default);
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
        Task PayTabAsync(Guid tabId, BingoPayOneRequest request, CancellationToken cancellationToken = default);
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
