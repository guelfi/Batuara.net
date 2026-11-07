using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class BingoWaiter : BaseEntity
    {
        public int EventId { get; private set; }
        public int HouseMemberId { get; private set; }
        public DateTime? LastSeenAt { get; private set; }
        public HouseMember HouseMember { get; private set; } = null!;

        private BingoWaiter()
        {
        }

        public BingoWaiter(int eventId, int houseMemberId)
        {
            EventId = eventId;
            HouseMemberId = houseMemberId;
        }

        public void Activate()
        {
            IsActive = true;
            UpdateTimestamp();
        }

        public void Deactivate() => SetInactive();

        public void Touch(DateTime utcNow)
        {
            LastSeenAt = utcNow;
        }
    }
}
