using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Specifications
{
    public class ActiveAttendancesSpecification : BaseSpecification<CalendarAttendance>
    {
        public ActiveAttendancesSpecification() : base(a => a.IsActive)
        {
        }
    }

    public class AttendancesByTypeSpecification : BaseSpecification<CalendarAttendance>
    {
        public AttendancesByTypeSpecification(AttendanceType type) 
            : base(a => a.IsActive && a.Type == type)
        {
        }
    }

    public class AttendancesByDateRangeSpecification : BaseSpecification<CalendarAttendance>
    {
        public AttendancesByDateRangeSpecification(DateTime startDate, DateTime endDate) 
            : base(a => a.IsActive && 
                       a.AttendanceDate.Date >= startDate.Date && 
                       a.AttendanceDate.Date <= endDate.Date)
        {
        }
    }

    public class TodayAttendancesSpecification : BaseSpecification<CalendarAttendance>
    {
        public TodayAttendancesSpecification() 
            : base(a => a.IsActive && a.AttendanceDate.Date.Date == DateTime.Today)
        {
        }
    }

    public class ThisWeekAttendancesSpecification : BaseSpecification<CalendarAttendance>
    {
        public ThisWeekAttendancesSpecification() 
            : base(a => a.IsActive && IsThisWeek(a.AttendanceDate.Date))
        {
        }

        private static bool IsThisWeek(DateTime date)
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(6);
            return date >= startOfWeek && date <= endOfWeek;
        }
    }

    public class AttendancesByMonthSpecification : BaseSpecification<CalendarAttendance>
    {
        public AttendancesByMonthSpecification(int year, int month) 
            : base(a => a.IsActive && 
                       a.AttendanceDate.Date.Year == year && 
                       a.AttendanceDate.Date.Month == month)
        {
        }
    }
}