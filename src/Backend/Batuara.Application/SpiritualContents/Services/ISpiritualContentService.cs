using Batuara.Application.Common.Models;
using Batuara.Application.SpiritualContents.Models;
using Batuara.Domain.Enums;

namespace Batuara.Application.SpiritualContents.Services
{
    public interface ISpiritualContentService
    {
        Task<PaginatedResponse<SpiritualContentDto>> GetPublicAsync(
            string? q,
            SpiritualContentType? type,
            SpiritualCategory? category,
            bool? featured,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<SpiritualContentDto?> GetPublicByIdAsync(int id);

        Task<PaginatedResponse<SpiritualContentDto>> GetAdminAsync(
            string? q,
            SpiritualContentType? type,
            SpiritualCategory? category,
            bool? featured,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<SpiritualContentDto?> GetByIdAsync(int id);
        Task<(SpiritualContentDto? Content, string[] Errors, bool Conflict)> CreateAsync(CreateSpiritualContentRequest request);
        Task<(SpiritualContentDto? Content, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateSpiritualContentRequest request);
        Task<bool> SoftDeleteAsync(int id);
    }
}
