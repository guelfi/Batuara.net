namespace Batuara.Auth.DTOs
{
    public class UserActivityDto
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}