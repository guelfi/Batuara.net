using Batuara.Application.Calendar.Models;
using Batuara.Application.Common.Models;
using Batuara.Domain.Entities;

namespace Batuara.Application.Calendar.Services
{
    public interface ICalendarAttendanceService
    {
        Task<PaginatedResponse<CalendarAttendanceDto>> GetPublicAsync(
            string? q,
            AttendanceType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? requiresRegistration,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<CalendarAttendanceDto?> GetPublicByIdAsync(int id);

        Task<PaginatedResponse<CalendarAttendanceDto>> GetAdminAsync(
            string? q,
            AttendanceType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? requiresRegistration,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<CalendarAttendanceDto?> GetByIdAsync(int id);
        Task<(CalendarAttendanceDto? Attendance, string[] Errors, bool Conflict)> CreateAsync(CreateCalendarAttendanceRequest request);
        Task<(CalendarAttendanceDto? Attendance, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateCalendarAttendanceRequest request);
        Task<bool> SoftDeleteAsync(int id);
    }
}
