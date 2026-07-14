using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class WhatsAppMessage : BaseEntity
    {
        public int ContactMessageId { get; private set; }
        public string MessageId { get; private set; } = string.Empty;
        public string SenderPhone { get; private set; } = string.Empty;
        public string RecipientPhone { get; private set; } = string.Empty;
        public string Body { get; private set; } = string.Empty;
        public bool IsFromMe { get; private set; }
        public DateTime SentAt { get; private set; }

        private WhatsAppMessage() { }

        public WhatsAppMessage(int contactMessageId, string messageId, string senderPhone, string recipientPhone, string body, bool isFromMe, DateTime sentAt)
        {
            ContactMessageId = contactMessageId;
            MessageId = string.IsNullOrWhiteSpace(messageId) ? throw new ArgumentException("MessageId cannot be empty", nameof(messageId)) : messageId.Trim();
            SenderPhone = string.IsNullOrWhiteSpace(senderPhone) ? throw new ArgumentException("SenderPhone cannot be empty", nameof(senderPhone)) : senderPhone.Trim();
            RecipientPhone = string.IsNullOrWhiteSpace(recipientPhone) ? throw new ArgumentException("RecipientPhone cannot be empty", nameof(recipientPhone)) : recipientPhone.Trim();
            Body = body ?? string.Empty;
            IsFromMe = isFromMe;
            SentAt = DateTime.SpecifyKind(sentAt, DateTimeKind.Utc);
        }
    }
}
