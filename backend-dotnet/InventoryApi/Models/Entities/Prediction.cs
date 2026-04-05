namespace InventoryApi.Models.Entities;

public class Prediction : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid WarehouseId { get; set; }

    public int PredictedQuantity { get; set; }
    public double ConfidenceScore { get; set; }
    public DateTime PredictionForDate { get; set; }

    // ── New enriched fields ──────────────────────────────────────────────────
    public string Trend { get; set; } = "stable";           // "rising" | "falling" | "stable"
    public double TrendPercent { get; set; }
    public int? StockoutRiskDays { get; set; }
    public int? RecommendedReorderQty { get; set; }
    public bool AnomalyDetected { get; set; }
    public string? InsightMessage { get; set; }
    public string? ModelUsed { get; set; }

    // ── Navigation ───────────────────────────────────────────────────────────
    public Product? Product { get; set; }
    public Warehouse? Warehouse { get; set; }
}