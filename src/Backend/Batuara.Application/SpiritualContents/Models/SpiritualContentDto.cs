using Batuara.Domain.Enums;

namespace Batuara.Application.SpiritualContents.Models
{
    public class SpiritualContentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public SpiritualContentType Type { get; set; }
        public SpiritualCategory Category { get; set; }
        public string Source { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
