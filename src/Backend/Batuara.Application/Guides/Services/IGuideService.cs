using Batuara.Application.Common.Models;
using Batuara.Application.Guides.Models;

namespace Batuara.Application.Guides.Services
{
    public interface IGuideService
    {
        Task<IReadOnlyList<GuideDto>> GetPublicAsync(string? q, string? specialty);
        Task<GuideDto?> GetPublicByIdAsync(int id);
        Task<PaginatedResponse<GuideDto>> GetAdminAsync(
            string? q,
            string? specialty,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);
        Task<GuideDto?> GetByIdAsync(int id);
        Task<(GuideDto? Guide, string[] Errors, bool Conflict)> CreateAsync(CreateGuideRequest request);
        Task<(GuideDto? Guide, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateGuideRequest request);
        Task<bool> SoftDeleteAsync(int id);
    }
}
