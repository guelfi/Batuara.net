using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class MemberLoginCode : BaseEntity
    {
        public int HouseMemberId { get; private set; }
        public string CodeHash { get; private set; } = string.Empty;
        public DateTime ExpiresAt { get; private set; }
        public int Attempts { get; private set; }
        public DateTime? ConsumedAt { get; private set; }
        public string? CreatedByIp { get; private set; }
        public HouseMember HouseMember { get; private set; } = null!;

        private MemberLoginCode()
        {
        }

        public MemberLoginCode(int houseMemberId, string codeHash, DateTime expiresAt, string? createdByIp)
        {
            HouseMemberId = houseMemberId;
            CodeHash = codeHash;
            ExpiresAt = expiresAt;
            CreatedByIp = string.IsNullOrWhiteSpace(createdByIp) ? null : createdByIp.Trim();
        }

        public bool IsExpired(DateTime utcNow) => ExpiresAt <= utcNow;

        public bool IsConsumed => ConsumedAt.HasValue;

        public void RegisterAttempt()
        {
            Attempts++;
            UpdateTimestamp();
        }

        public void Consume(DateTime utcNow)
        {
            ConsumedAt = utcNow;
            UpdateTimestamp();
        }
    }
}
