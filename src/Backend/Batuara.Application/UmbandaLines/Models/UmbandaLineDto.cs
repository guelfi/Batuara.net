namespace Batuara.Application.UmbandaLines.Models
{
    public class UmbandaLineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Characteristics { get; set; } = string.Empty;
        public string BatuaraInterpretation { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public IReadOnlyList<string> Entities { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> WorkingDays { get; set; } = Array.Empty<string>();
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
