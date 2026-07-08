using Batuara.Application.Common.Models;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.MemberAuth.Models;

namespace Batuara.Application.HouseMembers.Services
{
    public interface IHouseMemberService
    {
        Task<PaginatedResponse<HouseMemberDto>> GetAdminAsync(
            string? q,
            string? city,
            string? state,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);
        Task<HouseMemberDto?> GetByIdAsync(int id);
        Task<(HouseMemberDto? Member, string[] Errors, bool Conflict)> CreateAsync(CreateHouseMemberRequest request);
        Task<(HouseMemberDto? Member, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateHouseMemberRequest request);
        Task<HouseMemberDto?> GetSelfProfileAsync(int houseMemberId);
        Task<(HouseMemberDto? Member, string[] Errors, bool Conflict)> UpdateSelfProfileAsync(int houseMemberId, MemberSelfUpdateRequest request);
        Task<(HouseMemberDto? Member, string[] Errors)> AddSelfContributionAsync(int houseMemberId, MemberContributionRequest request);
        Task<bool> SoftDeleteAsync(int id);
        Task<(bool Deleted, string[] Errors)> HardDeleteAsync(int id);
    }
}
