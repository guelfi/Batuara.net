using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class HouseMember : BaseEntity, IAggregateRoot
    {
        private readonly List<HouseMemberContribution> _contributions = new();

        public string FullName { get; private set; } = string.Empty;
        public DateTime BirthDate { get; private set; }
        public DateTime EntryDate { get; private set; }
        public string HeadOrixaFront { get; private set; } = string.Empty;
        public string HeadOrixaBack { get; private set; } = string.Empty;
        public string HeadOrixaRonda { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string MobilePhone { get; private set; } = string.Empty;
        public string ZipCode { get; private set; } = string.Empty;
        public string Street { get; private set; } = string.Empty;
        public string Number { get; private set; } = string.Empty;
        public string? Complement { get; private set; }
        public string District { get; private set; } = string.Empty;
        public string City { get; private set; } = string.Empty;
        public string State { get; private set; } = string.Empty;

        public IReadOnlyCollection<HouseMemberContribution> Contributions => _contributions.AsReadOnly();

        private HouseMember()
        {
        }

        public HouseMember(
            string fullName,
            DateTime birthDate,
            DateTime entryDate,
            string headOrixaFront,
            string headOrixaBack,
            string headOrixaRonda,
            string email,
            string mobilePhone,
            string zipCode,
            string street,
            string number,
            string? complement,
            string district,
            string city,
            string state)
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
        }

        public void UpdateProfile(
            string fullName,
            DateTime birthDate,
            DateTime entryDate,
            string headOrixaFront,
            string headOrixaBack,
            string headOrixaRonda,
            string email,
            string mobilePhone)
        {
            FullName = Require(fullName, nameof(fullName));
            HeadOrixaFront = Require(headOrixaFront, nameof(headOrixaFront));
            HeadOrixaBack = Require(headOrixaBack, nameof(headOrixaBack));
            HeadOrixaRonda = Require(headOrixaRonda, nameof(headOrixaRonda));
            Email = Require(email, nameof(email));
            MobilePhone = Require(mobilePhone, nameof(mobilePhone));
            BirthDate = NormalizeDate(birthDate);
            EntryDate = NormalizeDate(entryDate);
            UpdateTimestamp();
        }

        public void UpdateAddress(
            string zipCode,
            string street,
            string number,
            string? complement,
            string district,
            string city,
            string state)
        {
            ZipCode = Require(zipCode, nameof(zipCode));
            Street = Require(street, nameof(street));
            Number = Require(number, nameof(number));
            Complement = string.IsNullOrWhiteSpace(complement) ? null : complement.Trim();
            District = Require(district, nameof(district));
            City = Require(city, nameof(city));
            State = Require(state, nameof(state));
            UpdateTimestamp();
        }

        public HouseMemberContribution AddContribution(DateTime referenceMonth, DateTime dueDate, decimal amount, string? notes = null)
        {
            var normalizedReferenceMonth = NormalizeMonth(referenceMonth);
            var existingContribution = _contributions.FirstOrDefault(item => item.ReferenceMonth == normalizedReferenceMonth);

            if (existingContribution != null)
            {
                existingContribution.UpdateDueDateAndNotes(dueDate, amount, notes);
                UpdateTimestamp();
                return existingContribution;
            }

            var contribution = new HouseMemberContribution(Id, normalizedReferenceMonth, dueDate, amount, notes);
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
            string? notes)
        {
            var contribution = FindContribution(contributionId);
            contribution.UpdateReferenceMonth(referenceMonth);
            contribution.UpdateDueDateAndNotes(dueDate, amount, notes);

            if (status == ContributionPaymentStatus.Paid)
            {
                contribution.MarkAsPaid(paidAt ?? DateTime.UtcNow);
            }
            else
            {
                contribution.MarkAsPending();
            }

            UpdateTimestamp();
            return contribution;
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

        private static DateTime NormalizeDate(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }

        private static DateTime NormalizeMonth(DateTime value)
        {
            var normalized = new DateTime(value.Year, value.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            return normalized;
        }
    }
}
