using System.Text.Json.Serialization;

namespace InventoryApi.Models.DTOs.Prediction;

public class DailyForecastDto
{
    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;

    [JsonPropertyName("predicted_quantity")]
    public double PredictedQuantity { get; set; }
}

public class PredictionResponseDto
{
    [JsonPropertyName("predicted_quantity")]
    public double PredictedQuantity { get; set; }

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }

    /// <summary>"rising" | "falling" | "stable"</summary>
    [JsonPropertyName("trend")]
    public string Trend { get; set; } = "stable";

    /// <summary>Percentage change vs earlier window. e.g. 12.5 means +12.5%</summary>
    [JsonPropertyName("trend_percent")]
    public double TrendPercent { get; set; }

    [JsonPropertyName("forecast_7_days")]
    public List<DailyForecastDto> Forecast7Days { get; set; } = new();

    /// <summary>Days until current stock hits zero. Null if current stock not provided.</summary>
    [JsonPropertyName("stockout_risk_days")]
    public int? StockoutRiskDays { get; set; }

    /// <summary>Suggested reorder quantity based on lead time + safety stock formula.</summary>
    [JsonPropertyName("recommended_reorder_qty")]
    public int? RecommendedReorderQty { get; set; }

    [JsonPropertyName("anomaly_detected")]
    public bool AnomalyDetected { get; set; }

    [JsonPropertyName("anomaly_description")]
    public string? AnomalyDescription { get; set; }

    /// <summary>Human-readable actionable insight string.</summary>
    [JsonPropertyName("insight_message")]
    public string InsightMessage { get; set; } = string.Empty;

    [JsonPropertyName("model_used")]
    public string ModelUsed { get; set; } = string.Empty;
}