using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class BingoMenuItem : BaseEntity
    {
        public int EventId { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public decimal UnitPrice { get; private set; }
        public bool IsAvailable { get; private set; }
        public int SortOrder { get; private set; }

        private BingoMenuItem()
        {
        }

        public BingoMenuItem(int eventId, string name, decimal unitPrice, bool isAvailable, int sortOrder)
        {
            EventId = eventId;
            Update(name, unitPrice, isAvailable, sortOrder);
        }

        public void Update(string name, decimal unitPrice, bool isAvailable, int sortOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("O nome do item é obrigatório.", nameof(name));
            }

            if (unitPrice < 0)
            {
                throw new ArgumentException("O preço não pode ser negativo.", nameof(unitPrice));
            }

            Name = name.Trim();
            UnitPrice = unitPrice;
            IsAvailable = isAvailable;
            SortOrder = sortOrder;
            UpdateTimestamp();
        }

        public void SetAvailability(bool isAvailable)
        {
            IsAvailable = isAvailable;
            UpdateTimestamp();
        }

        public void Remove() => SetInactive();
    }
}
