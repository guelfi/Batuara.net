using System.ComponentModel.DataAnnotations;

namespace Batuara.Auth.DTOs
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}