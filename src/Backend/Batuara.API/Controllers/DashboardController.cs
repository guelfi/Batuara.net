using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.Dashboard.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IActivityLogService _activityLogService;

        public DashboardController(IDashboardService dashboardService, IActivityLogService activityLogService)
        {
            _dashboardService = dashboardService;
            _activityLogService = activityLogService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _dashboardService.GetDashboardStatsAsync();
            return Ok(new { success = true, data = stats });
        }

        [HttpGet("activity-logs")]
        public async Task<IActionResult> GetActivityLogs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;

            var logs = await _activityLogService.GetRecentAsync(pageNumber, pageSize, cancellationToken);
            return Ok(new { success = true, data = logs });
        }
    }
}
