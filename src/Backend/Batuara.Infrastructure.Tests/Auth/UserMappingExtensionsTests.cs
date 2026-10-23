using System.Linq;
using Batuara.Application.Auth.Models;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Batuara.Infrastructure.Tests.Auth
{
    public class UserMappingExtensionsTests
    {
        [Fact]
        public void ToDto_CopiesAllUserFields()
        {
            var user = new User("admin@batuara.org", "hash", "Administrador", UserRole.Admin, houseMemberId: 7)
            {
                Email = "admin@batuara.org",
                PasswordHash = "hash",
                Name = "Administrador"
            };

            var dto = user.ToDto();

            dto.Id.Should().Be(user.Id);
            dto.Email.Should().Be("admin@batuara.org");
            dto.Name.Should().Be("Administrador");
            dto.Role.Should().Be(UserRole.Admin);
            dto.HouseMemberId.Should().Be(7);
            dto.IsActive.Should().BeTrue();
            dto.LastLoginAt.Should().Be(user.LastLoginAt);
            dto.CreatedAt.Should().Be(user.CreatedAt);
        }

        [Fact]
        public void ToDto_DoesNotExposePasswordHash()
        {
            typeof(UserDto).GetProperties().Select(p => p.Name).Should().NotContain("PasswordHash");
        }
    }
}
