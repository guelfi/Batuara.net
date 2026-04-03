using Batuara.Application.Common.Models;
using Batuara.Application.Events.Models;
using Batuara.Application.Events.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Services;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Events.Services
{
    public class EventService : IEventService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _dbContext;
        private readonly IEventDomainService _eventDomainService;

        public EventService(BatuaraDbContext dbContext, IEventDomainService eventDomainService)
        {
            _dbContext = dbContext;
            _eventDomainService = eventDomainService;
        }

        public async Task<PaginatedResponse<EventCardDto>> GetPublicAsync(
            string? q,
            EventType? type,
            DateTime? fromDate,
            DateTime? toDate,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);

            var query = _dbContext.Events
                .AsNoTracking()
                .Where(e => e.IsActive);

            var effectiveFrom = NormalizeDateOnlyUtc(fromDate) ?? NormalizeDateOnlyUtc(DateTime.UtcNow);
            query = query.Where(e => e.EventDate.Date.Date >= effectiveFrom);

            if (toDate.HasValue)
            {
                var end = NormalizeDateOnlyUtc(toDate.Value);
                query = query.Where(e => e.EventDate.Date.Date <= end);
            }

            if (type.HasValue)
            {
                query = query.Where(e => e.Type == type.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(e =>
                    e.Title.ToLower().Contains(term) ||
                    e.Description.ToLower().Contains(term) ||
                    (e.Location != null && e.Location.ToLower().Contains(term)));
            }

            query = ApplySort(query, sort, defaultToUpcomingDateAsc: true);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)size);

            var items = await query
                .Skip((page - 1) * size)
                .Take(size)
                .Select(e => new EventCardDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    Date = e.EventDate.Date,
                    StartTime = e.EventDate.StartTime,
                    EndTime = e.EventDate.EndTime,
                    Type = e.Type,
                    Location = e.Location,
                    ImageUrl = e.ImageUrl
                })
                .ToListAsync();

            return new PaginatedResponse<EventCardDto>
            {
                Data = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = totalPages
            };
        }

        public async Task<EventDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _dbContext.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<EventDto>> GetAdminAsync(
            string? q,
            EventType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);

            var query = _dbContext.Events.AsNoTracking();

            if (isActive.HasValue)
            {
                query = query.Where(e => e.IsActive == isActive.Value);
            }

            if (fromDate.HasValue)
            {
                var start = NormalizeDateOnlyUtc(fromDate.Value);
                query = query.Where(e => e.EventDate.Date.Date >= start);
            }

            if (toDate.HasValue)
            {
                var end = NormalizeDateOnlyUtc(toDate.Value);
                query = query.Where(e => e.EventDate.Date.Date <= end);
            }

            if (type.HasValue)
            {
                query = query.Where(e => e.Type == type.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(e =>
                    e.Title.ToLower().Contains(term) ||
                    e.Description.ToLower().Contains(term) ||
                    (e.Location != null && e.Location.ToLower().Contains(term)));
            }

            query = ApplySort(query, sort, defaultToUpcomingDateAsc: false);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)size);

            var items = await query
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return new PaginatedResponse<EventDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = totalPages
            };
        }

        public async Task<EventDto?> GetByIdAsync(int id)
        {
            var entity = await _dbContext.Events
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(EventDto? Event, string[] Errors, bool Conflict)> CreateAsync(CreateEventRequest request)
        {
            try
            {
                var eventDate = new Batuara.Domain.ValueObjects.EventDate(NormalizeDateOnlyUtc(request.Date), request.StartTime, request.EndTime);
                var entity = new Event(
                    request.Title,
                    request.Description,
                    eventDate,
                    request.Type,
                    request.Location,
                    request.ImageUrl);

                var activeSameDay = (await _dbContext.Events
                    .AsNoTracking()
                    .Where(e => e.IsActive)
                    .ToListAsync())
                    .Where(e => e.EventDate.Date.Date == entity.EventDate.Date.Date)
                    .ToList();

                var business = _eventDomainService.ValidateEventBusinessRules(entity);
                if (!business.IsValid)
                {
                    return (null, business.Errors, false);
                }

                var hasConflict = activeSameDay.Any(existing => _eventDomainService.HasTimeConflict(existing, entity));
                if (hasConflict)
                {
                    return (null, new[] { "Conflito de horário com outro evento ativo na mesma data" }, true);
                }

                _dbContext.Events.Add(entity);
                await _dbContext.SaveChangesAsync();

                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(EventDto? Event, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateEventRequest request, bool isPatch)
        {
            var entity = await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Event not found" }, false);
            }

            try
            {
                if (!isPatch || request.Title != null || request.Description != null || request.Location != null)
                {
                    var title = request.Title ?? entity.Title;
                    var description = request.Description ?? entity.Description;
                    entity.UpdateDetails(title, description, request.Location ?? entity.Location);
                }

                if (request.ImageUrl != null)
                {
                    entity.UpdateImage(request.ImageUrl);
                }

                if (request.Type.HasValue)
                {
                    entity.UpdateType(request.Type.Value);
                }

                if (request.IsActive.HasValue)
                {
                    if (request.IsActive.Value)
                    {
                        entity.Activate();
                    }
                    else
                    {
                        entity.Deactivate();
                    }
                }

                var dateChanged = request.Date.HasValue;
                var timesChanged = request.StartTime.HasValue || request.EndTime.HasValue;
                if (dateChanged || timesChanged)
                {
                    var newDate = request.Date.HasValue ? NormalizeDateOnlyUtc(request.Date.Value) : entity.EventDate.Date;
                    var start = request.StartTime ?? entity.EventDate.StartTime;
                    var end = request.EndTime ?? entity.EventDate.EndTime;
                    var newEventDate = new Batuara.Domain.ValueObjects.EventDate(newDate, start, end);
                    entity.UpdateEventDate(newEventDate);
                }

                var businessAfter = _eventDomainService.ValidateEventBusinessRules(entity);
                if (!businessAfter.IsValid)
                {
                    return (null, businessAfter.Errors, false);
                }

                var activeSameDay = (await _dbContext.Events
                    .AsNoTracking()
                    .Where(e => e.IsActive && e.Id != entity.Id)
                    .ToListAsync())
                    .Where(e => e.EventDate.Date.Date == entity.EventDate.Date.Date)
                    .ToList();

                var hasConflict = entity.IsActive && activeSameDay.Any(existing => _eventDomainService.HasTimeConflict(existing, entity));
                if (hasConflict)
                {
                    return (null, new[] { "Conflito de horário com outro evento ativo na mesma data" }, true);
                }

                await _dbContext.SaveChangesAsync();

                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var entity = await _dbContext.Events.FirstOrDefaultAsync(e => e.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _dbContext.SaveChangesAsync();
            return true;
        }

        private static EventDto MapToDto(Event e)
        {
            return new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Date = e.EventDate.Date,
                StartTime = e.EventDate.StartTime,
                EndTime = e.EventDate.EndTime,
                Type = e.Type,
                Location = e.Location,
                ImageUrl = e.ImageUrl,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            };
        }

        private static (int PageNumber, int PageSize) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize)
            {
                size = MaxPageSize;
            }

            return (page, size);
        }

        private static DateTime NormalizeDateOnlyUtc(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }

        private static DateTime? NormalizeDateOnlyUtc(DateTime? value)
        {
            return value.HasValue ? NormalizeDateOnlyUtc(value.Value) : null;
        }

        private static IQueryable<Event> ApplySort(IQueryable<Event> query, string? sort, bool defaultToUpcomingDateAsc)
        {
            var (field, direction) = ParseSort(sort);

            if (field == null)
            {
                if (defaultToUpcomingDateAsc)
                {
                    return query
                        .OrderBy(e => e.EventDate.Date)
                        .ThenBy(e => e.EventDate.StartTime);
                }

                return query
                    .OrderByDescending(e => e.EventDate.Date)
                    .ThenByDescending(e => e.EventDate.StartTime);
            }

            var asc = direction != "desc";

            return field switch
            {
                "date" => asc
                    ? query.OrderBy(e => e.EventDate.Date).ThenBy(e => e.EventDate.StartTime)
                    : query.OrderByDescending(e => e.EventDate.Date).ThenByDescending(e => e.EventDate.StartTime),
                "title" => asc ? query.OrderBy(e => e.Title) : query.OrderByDescending(e => e.Title),
                "createdat" => asc ? query.OrderBy(e => e.CreatedAt) : query.OrderByDescending(e => e.CreatedAt),
                "updatedat" => asc ? query.OrderBy(e => e.UpdatedAt) : query.OrderByDescending(e => e.UpdatedAt),
                _ => query
            };
        }

        private static (string? Field, string? Direction) ParseSort(string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return (null, null);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (parts.Length == 0)
            {
                return (null, null);
            }

            var field = parts[0].ToLowerInvariant();
            var direction = parts.Length > 1 ? parts[1].ToLowerInvariant() : "asc";
            if (direction != "asc" && direction != "desc")
            {
                direction = "asc";
            }

            return (field, direction);
        }
    }
}
