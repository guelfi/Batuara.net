using Batuara.Domain.Enums;

namespace Batuara.Application.ContactMessages.Models
{
    public class ContactMessageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public ContactMessageStatus Status { get; set; }
        public string? AdminNotes { get; set; }
        public DateTime ReceivedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContactMessageRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateContactMessageStatusRequest
    {
        public ContactMessageStatus Status { get; set; }
        public string? AdminNotes { get; set; }
    }
}
