using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.Common.Models;
using Batuara.Application.Dashboard.DTOs;
using Batuara.Application.Dashboard.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Dashboard.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly BatuaraDbContext _context;
        private readonly ILogger<ActivityLogService> _logger;

        public ActivityLogService(BatuaraDbContext context, ILogger<ActivityLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogAsync(string userName, string? userId, string action, string entityType, string? entityId = null, string? details = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _context.ActivityLogs.Add(new ActivityLog(userName, userId, action, entityType, entityId, details));
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                // Registro de atividade nunca deve quebrar a operação principal
                _logger.LogWarning(ex, "Failed to write activity log: {Action} on {EntityType}", action, entityType);
            }
        }

        public async Task<PaginatedResponse<DashboardActivityDto>> GetRecentAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.ActivityLogs.OrderByDescending(x => x.CreatedAt);
            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PaginatedResponse<DashboardActivityDto>
            {
                Data = items.Select(x => new DashboardActivityDto
                {
                    Id = $"log_{x.Id}",
                    UserId = x.UserId ?? "System",
                    UserName = x.UserName,
                    Action = x.Action,
                    EntityType = x.EntityType,
                    EntityId = x.EntityId ?? string.Empty,
                    Timestamp = x.CreatedAt,
                    Details = x.Details ?? string.Empty
                }).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
    }
}
