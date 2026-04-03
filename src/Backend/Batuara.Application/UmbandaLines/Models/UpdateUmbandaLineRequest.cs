namespace Batuara.Application.UmbandaLines.Models
{
    public class UpdateUmbandaLineRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Characteristics { get; set; }
        public string? BatuaraInterpretation { get; set; }
        public int? DisplayOrder { get; set; }
        public List<string>? Entities { get; set; }
        public List<string>? WorkingDays { get; set; }
        public bool? IsActive { get; set; }
    }
}
