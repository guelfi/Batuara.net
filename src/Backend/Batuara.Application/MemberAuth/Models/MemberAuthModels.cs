using Batuara.Application.HouseMembers.Models;
using Batuara.Domain.Enums;

namespace Batuara.Application.MemberAuth.Models
{
    public class MemberRequestCodeRequest
    {
        public string MobilePhone { get; set; } = string.Empty;
    }

    public class MemberVerifyCodeRequest
    {
        public string MobilePhone { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class MemberLoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public MemberPrincipalDto User { get; set; } = null!;
    }

    public class MemberPrincipalDto
    {
        public int Id { get; set; }
        public int HouseMemberId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Member;
        public bool IsActive { get; set; }
    }

    public class MemberSelfUpdateRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? MobilePhone { get; set; }
        public string? ZipCode { get; set; }
        public string? Street { get; set; }
        public string? Number { get; set; }
        public string? Complement { get; set; }
        public string? District { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
    }

    public class MemberContributionRequest
    {
        public DateTime ReferenceMonth { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; } = 50m;
        public string? Notes { get; set; }
        public bool IsRecurring { get; set; }
        public bool AllowWhatsAppReminder { get; set; }
    }

    public class MemberSelfProfileDto : HouseMemberDto
    {
    }
}
