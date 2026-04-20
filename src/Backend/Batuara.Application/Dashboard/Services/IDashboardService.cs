using System.Threading.Tasks;
using Batuara.Application.Dashboard.DTOs;

namespace Batuara.Application.Dashboard.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
