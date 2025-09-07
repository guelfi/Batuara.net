using System;
using FluentValidation;

namespace Batuara.Domain.ValueObjects
{
    public class EventDate : IEquatable<EventDate>
    {
        public DateTime Date { get; private set; }
        public TimeSpan? StartTime { get; private set; }
        public TimeSpan? EndTime { get; private set; }

        private EventDate() { } // For EF Core

        public EventDate(DateTime date, TimeSpan? startTime = null, TimeSpan? endTime = null)
        {
            ValidateEventDate(date, startTime, endTime);
            
            Date = date.Date; // Ensure only date part
            StartTime = startTime;
            EndTime = endTime;
        }

        private static void ValidateEventDate(DateTime date, TimeSpan? startTime, TimeSpan? endTime)
        {
            if (date == default)
                throw new ArgumentException("Event date cannot be default value", nameof(date));

            if (startTime.HasValue && endTime.HasValue && startTime >= endTime)
                throw new ArgumentException("Start time must be before end time");

            if (startTime.HasValue && (startTime.Value < TimeSpan.Zero || startTime.Value >= TimeSpan.FromHours(24)))
                throw new ArgumentException("Start time must be between 00:00 and 23:59");

            if (endTime.HasValue && (endTime.Value < TimeSpan.Zero || endTime.Value >= TimeSpan.FromHours(24)))
                throw new ArgumentException("End time must be between 00:00 and 23:59");
        }

        public bool IsAllDay => !StartTime.HasValue && !EndTime.HasValue;

        public bool HasTimeRange => StartTime.HasValue && EndTime.HasValue;

        public string GetFormattedTime()
        {
            if (IsAllDay) return "Todo o dia";
            if (StartTime.HasValue && EndTime.HasValue)
                return $"{StartTime:hh\\:mm} - {EndTime:hh\\:mm}";
            if (StartTime.HasValue)
                return $"A partir das {StartTime:hh\\:mm}";
            return string.Empty;
        }

        public bool Equals(EventDate? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Date.Equals(other.Date) && 
                   StartTime.Equals(other.StartTime) && 
                   EndTime.Equals(other.EndTime);
        }

        public override bool Equals(object? obj)
        {
            return Equals(obj as EventDate);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Date, StartTime, EndTime);
        }

        public static bool operator ==(EventDate? left, EventDate? right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(EventDate? left, EventDate? right)
        {
            return !Equals(left, right);
        }
    }
}