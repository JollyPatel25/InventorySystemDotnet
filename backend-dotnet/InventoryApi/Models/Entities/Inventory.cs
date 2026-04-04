using InventoryApi.Models.Entities;

public class Inventory : BaseEntity
{
    // Foreign Keys (Required by default)
    public required Guid ProductId { get; set; }
    public required Guid WarehouseId { get; set; }

    // Stock Data
    public required int Quantity { get; set; }
    public required int LowStockThreshold { get; set; }

    // Navigation Properties
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;

    public ICollection<StockAdjustment> StockAdjustments { get; set; }
        = new List<StockAdjustment>();
}