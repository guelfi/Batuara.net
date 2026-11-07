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

        public void Deliver(int houseMemberId, DateTime utcNow)
        {
            Status = BingoOrderItemStatus.Delivered;
            DeliveredByHouseMemberId = houseMemberId;
            DeliveredAt = utcNow;
            UpdateTimestamp();
        }
    }
}
