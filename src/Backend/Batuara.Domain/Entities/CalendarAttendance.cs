using System;
using Batuara.Domain.Common;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Events;

namespace Batuara.Domain.Entities
{
    public class CalendarAttendance : BaseEntity, IAggregateRoot
    {
        public EventDate AttendanceDate { get; private set; } = null!;
        public AttendanceType Type { get; private set; }
        public string? Description { get; private set; }
        public string? Observations { get; private set; }
        public bool RequiresRegistration { get; private set; }
        public int? MaxCapacity { get; private set; }

        private CalendarAttendance() { } // For EF Core

        public CalendarAttendance(
            EventDate attendanceDate, 
            AttendanceType type, 
            string? description = null, 
            string? observations = null,
            bool requiresRegistration = false,
            int? maxCapacity = null)
        {
            ValidateAttendance(attendanceDate, type, maxCapacity);
            
            AttendanceDate = attendanceDate;
            Type = type;
            Description = description;
            Observations = observations;
            RequiresRegistration = requiresRegistration;
            MaxCapacity = maxCapacity;

            // Disparar domain event
            AddDomainEvent(new CalendarAttendanceScheduledDomainEvent(this));
        }

        private static void ValidateAttendance(EventDate attendanceDate, AttendanceType type, int? maxCapacity)
        {
            if (attendanceDate == null)
                throw new ArgumentNullException(nameof(attendanceDate));

            if (!attendanceDate.HasTimeRange)
                throw new ArgumentException("Attendance must have start and end time", nameof(attendanceDate));

            if (!Enum.IsDefined(typeof(AttendanceType), type))
                throw new ArgumentException("Invalid attendance type", nameof(type));

            if (maxCapacity.HasValue && maxCapacity <= 0)
                throw new ArgumentException("Max capacity must be greater than zero", nameof(maxCapacity));
        }

        public void UpdateDetails(string? description, string? observations)
        {
            Description = description;
            Observations = observations;
            UpdateTimestamp();
        }

        public void UpdateCapacity(int? maxCapacity, bool requiresRegistration)
        {
            if (maxCapacity.HasValue && maxCapacity <= 0)
                throw new ArgumentException("Max capacity must be greater than zero", nameof(maxCapacity));

            MaxCapacity = maxCapacity;
            RequiresRegistration = requiresRegistration;
            UpdateTimestamp();
        }

        public void RescheduleAttendance(EventDate newAttendanceDate)
        {
            if (newAttendanceDate == null)
                throw new ArgumentNullException(nameof(newAttendanceDate));

            if (!newAttendanceDate.HasTimeRange)
                throw new ArgumentException("Attendance must have start and end time", nameof(newAttendanceDate));

            AttendanceDate = newAttendanceDate;
            UpdateTimestamp();
        }

        public bool IsToday()
        {
            return AttendanceDate.Date.Date == DateTime.Today;
        }

        public bool IsThisWeek()
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(6);
            
            return AttendanceDate.Date.Date >= startOfWeek && AttendanceDate.Date.Date <= endOfWeek;
        }

        public string GetTypeDisplayName()
        {
            return Type switch
            {
                AttendanceType.Kardecismo => "Atendimento Kardecista",
                AttendanceType.Umbanda => "Gira de Umbanda",
                AttendanceType.Palestra => "Palestra",
                AttendanceType.Curso => "Curso",
                _ => Type.ToString()
            };
        }
    }

    public enum AttendanceType
    {
        Kardecismo = 1,
        Umbanda = 2,
        Palestra = 3,
        Curso = 4
    }
}