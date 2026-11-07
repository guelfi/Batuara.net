using Batuara.Domain.Enums;

namespace Batuara.Application.Bingo.Models
{
    public class BingoOptions
    {
        public const string SectionName = "Bingo";
        public string PublicBaseUrl { get; set; } = "https://www.batuara.org.br";
        public double WaiterSessionHours { get; set; } = 10;
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

        public BingoException(BingoErrorKind kind, string message) : base(message)
        {
            Kind = kind;
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

    public class BingoTabItemDto
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public BingoOrderItemStatus Status { get; set; }
    }

    public class BingoPublicTabDto
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Mesa { get; set; }
        public BingoTabStatus Status { get; set; }
        public decimal Total { get; set; }
        public bool CloseAllRequested { get; set; }
        public bool IsOpen { get; set; }
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

    public class BingoWaiterMeDto
    {
        public bool IsWaiter { get; set; }
        public bool EventOpen { get; set; }
        public string? EventName { get; set; }
    }

    public class BingoWaiterOrderItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; }
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
        public decimal Total { get; set; }
        public BingoTabStatus Status { get; set; }
    }

    public class BingoPayRequest
    {
        public List<Guid> TabIds { get; set; } = new();
        public BingoPaymentMethod Method { get; set; }
    }

    public class BingoPayOneRequest
    {
        public BingoPaymentMethod Method { get; set; }
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
        public DateTime CreatedAt { get; set; }
        public List<BingoTabItemDto> Items { get; set; } = new();
    }

    public class BingoPendingByTableDto
    {
        public int Mesa { get; set; }
        public int PendingItems { get; set; }
    }

    public class BingoPanelCountsDto
    {
        public int Open { get; set; }
        public int CloseRequested { get; set; }
        public int Paid { get; set; }
        public int PendingItems { get; set; }
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
        public BingoPanelAccountsDto Accounts { get; set; } = new();
    }

    public class BingoPaymentSummaryDto
    {
        public BingoPaymentMethod Method { get; set; }
        public int Count { get; set; }
        public decimal Total { get; set; }
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
        public BingoPaymentMethod? PaymentMethod { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
