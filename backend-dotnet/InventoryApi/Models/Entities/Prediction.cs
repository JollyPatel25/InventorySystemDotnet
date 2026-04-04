namespace InventoryApi.Models.Entities;

public class Prediction : BaseEntity
{
    // Foreign Keys
    public required Guid ProductId { get; set; }
    public required Guid WarehouseId { get; set; }

    // Prediction Data
    public required int PredictedQuantity { get; set; }
    public required double ConfidenceScore { get; set; } // 0–1

    // Prediction target date
    public required DateTime PredictionForDate { get; set; }

    // Navigation
    public Product Product { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}