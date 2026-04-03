using Batuara.Application.Common.Models;
using Batuara.Application.HouseMembers.Models;

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
        Task<bool> SoftDeleteAsync(int id);
    }
}
