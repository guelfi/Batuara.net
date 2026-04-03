using Batuara.Domain.Enums;

namespace Batuara.Application.SpiritualContents.Models
{
    public class UpdateSpiritualContentRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public SpiritualContentType? Type { get; set; }
        public SpiritualCategory? Category { get; set; }
        public string? Source { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsActive { get; set; }
    }
}
