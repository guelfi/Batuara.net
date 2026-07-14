using Batuara.Domain.Common;
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
        public bool IsRead { get; private set; } = false;
        public bool WantsWhatsAppResponse { get; private set; } = false;
        public DateTime? WhatsAppResponseSentAt { get; private set; }
        public string? WhatsAppResponseText { get; private set; }
        public string? AdminNotes { get; private set; }
        public DateTime ReceivedAt { get; private set; }

        private readonly List<WhatsAppMessage> _whatsAppMessages = new();
        public virtual IReadOnlyCollection<WhatsAppMessage> WhatsAppMessages => _whatsAppMessages.AsReadOnly();

        public void AddWhatsAppMessage(string messageId, string senderPhone, string recipientPhone, string body, bool isFromMe, DateTime sentAt)
        {
            if (!_whatsAppMessages.Any(x => x.MessageId == messageId))
            {
                _whatsAppMessages.Add(new WhatsAppMessage(Id, messageId, senderPhone, recipientPhone, body, isFromMe, sentAt));
                UpdateTimestamp();
            }
        }

        private ContactMessage()
        {
        }

        public ContactMessage(string name, string? email, string subject, string message, string? phone = null, bool wantsWhatsAppResponse = false)
        {
            Name = Require(name, nameof(name));
            Email = string.IsNullOrWhiteSpace(email) ? string.Empty : email.Trim();
            Subject = Require(subject, nameof(subject));
            Message = Require(message, nameof(message));
            Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();
            WantsWhatsAppResponse = wantsWhatsAppResponse;
            Status = ContactMessageStatus.New;
            ReceivedAt = DateTime.UtcNow;
        }

        public void UpdateStatus(ContactMessageStatus status, string? adminNotes = null)
        {
            Status = status;
            AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? null : adminNotes.Trim();
            UpdateTimestamp();
        }

        public void MarkAsRead()
        {
            if (!IsRead)
            {
                IsRead = true;
                UpdateTimestamp();
            }
        }

        public void MarkAsUnread()
        {
            if (IsRead)
            {
                IsRead = false;
                UpdateTimestamp();
            }
        }

        public void MarkWhatsAppResponseSent(string responseText, DateTime sentAt)
        {
            WhatsAppResponseText = Require(responseText, nameof(responseText));
            WhatsAppResponseSentAt = DateTime.SpecifyKind(sentAt, sentAt.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : sentAt.Kind).ToUniversalTime();
            Status = ContactMessageStatus.Resolved;
            IsRead = true;
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
