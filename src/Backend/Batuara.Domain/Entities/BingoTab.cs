using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class BingoTab
    {
        private readonly List<BingoOrderItem> _items = new();

        public Guid Id { get; private set; } = Guid.NewGuid();
        public int EventId { get; private set; }
        public int TableNumber { get; private set; }
        /// <summary>Quantas pessoas a comanda representa (ocupam lugares da mesa).</summary>
        public int PartySize { get; private set; } = 1;
        public string CustomerName { get; private set; } = string.Empty;
        public string? Phone { get; private set; }
        public BingoTabStatus Status { get; private set; } = BingoTabStatus.Open;
        public BingoPaymentMethod? PaymentMethod { get; private set; }
        public int? PaymentMethodId { get; private set; }
        /// <summary>Partes do pagamento quando foi dividido em mais de uma forma (json de BingoPaymentPart); nulo no pagamento por forma unica.</summary>
        public string? PaymentsJson { get; private set; }
        public string? PaymentMethodName { get; private set; }
        public string? PaidByName { get; private set; }
        public string? PaidNote { get; private set; }
        public decimal? AmountPaid { get; private set; }
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
        public DateTime? ExitCheckedAt { get; private set; }
        public string? ExitCheckedByName { get; private set; }
        public DateTime? ReminderSentAt { get; private set; }
        public string? ReminderMessageId { get; private set; }
        public string? ReminderDeliveryStatus { get; private set; }
        public string? ReminderDeliveryError { get; private set; }
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

        public IReadOnlyCollection<BingoOrderItem> Items => _items.AsReadOnly();

        public bool IsPaid => Status == BingoTabStatus.Paid;

        private static decimal Line(BingoOrderItem x) => x.UnitPrice * x.Quantity;

        public decimal Total => _items.Where(x => x.Status != BingoOrderItemStatus.Cancelled).Sum(Line);

        public decimal AmountDue => _items.Where(x => x.Status == BingoOrderItemStatus.Delivered).Sum(Line);

        public int UndeliveredCount => _items.Count(x => x.Status == BingoOrderItemStatus.Pending || x.Status == BingoOrderItemStatus.Retrieved);

        public int ContestedCount => _items.Count(x => x.Status == BingoOrderItemStatus.Contested);

        public decimal PaidAmount => AmountPaid ?? Total;

        public string? PaymentLabel => PaymentMethodName ?? PaymentMethod switch
        {
            BingoPaymentMethod.Card => "Cartão",
            BingoPaymentMethod.Pix => "Pix",
            BingoPaymentMethod.Cash => "Dinheiro",
            _ => null
        };

        private BingoTab()
        {
        }

        public BingoTab(int eventId, string customerName, string phone, int tableNumber, int partySize = 1)
        {
            EventId = eventId;
            CustomerName = customerName.Trim();
            Phone = phone;
            TableNumber = tableNumber;
            PartySize = Math.Max(1, partySize);
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

        public void ReleaseExit(string checkedByName, DateTime utcNow)
        {
            ExitCheckedAt = utcNow;
            ExitCheckedByName = checkedByName;
            Touch();
        }

        public void InheritPhoneVerification(DateTime verifiedAt)
        {
            PhoneVerifiedAt = verifiedAt;
        }

        public void CancelClose()
        {
            if (Status == BingoTabStatus.CloseRequested)
            {
                Status = BingoTabStatus.Open;
                Touch();
            }
        }

        public void MarkPaid(int? paymentMethodId, string? paymentMethodName, string paidByName, int? paidByHouseMemberId, string? note, DateTime utcNow)
        {
            Status = BingoTabStatus.Paid;
            PaymentMethodId = paymentMethodId;
            PaymentMethodName = paymentMethodName;
            PaidByName = paidByName;
            PaidNote = note;
            AmountPaid = AmountDue;
            PaidAt = utcNow;
            PaidByHouseMemberId = paidByHouseMemberId;
            Touch();
        }

        /// <summary>Pagamento em uma ou mais formas (a soma das partes e o valor a pagar da comanda).</summary>
        public void MarkPaidSplit(IReadOnlyList<BingoPaymentPart> parts, string paidByName, int? paidByHouseMemberId, string? note, DateTime utcNow)
        {
            Status = BingoTabStatus.Paid;
            PaymentMethodId = parts.Count == 1 ? parts[0].MethodId : null;
            PaymentMethodName = BingoPaymentPart.Label(parts);
            PaymentsJson = parts.Count > 1 ? BingoPaymentPart.Serialize(parts) : null;
            PaidByName = paidByName;
            PaidNote = note;
            AmountPaid = AmountDue;
            PaidAt = utcNow;
            PaidByHouseMemberId = paidByHouseMemberId;
            Touch();
        }

        /// <summary>Partes do pagamento (vazio quando nao pago ou sem consumo).</summary>
        public List<BingoPaymentPart> GetPaymentParts()
            => IsPaid ? BingoPaymentPart.FromStored(PaymentsJson, PaymentLabel, PaymentMethodId, PaidAmount) : new List<BingoPaymentPart>();

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
