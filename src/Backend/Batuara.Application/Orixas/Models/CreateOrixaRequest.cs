namespace Batuara.Application.Orixas.Models
{
    public class CreateOrixaRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Characteristics { get; set; } = new();
        public List<string> Colors { get; set; } = new();
        public List<string> Elements { get; set; } = new();
        public int DisplayOrder { get; set; }
        public string? ImageUrl { get; set; }
        public string? Comida { get; set; }
        public string? DiaDaSemana { get; set; }
        public string? Fruta { get; set; }
        public string? Saudacao { get; set; }
    }
}
