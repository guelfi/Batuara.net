using Batuara.Application.Common.Models;
using Batuara.Application.Orixas.Models;

namespace Batuara.Application.Orixas.Services
{
    public interface IOrixaService
    {
        Task<IReadOnlyList<OrixaDto>> GetPublicAsync(string? q);
        Task<OrixaDto?> GetPublicByIdAsync(int id);

        Task<PaginatedResponse<OrixaDto>> GetAdminAsync(string? q, bool? isActive, int pageNumber, int pageSize, string? sort);
        Task<OrixaDto?> GetByIdAsync(int id);
        Task<(OrixaDto? Orixa, string[] Errors, bool Conflict)> CreateAsync(CreateOrixaRequest request);
        Task<(OrixaDto? Orixa, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateOrixaRequest request);
        Task<bool> SoftDeleteAsync(int id);
    }
}
