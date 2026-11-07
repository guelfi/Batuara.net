using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class BingoTable : BaseEntity
    {
        public int EventId { get; private set; }
        public int Number { get; private set; }

        private BingoTable()
        {
        }

        public BingoTable(int eventId, int number)
        {
            EventId = eventId;
            Number = number;
        }
    }
}
