using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    /// <summary>Comanda de papel fotografada no fechamento da conta (tabela BingoPhotoTabs).</summary>
    public class BingoPhotoTab : BaseEntity
    {
        public int EventId { get; private set; }
        public string Label { get; private set; } = string.Empty;
        public string ItemsJson { get; private set; } = "[]";
        public decimal Total { get; private set; }
        public byte[] Photo { get; private set; } = Array.Empty<byte>();

        private BingoPhotoTab()
        {
        }

        public BingoPhotoTab(int eventId, string label, string itemsJson, decimal total, byte[] photo)
        {
            EventId = eventId;
            Label = label.Trim();
            ItemsJson = itemsJson;
            Total = total;
            Photo = photo;
        }

        public void Discard() => SetInactive();
    }
}
