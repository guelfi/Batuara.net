namespace Batuara.Domain.Enums
{
    public enum BingoEventStatus
    {
        Draft,
        Open,
        Closed,
        /// <summary>Pausado: bloqueia pedidos e libera a vaga de evento aberto; pode ser retomado.</summary>
        Suspended
    }

    public enum BingoTabStatus
    {
        Open,
        CloseRequested,
        Paid
    }

    public enum BingoPaymentMethod
    {
        Card,
        Pix,
        Cash
    }

    public enum BingoOrderItemStatus
    {
        Pending,
        Retrieved,
        Delivered,
        Contested,
        Cancelled
    }
}
