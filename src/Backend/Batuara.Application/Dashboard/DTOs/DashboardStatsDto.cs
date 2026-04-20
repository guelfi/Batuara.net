using System;
using System.Collections.Generic;

namespace Batuara.Application.Dashboard.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalEvents { get; set; }
        public int ActiveEvents { get; set; }
        public int TotalAttendances { get; set; }
        public int TotalUsers { get; set; }
        public List<DashboardActivityDto> RecentActivity { get; set; } = new List<DashboardActivityDto>();
    }

    public class DashboardActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Details { get; set; } = string.Empty;
    }
}
