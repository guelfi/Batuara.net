namespace Batuara.Application.Orixas.Models
{
    public class UpdateOrixaRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Origin { get; set; }
        public string? BatuaraTeaching { get; set; }
        public List<string>? Characteristics { get; set; }
        public List<string>? Colors { get; set; }
        public List<string>? Elements { get; set; }
        public int? DisplayOrder { get; set; }
        public string? ImageUrl { get; set; }
        public bool? IsActive { get; set; }
    }
}
