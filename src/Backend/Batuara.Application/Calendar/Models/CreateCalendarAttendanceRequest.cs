using Batuara.Domain.Entities;

namespace Batuara.Application.Calendar.Models
{
    public class CreateCalendarAttendanceRequest
    {
        public DateTime Date { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public AttendanceType Type { get; set; }
        public string? Description { get; set; }
        public string? Observations { get; set; }
        public bool RequiresRegistration { get; set; }
        public int? MaxCapacity { get; set; }
    }
}
