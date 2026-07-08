using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class HouseMemberContribution : BaseEntity
    {
        public int HouseMemberId { get; private set; }
        public DateTime ReferenceMonth { get; private set; }
        public DateTime DueDate { get; private set; }
        public decimal Amount { get; private set; }
        public ContributionPaymentStatus Status { get; private set; }
        public DateTime? PaidAt { get; private set; }
        public string? Notes { get; private set; }
        public bool IsRecurring { get; private set; }
        public bool AllowWhatsAppReminder { get; private set; }
        public DateTime? ReminderSentAt { get; private set; }
        public DateTime? ReminderLastAttemptAt { get; private set; }
        public int ReminderAttemptCount { get; private set; }

        public HouseMember? HouseMember { get; private set; }

        private HouseMemberContribution()
        {
        }

        internal HouseMemberContribution(
            int houseMemberId,
            DateTime referenceMonth,
            DateTime dueDate,
            decimal amount,
            string? notes = null,
            bool isRecurring = false,
            bool allowWhatsAppReminder = false)
        {
            HouseMemberId = houseMemberId;
            UpdateReferenceMonth(referenceMonth);
            UpdateDueDateAndNotes(dueDate, amount, notes, isRecurring, allowWhatsAppReminder);
            Status = ContributionPaymentStatus.Pending;
        }

        public void UpdateReferenceMonth(DateTime referenceMonth)
        {
            ReferenceMonth = new DateTime(referenceMonth.Year, referenceMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            UpdateTimestamp();
        }

        public void UpdateDueDateAndNotes(
            DateTime dueDate,
            decimal amount,
            string? notes,
            bool isRecurring = false,
            bool allowWhatsAppReminder = false)
        {
            if (amount <= 0)
                throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than zero");

            DueDate = DateTime.SpecifyKind(dueDate.Date, DateTimeKind.Utc);
            Amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
            IsRecurring = isRecurring;
            AllowWhatsAppReminder = allowWhatsAppReminder;
            UpdateTimestamp();
        }

        public void MarkAsPaid(DateTime paidAt)
        {
            Status = ContributionPaymentStatus.Paid;
            PaidAt = DateTime.SpecifyKind(paidAt, paidAt.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : paidAt.Kind).ToUniversalTime();
            UpdateTimestamp();
        }

        public void MarkAsPending()
        {
            Status = ContributionPaymentStatus.Pending;
            PaidAt = null;
            UpdateTimestamp();
        }

        public void MarkReminderSent(DateTime sentAt)
        {
            ReminderSentAt = DateTime.SpecifyKind(sentAt, sentAt.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : sentAt.Kind).ToUniversalTime();
            ReminderLastAttemptAt = ReminderSentAt;
            ReminderAttemptCount += 1;
            UpdateTimestamp();
        }

        public void MarkReminderAttempt(DateTime attemptedAt)
        {
            ReminderLastAttemptAt = DateTime.SpecifyKind(attemptedAt, attemptedAt.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : attemptedAt.Kind).ToUniversalTime();
            ReminderAttemptCount += 1;
            UpdateTimestamp();
        }
    }
}
