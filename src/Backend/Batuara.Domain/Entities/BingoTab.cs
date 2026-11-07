using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class BingoTab
    {
        private readonly List<BingoOrderItem> _items = new();

        public Guid Id { get; private set; } = Guid.NewGuid();
        public int EventId { get; private set; }
        public int TableNumber { get; private set; }
        public string CustomerName { get; private set; } = string.Empty;
        public string? Phone { get; private set; }
        public BingoTabStatus Status { get; private set; } = BingoTabStatus.Open;
        public BingoPaymentMethod? PaymentMethod { get; private set; }
        public DateTime? PaidAt { get; private set; }
        public int? PaidByHouseMemberId { get; private set; }
        public DateTime? LinkSentAt { get; private set; }
        public DateTime? LinkLastAttemptAt { get; private set; }
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public IReadOnlyCollection<BingoOrderItem> Items => _items.AsReadOnly();

        public bool IsPaid => Status == BingoTabStatus.Paid;

        public decimal Total => _items.Sum(x => x.UnitPrice * x.Quantity);

        private BingoTab()
        {
        }

        public BingoTab(int eventId, string customerName, string phone, int tableNumber)
        {
            EventId = eventId;
            CustomerName = customerName.Trim();
            Phone = phone;
            TableNumber = tableNumber;
        }

        public void ChangeTable(int tableNumber)
        {
            TableNumber = tableNumber;
            Touch();
        }

        public void RequestClose()
        {
            if (Status == BingoTabStatus.Open)
            {
                Status = BingoTabStatus.CloseRequested;
                Touch();
            }
        }

        public void MarkPaid(BingoPaymentMethod method, int? paidByHouseMemberId, DateTime utcNow)
        {
            Status = BingoTabStatus.Paid;
            PaymentMethod = method;
            PaidAt = utcNow;
            PaidByHouseMemberId = paidByHouseMemberId;
            Touch();
        }

        public void Anonymize(string initials)
        {
            Phone = null;
            CustomerName = initials;
            Touch();
        }

        public void RegisterLinkAttempt(DateTime utcNow)
        {
            LinkLastAttemptAt = utcNow;
            Touch();
        }

        public void RegisterLinkSent(DateTime utcNow)
        {
            LinkSentAt = utcNow;
            Touch();
        }

        private void Touch() => UpdatedAt = DateTime.UtcNow;
    }
}
