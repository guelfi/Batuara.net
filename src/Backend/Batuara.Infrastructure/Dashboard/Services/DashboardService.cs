using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Batuara.Application.Dashboard.DTOs;
using Batuara.Application.Dashboard.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Dashboard.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly BatuaraDbContext _context;

        public DashboardService(BatuaraDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var endOfYear = new DateTime(now.Year, 12, 31, 23, 59, 59, DateTimeKind.Utc);
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);

            // Eventos (todos os tipos) de hoje até 31/12 do ano corrente
            var eventsUntilEndOfYear = await _context.Events
                .CountAsync(e => e.IsActive && e.EventDate.Date >= today && e.EventDate.Date <= endOfYear);

            // Atendimentos espirituais (Umbanda=2 + Kardecismo=1) de hoje até 31/12
            var spiritualTypes = new[] { AttendanceType.Umbanda, AttendanceType.Kardecismo };
            var attendancesUntilEndOfYear = await _context.CalendarAttendances
                .CountAsync(a => a.IsActive
                    && spiritualTypes.Contains(a.Type)
                    && a.AttendanceDate.Date >= today
                    && a.AttendanceDate.Date <= endOfYear);

            // Filhos da Casa ativos
            var activeHouseMembers = await _context.HouseMembers
                .CountAsync(m => m.IsActive);

            // Atividade do mês corrente: eventos + atendimentos com data no mês
            var eventsThisMonth = await _context.Events
                .CountAsync(e => e.IsActive && e.EventDate.Date >= startOfMonth && e.EventDate.Date <= endOfMonth);
            var attendancesThisMonth = await _context.CalendarAttendances
                .CountAsync(a => a.IsActive && a.AttendanceDate.Date >= startOfMonth && a.AttendanceDate.Date <= endOfMonth);
            var currentMonthActivity = eventsThisMonth + attendancesThisMonth;

            // Atividade recente (eventos e atendimentos criados recentemente)
            var activities = new List<DashboardActivityDto>();

            var recentEvents = await _context.Events
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .ToListAsync();

            activities.AddRange(recentEvents.Select(e => new DashboardActivityDto
            {
                Id = $"evt_{e.Id}",
                UserId = "System",
                UserName = "Sistema",
                Action = "Criou evento",
                EntityType = "Event",
                EntityId = e.Id.ToString(),
                Timestamp = e.CreatedAt,
                Details = e.Title
            }));

            var recentAttendances = await _context.CalendarAttendances
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .ToListAsync();

            activities.AddRange(recentAttendances.Select(a => new DashboardActivityDto
            {
                Id = $"att_{a.Id}",
                UserId = "System",
                UserName = "Sistema",
                Action = "Agendou atendimento",
                EntityType = "CalendarAttendance",
                EntityId = a.Id.ToString(),
                Timestamp = a.CreatedAt,
                Details = a.GetTypeDisplayName()
            }));

            var recentActivity = activities
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .ToList();

            return new DashboardStatsDto
            {
                EventsUntilEndOfYear = eventsUntilEndOfYear,
                AttendancesUntilEndOfYear = attendancesUntilEndOfYear,
                ActiveHouseMembers = activeHouseMembers,
                CurrentMonthActivity = currentMonthActivity,
                RecentActivity = recentActivity
            };
        }
    }
}
