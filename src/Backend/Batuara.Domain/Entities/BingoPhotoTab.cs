using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    /// <summary>Comanda de papel fotografada no fechamento da conta (tabela BingoPhotoTabs).</summary>
    public class BingoPhotoTab : BaseEntity
    {
        public int EventId { get; private set; }
        public string Label { get; private set; } = string.Empty;
        /// <summary>Numero da comanda de papel (normalizado), usado para impedir fechar a mesma comanda duas vezes.</summary>
        public string? ComandaNumber { get; private set; }
        public string ItemsJson { get; private set; } = "[]";
        public decimal Total { get; private set; }
        public byte[] Photo { get; private set; } = Array.Empty<byte>();
        /// <summary>Forma de pagamento escolhida ao fechar a comanda (nome no momento do fechamento).</summary>
        public string? PaymentMethod { get; private set; }
        public DateTime? CancelledAt { get; private set; }
        public string? CancelReason { get; private set; }
        public string? CancelledByName { get; private set; }

        private BingoPhotoTab()
        {
        }

        public BingoPhotoTab(int eventId, string label, string itemsJson, decimal total, byte[] photo, string? comandaNumber = null, string? paymentMethod = null)
        {
            EventId = eventId;
            Label = label.Trim();
            ComandaNumber = comandaNumber;
            ItemsJson = itemsJson;
            Total = total;
            Photo = photo;
            PaymentMethod = paymentMethod;
        }

        public void Discard() => SetInactive();

        /// <summary>Cancelamento com justificativa: o registro continua visivel, mas sai dos totais.</summary>
        public void Cancel(string reason, string byName, DateTime utcNow)
        {
            CancelledAt = utcNow;
            CancelReason = reason;
            CancelledByName = byName;
            UpdateTimestamp();
        }
    }
}
