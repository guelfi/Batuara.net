using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class BingoOrderItem : BaseEntity
    {
        public Guid TabId { get; private set; }
        public int MenuItemId { get; private set; }
        public string ItemName { get; private set; } = string.Empty;
        public decimal UnitPrice { get; private set; }
        public int Quantity { get; private set; }
        public BingoOrderItemStatus Status { get; private set; } = BingoOrderItemStatus.Pending;
        public int? DeliveredByHouseMemberId { get; private set; }
        public DateTime? DeliveredAt { get; private set; }
        public int? RetrievedByHouseMemberId { get; private set; }
        public DateTime? RetrievedAt { get; private set; }
        public string? DeliveredByName { get; private set; }
        public DateTime? ContestedAt { get; private set; }
        public string? ContestNote { get; private set; }
        public DateTime? CancelledAt { get; private set; }
        public string? CancelledByName { get; private set; }
        public string? CancelReason { get; private set; }
        public DateTime? ResolvedAt { get; private set; }
        public string? ResolvedByName { get; private set; }
        public BingoTab Tab { get; private set; } = null!;

        private BingoOrderItem()
        {
        }

        public BingoOrderItem(Guid tabId, BingoMenuItem menuItem, int quantity)
        {
            TabId = tabId;
            MenuItemId = menuItem.Id;
            ItemName = menuItem.Name;
            UnitPrice = menuItem.UnitPrice;
            Quantity = quantity;
        }

        public void Retrieve(int houseMemberId, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Retrieved;
            RetrievedByHouseMemberId = houseMemberId;
            RetrievedAt = utcNow;
            UpdateTimestamp();
        }

        public void Return()
        {
            Status = BingoOrderItemStatus.Pending;
            RetrievedByHouseMemberId = null;
            RetrievedAt = null;
            UpdateTimestamp();
        }

        public void Deliver(int? houseMemberId, string? byName, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Delivered;
            DeliveredByHouseMemberId = houseMemberId;
            DeliveredByName = byName;
            DeliveredAt = utcNow;
            UpdateTimestamp();
        }

        public void Contest(string? note, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Contested;
            ContestedAt = utcNow;
            ContestNote = note;
            ResolvedAt = null;
            ResolvedByName = null;
            UpdateTimestamp();
        }

        public void Cancel(string reason, string byName, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Cancelled;
            CancelledAt = utcNow;
            CancelledByName = byName;
            CancelReason = reason;
            UpdateTimestamp();
        }

        public void ResolveAsDelivered(string byName, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Delivered;
            ResolvedAt = utcNow;
            ResolvedByName = byName;
            UpdateTimestamp();
        }

        public void MarkResolved(string byName, DateTime utcNow)
        {
            ResolvedAt = utcNow;
            ResolvedByName = byName;
            UpdateTimestamp();
        }
    }
}
