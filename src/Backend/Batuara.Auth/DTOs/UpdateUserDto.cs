using System.ComponentModel.DataAnnotations;
using Batuara.Auth.Models;

namespace Batuara.Auth.DTOs
{
    public class UpdateUserDto
    {
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? Name { get; set; }
        
        public UserRole? Role { get; set; }
        
        public bool? IsActive { get; set; }
    }
}