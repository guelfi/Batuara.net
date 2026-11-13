using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class BingoTable : BaseEntity
    {
        public int EventId { get; private set; }
        public int Number { get; private set; }

        public const int DefaultCapacity = 4;
        public const int MaxCapacity = 50;

        /// <summary>Quantos lugares a mesa tem.</summary>
        public int Capacity { get; private set; } = DefaultCapacity;

        /// <summary>true = mesa exclusiva (um grupo só); false = compartilhada, vale quem chega primeiro até lotar.</summary>
        public bool IsExclusive { get; private set; }

        private BingoTable()
        {
        }

        public BingoTable(int eventId, int number, int capacity = DefaultCapacity, bool isExclusive = false)
        {
            EventId = eventId;
            Number = number;
            Capacity = capacity;
            IsExclusive = isExclusive;
        }

        public void Configure(int capacity, bool isExclusive)
        {
            Capacity = capacity;
            IsExclusive = isExclusive;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
