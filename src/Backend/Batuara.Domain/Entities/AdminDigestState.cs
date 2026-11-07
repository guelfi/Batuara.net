using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class AdminDigestState : BaseEntity
    {
        public const string PendingContactsKey = "pending-contacts";

        public string Key { get; private set; } = string.Empty;
        public DateTime LastSentAt { get; private set; }
        public int LastSentCount { get; private set; }

        private AdminDigestState()
        {
        }

        public AdminDigestState(string key, DateTime lastSentAt, int lastSentCount)
        {
            Key = key;
            LastSentAt = lastSentAt;
            LastSentCount = lastSentCount;
        }

        public void RegisterSent(DateTime lastSentAt, int lastSentCount)
        {
            LastSentAt = lastSentAt;
            LastSentCount = lastSentCount;
            UpdateTimestamp();
        }
    }
}
