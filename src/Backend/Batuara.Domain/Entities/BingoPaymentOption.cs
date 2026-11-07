using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    /// <summary>Forma de pagamento cadastravel do bingo (tabela BingoPaymentMethods).</summary>
    public class BingoPaymentOption : BaseEntity
    {
        public string Name { get; private set; } = string.Empty;
        public int SortOrder { get; private set; }

        private BingoPaymentOption()
        {
        }

        public BingoPaymentOption(string name, bool isActive, int sortOrder)
        {
            Name = name.Trim();
            IsActive = isActive;
            SortOrder = sortOrder;
        }

        public void Update(string name, bool isActive, int sortOrder)
        {
            Name = name.Trim();
            IsActive = isActive;
            SortOrder = sortOrder;
            UpdateTimestamp();
        }

        public void Deactivate() => SetInactive();
    }
}
