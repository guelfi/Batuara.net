using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class ContactMessage : BaseEntity, IAggregateRoot
    {
        public string Name { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string? Phone { get; private set; }
        public string Subject { get; private set; } = string.Empty;
        public string Message { get; private set; } = string.Empty;
        public ContactMessageStatus Status { get; private set; } = ContactMessageStatus.New;
        public string? AdminNotes { get; private set; }
        public DateTime ReceivedAt { get; private set; }

        private ContactMessage()
        {
        }

        public ContactMessage(string name, string email, string subject, string message, string? phone = null)
        {
            Name = Require(name, nameof(name));
            Email = Require(email, nameof(email));
            Subject = Require(subject, nameof(subject));
            Message = Require(message, nameof(message));
            Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();
            Status = ContactMessageStatus.New;
            ReceivedAt = DateTime.UtcNow;
        }

        public void UpdateStatus(ContactMessageStatus status, string? adminNotes = null)
        {
            Status = status;
            AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? null : adminNotes.Trim();
            UpdateTimestamp();
        }

        private static string Require(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Value cannot be empty", paramName);

            return value.Trim();
        }
    }
}
