using System.ComponentModel.DataAnnotations;

namespace Batuara.Application.Auth.Models
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}