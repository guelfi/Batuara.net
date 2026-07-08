using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class HouseMember : BaseEntity, IAggregateRoot
    {
        private readonly List<HouseMemberContribution> _contributions = new();

        public string FullName { get; private set; } = string.Empty;
        public DateTime BirthDate { get; private set; }
        public DateTime? EntryDate { get; private set; }
        public string? HeadOrixaFront { get; private set; }
        public string? HeadOrixaBack { get; private set; }
        public string? HeadOrixaRonda { get; private set; }
        public string? Email { get; private set; }
        public string? MobilePhone { get; private set; }
        public string? ZipCode { get; private set; }
        public string? Street { get; private set; }
        public string? Number { get; private set; }
        public string? Complement { get; private set; }
        public string? District { get; private set; }
        public string? City { get; private set; }
        public string? State { get; private set; }
        public DateTime? AmaciDate { get; private set; }
        public DateTime? YaoDate { get; private set; }
        public string? SmallParent { get; private set; }
        public string? ReligiousLeader { get; private set; }
        public string? Notes { get; private set; }

        public IReadOnlyCollection<HouseMemberContribution> Contributions => _contributions.AsReadOnly();

        private HouseMember()
        {
        }

        public HouseMember(
            string fullName,
            DateTime birthDate,
            DateTime? entryDate,
            string? headOrixaFront,
            string? headOrixaBack,
            string? headOrixaRonda,
            string? email,
            string? mobilePhone,
            string? zipCode,
            string? street,
            string? number,
            string? complement,
            string? district,
            string? city,
            string? state,
            DateTime? amaciDate = null,
            DateTime? yaoDate = null,
            string? smallParent = null,
            string? religiousLeader = null,
            string? notes = null)
        {
            UpdateProfile(
                fullName,
                birthDate,
                entryDate,
                headOrixaFront,
                headOrixaBack,
                headOrixaRonda,
                email,
                mobilePhone);

            UpdateAddress(zipCode, street, number, complement, district, city, state);
            UpdateSpiritualInfo(amaciDate, yaoDate, smallParent, religiousLeader, notes);
        }

        public void UpdateProfile(
            string fullName,
            DateTime birthDate,
            DateTime? entryDate,
            string? headOrixaFront,
            string? headOrixaBack,
            string? headOrixaRonda,
            string? email,
            string? mobilePhone)
        {
            FullName = Require(fullName, nameof(fullName));
            HeadOrixaFront = NullableString(headOrixaFront);
            HeadOrixaBack = NullableString(headOrixaBack);
            HeadOrixaRonda = NullableString(headOrixaRonda);
            Email = NullableString(email);
            MobilePhone = NullableString(mobilePhone);
            BirthDate = NormalizeDate(birthDate);
            EntryDate = entryDate.HasValue ? NormalizeDate(entryDate.Value) : null;
            UpdateTimestamp();
        }

        public void UpdateAddress(
            string? zipCode,
            string? street,
            string? number,
            string? complement,
            string? district,
            string? city,
            string? state)
        {
            ZipCode = NullableString(zipCode);
            Street = NullableString(street);
            Number = NullableString(number);
            Complement = NullableString(complement);
            District = NullableString(district);
            City = NullableString(city);
            State = NullableString(state);
            UpdateTimestamp();
        }

        public void UpdateSpiritualInfo(
            DateTime? amaciDate,
            DateTime? yaoDate,
            string? smallParent,
            string? religiousLeader,
            string? notes)
        {
            AmaciDate = amaciDate.HasValue ? NormalizeDate(amaciDate.Value) : null;
            YaoDate = yaoDate.HasValue ? NormalizeDate(yaoDate.Value) : null;
            SmallParent = NullableString(smallParent);
            ReligiousLeader = NullableString(religiousLeader);
            Notes = NullableString(notes);
            UpdateTimestamp();
        }

        public HouseMemberContribution AddContribution(
            DateTime referenceMonth,
            DateTime dueDate,
            decimal amount,
            string? notes = null,
            bool isRecurring = false,
            bool allowWhatsAppReminder = false)
        {
            var normalizedReferenceMonth = NormalizeMonth(referenceMonth);
            var existingContribution = _contributions.FirstOrDefault(item => item.ReferenceMonth == normalizedReferenceMonth);

            if (existingContribution != null)
            {
                existingContribution.UpdateDueDateAndNotes(dueDate, amount, notes, isRecurring, allowWhatsAppReminder);
                UpdateTimestamp();
                return existingContribution;
            }

            var contribution = new HouseMemberContribution(Id, normalizedReferenceMonth, dueDate, amount, notes, isRecurring, allowWhatsAppReminder);
            _contributions.Add(contribution);
            UpdateTimestamp();
            return contribution;
        }

        public HouseMemberContribution UpdateContribution(
            int contributionId,
            DateTime referenceMonth,
            DateTime dueDate,
            decimal amount,
            ContributionPaymentStatus status,
            DateTime? paidAt,
            string? notes,
            bool isRecurring = false,
            bool allowWhatsAppReminder = false)
        {
            var contribution = FindContribution(contributionId);
            contribution.UpdateReferenceMonth(referenceMonth);
            contribution.UpdateDueDateAndNotes(dueDate, amount, notes, isRecurring, allowWhatsAppReminder);

            if (status == ContributionPaymentStatus.Paid)
            {
                contribution.MarkAsPaid(paidAt ?? DateTime.UtcNow);
                EnsureNextRecurringContribution(contribution);
            }
            else
            {
                contribution.MarkAsPending();
            }

            UpdateTimestamp();
            return contribution;
        }

        public HouseMemberContribution? EnsureNextRecurringContribution(HouseMemberContribution contribution)
        {
            if (!contribution.IsRecurring || contribution.Status != ContributionPaymentStatus.Paid)
            {
                return null;
            }

            var nextReferenceMonth = NormalizeMonth(contribution.ReferenceMonth.AddMonths(1));
            if (_contributions.Any(item => item.ReferenceMonth == nextReferenceMonth))
            {
                return null;
            }

            var nextDueDate = SameDayNextMonth(contribution.DueDate);
            var nextContribution = new HouseMemberContribution(
                Id,
                nextReferenceMonth,
                nextDueDate,
                contribution.Amount,
                contribution.Notes,
                isRecurring: true,
                allowWhatsAppReminder: contribution.AllowWhatsAppReminder);

            _contributions.Add(nextContribution);
            UpdateTimestamp();
            return nextContribution;
        }

        public void RemoveContribution(int contributionId)
        {
            var contribution = FindContribution(contributionId);
            _contributions.Remove(contribution);
            UpdateTimestamp();
        }

        public void Activate()
        {
            IsActive = true;
            UpdateTimestamp();
        }

        public void Deactivate()
        {
            SetInactive();
        }

        private HouseMemberContribution FindContribution(int contributionId)
        {
            return _contributions.FirstOrDefault(item => item.Id == contributionId)
                ?? throw new InvalidOperationException("Contribution not found");
        }

        private static string Require(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Value cannot be empty", paramName);

            return value.Trim();
        }

        private static string? NullableString(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static DateTime NormalizeDate(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }

        private static DateTime NormalizeMonth(DateTime value)
        {
            var normalized = new DateTime(value.Year, value.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            return normalized;
        }

        private static DateTime SameDayNextMonth(DateTime value)
        {
            var nextMonth = new DateTime(value.Year, value.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
            var day = Math.Min(value.Day, DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month));
            return new DateTime(nextMonth.Year, nextMonth.Month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
