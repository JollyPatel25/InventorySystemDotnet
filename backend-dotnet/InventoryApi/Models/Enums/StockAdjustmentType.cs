namespace InventoryApi.Models.Enums
{
    public enum StockAdjustmentType
    {
        InitialStock = 1,
        ManualIncrease = 2,
        ManualDecrease = 3,
        Correction = 4,
        TransferIn = 5,
        TransferOut = 6,
        Sale = 7,
        Purchase = 8,
        Expired = 9
    }
}
