namespace Batuara.Application.UmbandaLines.Models
{
    public class CreateUmbandaLineRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Characteristics { get; set; } = string.Empty;
        public string BatuaraInterpretation { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public List<string> Entities { get; set; } = new();
        public List<string> WorkingDays { get; set; } = new();
    }
}
