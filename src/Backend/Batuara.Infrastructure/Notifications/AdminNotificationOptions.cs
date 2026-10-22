namespace Batuara.Infrastructure.Notifications
{
    public class AdminNotificationOptions
    {
        public bool Enabled { get; set; }
        public string Phone { get; set; } = string.Empty;
        public int DigestHour { get; set; } = 19;
    }
}
