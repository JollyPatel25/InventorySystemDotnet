using InventoryApi.Models.Enums;

namespace InventoryApi.Models.Entities;

public class StockAdjustment : BaseEntity
{
    // FK
    public required Guid InventoryId { get; set; }

    public required StockAdjustmentType AdjustmentType { get; set; }

    // Can be + or -
    public required int QuantityChanged { get; set; }

    // 🔥 VERY IMPORTANT (store final quantity after change)
    public required int NewQuantity { get; set; }

    // Required
    public required string Reason { get; set; }

    public required Guid CreatedByUserId { get; set; }


    // Navigation
    public Inventory Inventory { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}