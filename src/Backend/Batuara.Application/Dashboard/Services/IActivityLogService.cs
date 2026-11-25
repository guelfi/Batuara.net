using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.Common.Models;
using Batuara.Application.Dashboard.DTOs;

namespace Batuara.Application.Dashboard.Services
{
    public interface IActivityLogService
    {
        Task LogAsync(string userName, string? userId, string action, string entityType, string? entityId = null, string? details = null, CancellationToken cancellationToken = default);

        Task<PaginatedResponse<DashboardActivityDto>> GetRecentAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    }
}
