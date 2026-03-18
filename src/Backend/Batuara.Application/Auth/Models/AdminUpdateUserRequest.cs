using System.ComponentModel.DataAnnotations;
using Batuara.Domain.Enums;

namespace Batuara.Application.Auth.Models
{
    public class AdminUpdateUserRequest
    {
        [EmailAddress]
        public string? Email { get; set; }

        public string? Name { get; set; }

        public UserRole? Role { get; set; }

        public bool? IsActive { get; set; }
    }
}
