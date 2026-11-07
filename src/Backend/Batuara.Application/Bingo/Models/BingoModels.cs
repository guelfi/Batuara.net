using Batuara.Domain.Enums;

namespace Batuara.Application.Bingo.Models
{
    public class BingoOptions
    {
        public const string SectionName = "Bingo";
        public double WaiterSessionHours { get; set; } = 10;
        public bool RequirePhoneVerificationToClose { get; set; }
        public int PaidRetentionDays { get; set; } = 30;
        public int UnpaidRetentionDays { get; set; } = 90;
    }

    public enum BingoErrorKind
    {
        Validation,
        NotFound,
        Conflict,
        Unauthorized,
        Forbidden,
        TooManyRequests
    }

    public class BingoException : Exception
    {
        public BingoErrorKind Kind { get; }
        public string? Code { get; }
        public object? Data { get; }

        public BingoException(BingoErrorKind kind, string message, string? code = null, object? data = null) : base(message)
        {
            Kind = kind;
            Code = code;
            Data = data;
        }
    }

    public class BingoMenuItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class BingoAdminMenuItemDto : BingoMenuItemDto
    {
        public int SortOrder { get; set; }
    }

    public class BingoPublicInfoDto
    {
        public bool IsOpen { get; set; }
        public bool CloseAllRequested { get; set; }
        public List<int> Mesas { get; set; } = new();
        public List<BingoMenuItemDto> Menu { get; set; } = new();
    }

    public class BingoCreateTabRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int Mesa { get; set; }
    }

    public class BingoCreateTabResult
    {
        public Guid TabId { get; set; }
        public bool Reused { get; set; }
    }

    public class BingoConfirmPhoneRequest
    {
        public string Code { get; set; } = string.Empty;
    }

    public class BingoConfirmPhoneResult
    {
        public bool Verified { get; set; }
    }

    public class BingoConfirmReminderRequest
    {
        public bool Confirmar { get; set; }
    }

    public class BingoReminderItemDto
    {
        public Guid TabId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Mesa { get; set; }
        public decimal Total { get; set; }
        public decimal AmountDue { get; set; }
        public DateTime? ReminderSentAt { get; set; }
    }

    public class BingoReminderPreviewDto
    {
        public int Count { get; set; }
        public decimal TotalOwed { get; set; }
        public List<BingoReminderItemDto> Items { get; set; } = new();
    }

    public class BingoReminderResultDto
    {
        public int Sent { get; set; }
        public int Skipped { get; set; }
        public int Failed { get; set; }
    }

    public class BingoTabItemDto
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public BingoOrderItemStatus Status { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? DeliveredByName { get; set; }
        public string? RetrievedByName { get; set; }
        public DateTime? ContestedAt { get; set; }
        public string? ContestNote { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancelledByName { get; set; }
        public string? CancelReason { get; set; }
    }

    public class BingoCloseRequest
    {
        public bool? CancelUndelivered { get; set; }
    }

    public class BingoContestRequest
    {
        public string? Note { get; set; }
    }

    public class BingoCancelItemRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public enum BingoContestResolution
    {
        ConfirmDelivered,
        Cancel
    }

    public class BingoResolveContestRequest
    {
        public BingoContestResolution Action { get; set; }
        public string? Note { get; set; }
    }

    public class BingoUndeliveredItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public BingoOrderItemStatus Status { get; set; }
    }

    public class BingoUndeliveredDataDto
    {
        public List<BingoUndeliveredItemDto> Items { get; set; } = new();
    }

    public class BingoPendingTabDto
    {
        public Guid TabId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int UndeliveredCount { get; set; }
        public int ContestedCount { get; set; }
    }

    public class BingoPendingTabsDataDto
    {
        public List<BingoPendingTabDto> Tabs { get; set; } = new();
    }

    public class BingoPaymentMethodDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class BingoAdminPaymentMethodDto : BingoPaymentMethodDto
    {
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
    }

    public class BingoPaymentMethodRequest
    {
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int SortOrder { get; set; }
    }

    public class BingoPublicTabDto
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Mesa { get; set; }
        public BingoTabStatus Status { get; set; }
        public decimal Total { get; set; }
        public decimal AmountDue { get; set; }
        public int UndeliveredCount { get; set; }
        public int ContestedCount { get; set; }
        public bool CloseAllRequested { get; set; }
        public bool IsOpen { get; set; }
        public bool PhoneVerified { get; set; }
        public List<BingoMenuItemDto> Menu { get; set; } = new();
        public List<BingoTabItemDto> Items { get; set; } = new();
    }

    public class BingoOrderLineRequest
    {
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class BingoAddItemsRequest
    {
        public List<BingoOrderLineRequest> Items { get; set; } = new();
    }

    public class BingoReopenRequest
    {
        public int Mesa { get; set; }
    }

    public class BingoWaiterContestationDto
    {
        public int ItemId { get; set; }
        public Guid TabId { get; set; }
        public int Mesa { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? ContestNote { get; set; }
        public DateTime? ContestedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? DeliveredByName { get; set; }
    }

    public class BingoExitCheckDto
    {
        public Guid TabId { get; set; }
        public bool Paid { get; set; }
        public int Mesa { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public BingoTabStatus Status { get; set; }
        public decimal Total { get; set; }
        public decimal AmountDue { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? ExitCheckedAt { get; set; }
        public string? ExitCheckedByName { get; set; }
    }

    public class BingoWaiterMeDto
    {
        public bool IsWaiter { get; set; }
        public bool EventOpen { get; set; }
        public string? EventName { get; set; }
        public string? WaiterName { get; set; }
    }

    public class BingoWaiterOrderItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public BingoOrderItemStatus Status { get; set; }
        public string? RetrievedByName { get; set; }
        public bool RetrievedByMe { get; set; }
    }

    public class BingoWaiterOrderDto
    {
        public int Mesa { get; set; }
        public Guid TabId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public List<BingoWaiterOrderItemDto> Items { get; set; } = new();
    }

    public class BingoChangeTableRequest
    {
        public int Mesa { get; set; }
    }

    public class BingoAccountDto
    {
        public Guid TabId { get; set; }
        public int Mesa { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public BingoTabStatus Status { get; set; }
        public bool PhoneVerified { get; set; }
        public decimal Total { get; set; }
        public decimal AmountDue { get; set; }
        public int UndeliveredCount { get; set; }
        public int ContestedCount { get; set; }
        public List<BingoTabItemDto> Items { get; set; } = new();
    }

    public class BingoPayRequest
    {
        public List<Guid> TabIds { get; set; } = new();
        public int PaymentMethodId { get; set; }
    }

    public class BingoAdminPayRequest : BingoPayRequest
    {
        public string? Note { get; set; }
    }

    public class BingoPayResult
    {
        public int PaidCount { get; set; }
        public decimal Total { get; set; }
    }

    public class BingoSettingsDto
    {
        public int EventId { get; set; }
        public string Name { get; set; } = string.Empty;
        public BingoEventStatus Status { get; set; }
        public bool IsOpen { get; set; }
        public bool CloseAllRequested { get; set; }
    }

    public class BingoUpdateSettingsRequest
    {
        public bool CloseAllRequested { get; set; }
    }

    public class BingoMenuItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public bool IsAvailable { get; set; } = true;
        public int? SortOrder { get; set; }
    }

    public class BingoAvailabilityRequest
    {
        public bool IsAvailable { get; set; }
    }

    public class BingoTablesDto
    {
        public int Quantidade { get; set; }
        public List<int> Mesas { get; set; } = new();
    }

    public class BingoTablesRequest
    {
        public int Quantidade { get; set; }
    }

    public class BingoAddWaiterRequest
    {
        public int HouseMemberId { get; set; }
    }

    public class BingoAdminWaiterDto
    {
        public int HouseMemberId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool Connected { get; set; }
        public DateTime? LastSeenAt { get; set; }
        public int Deliveries { get; set; }
    }

    public class BingoPanelTabDto
    {
        public Guid Id { get; set; }
        public int Mesa { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public BingoTabStatus Status { get; set; }
        public decimal Total { get; set; }
        public decimal AmountDue { get; set; }
        public int UndeliveredCount { get; set; }
        public int ContestedCount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaidByName { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool PhoneVerified { get; set; }
        public string? CodeDeliveryStatus { get; set; }
        public string? CodeDeliveryError { get; set; }
        public List<BingoTabItemDto> Items { get; set; } = new();
    }

    public class BingoPendingByTableDto
    {
        public int Mesa { get; set; }
        public int PendingItems { get; set; }
    }

    public class BingoRetrievedByTableDto
    {
        public int Mesa { get; set; }
        public int RetrievedItems { get; set; }
    }

    public class BingoPanelCountsDto
    {
        public int Open { get; set; }
        public int CloseRequested { get; set; }
        public int Paid { get; set; }
        public int PendingItems { get; set; }
        public int RetrievedItems { get; set; }
        public int ContestedItems { get; set; }
        public int CancelledItems { get; set; }
        public int PhoneVerified { get; set; }
        public int PhoneNotVerified { get; set; }
        public int CodeDeliveryFailed { get; set; }
    }

    public class BingoPanelAccountsDto
    {
        public List<BingoAccountDto> CloseRequested { get; set; } = new();
        public List<BingoAccountDto> Open { get; set; } = new();
    }

    public class BingoPanelDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public bool IsOpen { get; set; }
        public bool CloseAllRequested { get; set; }
        public decimal TotalSold { get; set; }
        public BingoPanelCountsDto Counts { get; set; } = new();
        public List<BingoPanelTabDto> Tabs { get; set; } = new();
        public List<BingoPendingByTableDto> PendingByTable { get; set; } = new();
        public List<BingoRetrievedByTableDto> RetrievedByTable { get; set; } = new();
        public BingoPanelAccountsDto Accounts { get; set; } = new();
    }

    public class BingoPaymentSummaryDto
    {
        public string Method { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Total { get; set; }
    }

    public class BingoMethodTotalDto
    {
        public string Method { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }

    public class BingoWaiterSummaryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Total { get; set; }
        public List<BingoMethodTotalDto> ByMethod { get; set; } = new();
    }

    public class BingoItemSummaryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Total { get; set; }
    }

    public class BingoSummaryDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public decimal TotalSold { get; set; }
        public decimal TotalOpen { get; set; }
        public decimal CancelledTotal { get; set; }
        public int ContestedOpen { get; set; }
        public List<BingoWaiterSummaryDto> ByWaiter { get; set; } = new();
        public List<BingoPaymentSummaryDto> ByPaymentMethod { get; set; } = new();
        public List<BingoItemSummaryDto> ByItem { get; set; } = new();
    }

    public class BingoResetRequest
    {
        public bool Confirmar { get; set; }
    }

    public class BingoEventDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public BingoEventStatus Status { get; set; }
        public bool IsTest { get; set; }
        public bool CloseAllRequested { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public int TabsCount { get; set; }
        public decimal TotalSold { get; set; }
    }

    public class BingoCreateEventRequest
    {
        public string Name { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public int? CopiarDeEventoId { get; set; }
    }

    public class BingoHistoryTabDto : BingoPanelTabDto
    {
        public DateTime? ReminderSentAt { get; set; }
        public string? ReminderDeliveryStatus { get; set; }
    }
}
