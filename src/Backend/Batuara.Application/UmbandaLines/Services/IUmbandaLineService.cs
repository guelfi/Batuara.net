using Batuara.Application.Common.Models;
using Batuara.Application.UmbandaLines.Models;

namespace Batuara.Application.UmbandaLines.Services
{
    public interface IUmbandaLineService
    {
        Task<PaginatedResponse<UmbandaLineDto>> GetPublicAsync(
            string? q,
            string? entity,
            string? workingDay,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<UmbandaLineDto?> GetPublicByIdAsync(int id);

        Task<PaginatedResponse<UmbandaLineDto>> GetAdminAsync(
            string? q,
            string? entity,
            string? workingDay,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<UmbandaLineDto?> GetByIdAsync(int id);
        Task<(UmbandaLineDto? Line, string[] Errors, bool Conflict)> CreateAsync(CreateUmbandaLineRequest request);
        Task<(UmbandaLineDto? Line, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateUmbandaLineRequest request);
        Task<bool> SoftDeleteAsync(int id);
    }
}
