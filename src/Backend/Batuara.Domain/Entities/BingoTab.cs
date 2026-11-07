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
        public DateTime? PhoneVerifiedAt { get; private set; }
        public string? VerificationCodeHash { get; private set; }
        public DateTime? VerificationCodeExpiresAt { get; private set; }
        public int VerificationAttempts { get; private set; }
        public string? CodeMessageId { get; private set; }
        public string? CodeDeliveryStatus { get; private set; }
        public string? CodeDeliveryError { get; private set; }
        public DateTime? CodeLastSentAt { get; private set; }
        public DateTime? CodeWindowStartedAt { get; private set; }
        public int CodeSendCount { get; private set; }
        public DateTime? ReminderSentAt { get; private set; }
        public string? ReminderMessageId { get; private set; }
        public string? ReminderDeliveryStatus { get; private set; }
        public string? ReminderDeliveryError { get; private set; }
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

        public bool IsPhoneVerified => PhoneVerifiedAt != null;

        public void IssueVerificationCode(string codeHash, DateTime utcNow, TimeSpan validity)
        {
            VerificationCodeHash = codeHash;
            VerificationCodeExpiresAt = utcNow + validity;
            VerificationAttempts = 0;
            CodeMessageId = null;
            CodeDeliveryStatus = null;
            CodeDeliveryError = null;
            CodeLastSentAt = utcNow;
            if (CodeWindowStartedAt == null || utcNow - CodeWindowStartedAt.Value >= TimeSpan.FromHours(1))
            {
                CodeWindowStartedAt = utcNow;
                CodeSendCount = 0;
            }

            CodeSendCount++;
            Touch();
        }

        public void RegisterVerificationAttempt()
        {
            VerificationAttempts++;
            Touch();
        }

        public void ConfirmPhone(DateTime utcNow)
        {
            PhoneVerifiedAt = utcNow;
            VerificationCodeHash = null;
            VerificationCodeExpiresAt = null;
            Touch();
        }

        public void RegisterCodeSent(string? messageId)
        {
            CodeMessageId = messageId;
            CodeDeliveryStatus = "Sent";
            CodeDeliveryError = null;
            Touch();
        }

        public void RegisterCodeSendFailure(string error)
        {
            CodeDeliveryStatus = "Failed";
            CodeDeliveryError = Truncate(error, 200);
            Touch();
        }

        public void UpdateCodeDelivery(string status, string? error)
        {
            CodeDeliveryStatus = status;
            CodeDeliveryError = Truncate(error, 200);
            Touch();
        }

        public void RegisterReminderSent(string? messageId, DateTime utcNow)
        {
            ReminderSentAt = utcNow;
            ReminderMessageId = messageId;
            ReminderDeliveryStatus = "Sent";
            ReminderDeliveryError = null;
            Touch();
        }

        public void RegisterReminderFailure(string error)
        {
            ReminderDeliveryStatus = "Failed";
            ReminderDeliveryError = Truncate(error, 200);
            Touch();
        }

        public void UpdateReminderDelivery(string status, string? error)
        {
            ReminderDeliveryStatus = status;
            ReminderDeliveryError = Truncate(error, 200);
            Touch();
        }

        private static string? Truncate(string? value, int max)
            => value == null ? null : (value.Length <= max ? value : value[..max]);

        private void Touch() => UpdatedAt = DateTime.UtcNow;
    }
}
