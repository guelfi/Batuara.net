using Batuara.Application.Calendar.Models;
using Batuara.Application.Calendar.Services;
using Batuara.Application.Common.Models;
using Batuara.Domain.Entities;
using Batuara.Domain.Services;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Calendar.Services
{
    public class CalendarAttendanceService : ICalendarAttendanceService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;
        private readonly ICalendarDomainService _calendarDomainService;

        public CalendarAttendanceService(BatuaraDbContext db, ICalendarDomainService calendarDomainService)
        {
            _db = db;
            _calendarDomainService = calendarDomainService;
        }

        public async Task<PaginatedResponse<CalendarAttendanceDto>> GetPublicAsync(
            string? q,
            AttendanceType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? requiresRegistration,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, type, fromDate ?? DateTime.Today, toDate, requiresRegistration, true, true);
            query = ApplySort(query, sort, true);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<CalendarAttendanceDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<CalendarAttendanceDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _db.CalendarAttendances.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<CalendarAttendanceDto>> GetAdminAsync(
            string? q,
            AttendanceType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? requiresRegistration,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, type, fromDate, toDate, requiresRegistration, false, isActive);
            query = ApplySort(query, sort, false);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<CalendarAttendanceDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<CalendarAttendanceDto?> GetByIdAsync(int id)
        {
            var entity = await _db.CalendarAttendances.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(CalendarAttendanceDto? Attendance, string[] Errors, bool Conflict)> CreateAsync(CreateCalendarAttendanceRequest request)
        {
            try
            {
                var attendanceDate = new Batuara.Domain.ValueObjects.EventDate(request.Date, request.StartTime, request.EndTime);
                var entity = new CalendarAttendance(
                    attendanceDate,
                    request.Type,
                    request.Description,
                    request.Observations,
                    request.RequiresRegistration,
                    request.MaxCapacity);

                var validation = await ValidateBusinessAndConflictsAsync(entity);
                if (validation.Errors.Length > 0)
                {
                    return (null, validation.Errors, validation.Conflict);
                }

                _db.CalendarAttendances.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(CalendarAttendanceDto? Attendance, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateCalendarAttendanceRequest request)
        {
            var entity = await _db.CalendarAttendances.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Attendance not found" }, false);
            }

            try
            {
                if (request.Date.HasValue || request.StartTime.HasValue || request.EndTime.HasValue)
                {
                    var date = request.Date?.Date ?? entity.AttendanceDate.Date;
                    var start = request.StartTime ?? entity.AttendanceDate.StartTime;
                    var end = request.EndTime ?? entity.AttendanceDate.EndTime;
                    entity.RescheduleAttendance(new Batuara.Domain.ValueObjects.EventDate(date, start, end));
                }

                if (request.Type.HasValue)
                {
                    entity.UpdateType(request.Type.Value);
                }

                if (request.Description != null || request.Observations != null)
                {
                    entity.UpdateDetails(request.Description ?? entity.Description, request.Observations ?? entity.Observations);
                }

                if (request.MaxCapacity.HasValue || request.RequiresRegistration.HasValue)
                {
                    entity.UpdateCapacity(request.MaxCapacity ?? entity.MaxCapacity, request.RequiresRegistration ?? entity.RequiresRegistration);
                }

                if (request.IsActive.HasValue)
                {
                    if (request.IsActive.Value) entity.Activate();
                    else entity.Deactivate();
                }

                var validation = await ValidateBusinessAndConflictsAsync(entity, true);
                if (validation.Errors.Length > 0)
                {
                    return (null, validation.Errors, validation.Conflict);
                }

                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var entity = await _db.CalendarAttendances.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private IQueryable<CalendarAttendance> BuildQuery(
            string? q,
            AttendanceType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? requiresRegistration,
            bool onlyTrackingDisabled,
            bool? isActive)
        {
            IQueryable<CalendarAttendance> query = _db.CalendarAttendances;
            if (onlyTrackingDisabled)
            {
                query = query.AsNoTracking();
            }

            if (isActive.HasValue)
            {
                query = query.Where(x => x.IsActive == isActive.Value);
            }

            if (fromDate.HasValue)
            {
                var start = fromDate.Value.Date;
                query = query.Where(x => x.AttendanceDate.Date.Date >= start);
            }

            if (toDate.HasValue)
            {
                var end = toDate.Value.Date;
                query = query.Where(x => x.AttendanceDate.Date.Date <= end);
            }

            if (type.HasValue)
            {
                query = query.Where(x => x.Type == type.Value);
            }

            if (requiresRegistration.HasValue)
            {
                query = query.Where(x => x.RequiresRegistration == requiresRegistration.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    (x.Description != null && x.Description.ToLower().Contains(term)) ||
                    (x.Observations != null && x.Observations.ToLower().Contains(term)));
            }

            return query;
        }

        private async Task<(string[] Errors, bool Conflict)> ValidateBusinessAndConflictsAsync(CalendarAttendance entity, bool isUpdate = false)
        {
            var business = _calendarDomainService.ValidateAttendanceBusinessRules(entity, isUpdate);
            if (!business.IsValid)
            {
                return (business.Errors, false);
            }

            var sameDayAttendances = await _db.CalendarAttendances.AsNoTracking()
                .Where(x => x.IsActive && x.Id != entity.Id && x.AttendanceDate.Date.Date == entity.AttendanceDate.Date.Date)
                .ToListAsync();

            if (sameDayAttendances.Any(existing => _calendarDomainService.HasAttendanceConflict(existing, entity)))
            {
                return (new[] { "Conflito de horário com outro atendimento na mesma data" }, true);
            }

            var sameDayEvents = await _db.Events.AsNoTracking()
                .Where(x => x.IsActive && x.EventDate.Date.Date == entity.AttendanceDate.Date.Date)
                .ToListAsync();

            if (await _calendarDomainService.HasConflictWithEventsAsync(entity, sameDayEvents))
            {
                return (new[] { "Conflito de horário com evento ativo na mesma data" }, true);
            }

            return (Array.Empty<string>(), false);
        }

        private static IQueryable<CalendarAttendance> ApplySort(IQueryable<CalendarAttendance> query, string? sort, bool ascendingDefault)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return ascendingDefault
                    ? query.OrderBy(x => x.AttendanceDate.Date).ThenBy(x => x.AttendanceDate.StartTime)
                    : query.OrderByDescending(x => x.AttendanceDate.Date).ThenByDescending(x => x.AttendanceDate.StartTime);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var direction = parts.ElementAtOrDefault(1)?.ToLowerInvariant() == "desc" ? "desc" : "asc";
            var asc = direction != "desc";

            return field switch
            {
                "date" => asc ? query.OrderBy(x => x.AttendanceDate.Date).ThenBy(x => x.AttendanceDate.StartTime) : query.OrderByDescending(x => x.AttendanceDate.Date).ThenByDescending(x => x.AttendanceDate.StartTime),
                "type" => asc ? query.OrderBy(x => x.Type) : query.OrderByDescending(x => x.Type),
                "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                _ => query.OrderBy(x => x.AttendanceDate.Date).ThenBy(x => x.AttendanceDate.StartTime)
            };
        }

        private static (int Page, int Size) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize) size = MaxPageSize;
            return (page, size);
        }

        private static CalendarAttendanceDto MapToDto(CalendarAttendance entity)
        {
            return new CalendarAttendanceDto
            {
                Id = entity.Id,
                Date = entity.AttendanceDate.Date,
                StartTime = entity.AttendanceDate.StartTime,
                EndTime = entity.AttendanceDate.EndTime,
                Type = entity.Type,
                Description = entity.Description,
                Observations = entity.Observations,
                RequiresRegistration = entity.RequiresRegistration,
                MaxCapacity = entity.MaxCapacity,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
