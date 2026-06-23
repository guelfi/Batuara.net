namespace Batuara.Application.Guides.Models
{
    public class GuideDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Specialties { get; set; } = new();
        public int DisplayOrder { get; set; }
        public string? Comida { get; set; }
        public string? Fruta { get; set; }
        public string? DiaDaSemana { get; set; }
        public string? Cor { get; set; }
        public string? Saudacao { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateGuideRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Specialties { get; set; } = new();
        public int DisplayOrder { get; set; } = 1;
        public string? Comida { get; set; }
        public string? Fruta { get; set; }
        public string? DiaDaSemana { get; set; }
        public string? Cor { get; set; }
        public string? Saudacao { get; set; }
    }

    public class UpdateGuideRequest : CreateGuideRequest
    {
    }
}
