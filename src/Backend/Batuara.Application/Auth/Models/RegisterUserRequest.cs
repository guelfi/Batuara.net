using System.ComponentModel.DataAnnotations;
using Batuara.Domain.Enums;

namespace Batuara.Application.Auth.Models
{
    public class RegisterUserRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.Editor;
    }
}