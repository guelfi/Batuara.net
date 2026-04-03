using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class GuideEntity : BaseEntity, IAggregateRoot
    {
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string? PhotoUrl { get; private set; }
        public List<string> Specialties { get; private set; } = new();
        public DateTime EntryDate { get; private set; }
        public string? Email { get; private set; }
        public string? Phone { get; private set; }
        public string? Whatsapp { get; private set; }
        public int DisplayOrder { get; private set; }

        private GuideEntity()
        {
        }

        public GuideEntity(
            string name,
            string description,
            IEnumerable<string> specialties,
            DateTime entryDate,
            int displayOrder,
            string? photoUrl = null,
            string? email = null,
            string? phone = null,
            string? whatsapp = null)
        {
            UpdateContent(name, description, specialties, displayOrder, photoUrl);
            UpdateContacts(email, phone, whatsapp);
            EntryDate = NormalizeDate(entryDate);
        }

        public void UpdateContent(
            string name,
            string description,
            IEnumerable<string> specialties,
            int displayOrder,
            string? photoUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Guide name cannot be empty", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Guide description cannot be empty", nameof(description));

            var normalizedSpecialties = specialties
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Select(item => item.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (normalizedSpecialties.Count == 0)
                throw new ArgumentException("Guide specialties cannot be empty", nameof(specialties));

            if (displayOrder <= 0)
                throw new ArgumentException("Display order must be greater than zero", nameof(displayOrder));

            Name = name.Trim();
            Description = description.Trim();
            Specialties = normalizedSpecialties;
            DisplayOrder = displayOrder;
            PhotoUrl = string.IsNullOrWhiteSpace(photoUrl) ? null : photoUrl.Trim();
            UpdateTimestamp();
        }

        public void UpdateEntryDate(DateTime entryDate)
        {
            EntryDate = NormalizeDate(entryDate);
            UpdateTimestamp();
        }

        public void UpdateContacts(string? email, string? phone, string? whatsapp)
        {
            Email = NormalizeOptional(email);
            Phone = NormalizeOptional(phone);
            Whatsapp = NormalizeOptional(whatsapp);
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

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static DateTime NormalizeDate(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }
    }
}
