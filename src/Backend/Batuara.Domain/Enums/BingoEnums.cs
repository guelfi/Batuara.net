namespace Batuara.Domain.Enums
{
    public enum BingoEventStatus
    {
        Draft,
        Open,
        Closed
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
        Delivered
    }
}
