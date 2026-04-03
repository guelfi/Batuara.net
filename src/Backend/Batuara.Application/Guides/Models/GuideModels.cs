namespace Batuara.Application.Guides.Models
{
    public class GuideDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public List<string> Specialties { get; set; } = new();
        public DateTime EntryDate { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Whatsapp { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateGuideRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public List<string> Specialties { get; set; } = new();
        public DateTime EntryDate { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Whatsapp { get; set; }
        public int DisplayOrder { get; set; } = 1;
    }

    public class UpdateGuideRequest : CreateGuideRequest
    {
        public bool IsActive { get; set; } = true;
    }
}
