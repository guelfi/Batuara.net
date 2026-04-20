using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Batuara.Application.Dashboard.DTOs;
using Batuara.Application.Dashboard.Services;
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
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            
            var totalEvents = await _context.Events.CountAsync();
            var activeEvents = await _context.Events.CountAsync(e => e.IsActive && e.EventDate.Date >= now);
            var totalAttendances = await _context.CalendarAttendances.CountAsync(a => a.AttendanceDate.Date >= startOfMonth && a.AttendanceDate.Date < startOfMonth.AddMonths(1));
            var totalUsers = await _context.Users.CountAsync(u => u.IsActive);

            var activities = new List<DashboardActivityDto>();

            // Eventos recentes
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

            // Atendimentos recentes
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

            // Usuários recentes
            var recentUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .ToListAsync();
            
            activities.AddRange(recentUsers.Select(u => new DashboardActivityDto
            {
                Id = $"usr_{u.Id}",
                UserId = "System",
                UserName = "Sistema",
                Action = "Novo usuário",
                EntityType = "User",
                EntityId = u.Id.ToString(),
                Timestamp = u.CreatedAt,
                Details = u.Name
            }));

            var recentActivity = activities
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .ToList();

            return new DashboardStatsDto
            {
                TotalEvents = totalEvents,
                ActiveEvents = activeEvents,
                TotalAttendances = totalAttendances,
                TotalUsers = totalUsers,
                RecentActivity = recentActivity
            };
        }
    }
}
