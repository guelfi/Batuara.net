namespace Batuara.Application.Orixas.Models
{
    public class OrixaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public string BatuaraTeaching { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; }
        public IReadOnlyList<string> Characteristics { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> Colors { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> Elements { get; set; } = Array.Empty<string>();
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
