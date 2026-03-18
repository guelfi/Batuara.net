using System.ComponentModel.DataAnnotations;

namespace Batuara.Application.Auth.Models
{
    public class UpdateUserRequest
    {
        [EmailAddress]
        public string? Email { get; set; }

        public string? Name { get; set; }
    }
}
