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

        public HouseMember? HouseMember { get; private set; }

        private HouseMemberContribution()
        {
        }

        internal HouseMemberContribution(int houseMemberId, DateTime referenceMonth, DateTime dueDate, decimal amount, string? notes = null)
        {
            HouseMemberId = houseMemberId;
            UpdateReferenceMonth(referenceMonth);
            UpdateDueDateAndNotes(dueDate, amount, notes);
            Status = ContributionPaymentStatus.Pending;
        }

        public void UpdateReferenceMonth(DateTime referenceMonth)
        {
            ReferenceMonth = new DateTime(referenceMonth.Year, referenceMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            UpdateTimestamp();
        }

        public void UpdateDueDateAndNotes(DateTime dueDate, decimal amount, string? notes)
        {
            if (amount <= 0)
                throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be greater than zero");

            DueDate = DateTime.SpecifyKind(dueDate.Date, DateTimeKind.Utc);
            Amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
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
    }
}
