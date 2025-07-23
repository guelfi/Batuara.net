namespace Batuara.Auth.Models
{
    public class PasswordRequirements
    {
        public bool RequireDigit { get; set; } = true;
        public bool RequireLowercase { get; set; } = true;
        public bool RequireUppercase { get; set; } = true;
        public bool RequireNonAlphanumeric { get; set; } = true;
        public int RequiredLength { get; set; } = 8;
    }
}