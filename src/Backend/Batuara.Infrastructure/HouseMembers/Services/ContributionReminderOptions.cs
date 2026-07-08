namespace Batuara.Infrastructure.HouseMembers.Services
{
    public class ContributionReminderOptions
    {
        public bool Enabled { get; set; }
        public int IntervalMinutes { get; set; } = 15;
        public int DaysBeforeDue { get; set; } = 2;
        public int MaxMessagesPerRun { get; set; } = 1;
        public int RetryIntervalMinutes { get; set; } = 60;
        public int MaxAttempts { get; set; } = 3;
    }
}
