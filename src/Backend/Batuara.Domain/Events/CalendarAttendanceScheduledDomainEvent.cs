using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Events
{
    public class CalendarAttendanceScheduledDomainEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; }
        public Guid EventId { get; }
        public CalendarAttendance Attendance { get; }

        public CalendarAttendanceScheduledDomainEvent(CalendarAttendance attendance)
        {
            OccurredOn = DateTime.UtcNow;
            EventId = Guid.NewGuid();
            Attendance = attendance;
        }
    }
}