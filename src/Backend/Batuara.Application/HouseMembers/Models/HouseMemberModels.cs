using Batuara.Domain.Enums;

namespace Batuara.Application.HouseMembers.Models
{
    public class HouseMemberContributionDto
    {
        public int Id { get; set; }
        public DateTime ReferenceMonth { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; }
        public ContributionPaymentStatus Status { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? Notes { get; set; }
    }

    public class HouseMemberContributionInput
    {
        public int? Id { get; set; }
        public DateTime ReferenceMonth { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; } = 50m;
        public ContributionPaymentStatus Status { get; set; } = ContributionPaymentStatus.Pending;
        public DateTime? PaidAt { get; set; }
        public string? Notes { get; set; }
    }

    public class HouseMemberDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public DateTime EntryDate { get; set; }
        public string HeadOrixaFront { get; set; } = string.Empty;
        public string HeadOrixaBack { get; set; } = string.Empty;
        public string HeadOrixaRonda { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobilePhone { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public ContributionPaymentStatus? CurrentMonthContributionStatus { get; set; }
        public DateTime? CurrentMonthDueDate { get; set; }
        public DateTime? CurrentMonthPaidAt { get; set; }
        public List<HouseMemberContributionDto> Contributions { get; set; } = new();
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateHouseMemberRequest
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public DateTime EntryDate { get; set; }
        public string HeadOrixaFront { get; set; } = string.Empty;
        public string HeadOrixaBack { get; set; } = string.Empty;
        public string HeadOrixaRonda { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MobilePhone { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public List<HouseMemberContributionInput> Contributions { get; set; } = new();
    }

    public class UpdateHouseMemberRequest : CreateHouseMemberRequest
    {
        public bool IsActive { get; set; } = true;
    }
}
