using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Repositories
{
    public interface ICalendarRepository
    {
        Task<CalendarAttendance?> GetByIdAsync(int id);
        Task<IEnumerable<CalendarAttendance>> GetAllAsync();
        Task<IEnumerable<CalendarAttendance>> GetActiveAttendancesAsync();
        Task<IEnumerable<CalendarAttendance>> GetAttendancesByMonthAsync(int year, int month);
        Task<IEnumerable<CalendarAttendance>> GetAttendancesByTypeAsync(AttendanceType type);
        Task<IEnumerable<CalendarAttendance>> GetAttendancesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<CalendarAttendance>> GetTodayAttendancesAsync();
        Task<IEnumerable<CalendarAttendance>> GetThisWeekAttendancesAsync();
        Task<CalendarAttendance> AddAsync(CalendarAttendance attendance);
        Task UpdateAsync(CalendarAttendance attendance);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> HasConflictAsync(CalendarAttendance attendance);
    }
}