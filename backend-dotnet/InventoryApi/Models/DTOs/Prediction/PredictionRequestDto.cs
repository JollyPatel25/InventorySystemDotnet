namespace InventoryApi.Models.DTOs.Prediction;
using System.Text.Json.Serialization;

public class PredictionRequestDto
{
    [JsonPropertyName("product_id")]
    public string ProductId { get; set; }

    [JsonPropertyName("sales")]
    public List<int> Sales { get; set; }

    [JsonPropertyName("dates")]
    public List<string>? Dates { get; set; }

    [JsonPropertyName("current_stock")]
    public int? CurrentStock { get; set; }

    [JsonPropertyName("reorder_point")]
    public int? ReorderPoint { get; set; }

    [JsonPropertyName("lead_time_days")]
    public int? LeadTimeDays { get; set; }
}