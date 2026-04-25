using System;
using System.Collections.Generic;

namespace Batuara.Application.Dashboard.DTOs
{
    public class DashboardStatsDto
    {
        /// <summary>Eventos (festas, bazares, cursos, etc.) de hoje até 31/12 do ano corrente.</summary>
        public int EventsUntilEndOfYear { get; set; }

        /// <summary>Atendimentos espirituais (Umbanda + Kardecismo) de hoje até 31/12 do ano corrente.</summary>
        public int AttendancesUntilEndOfYear { get; set; }

        /// <summary>Filhos da Casa com IsActive = true.</summary>
        public int ActiveHouseMembers { get; set; }

        /// <summary>Eventos + Atendimentos com data no mês corrente.</summary>
        public int CurrentMonthActivity { get; set; }

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
