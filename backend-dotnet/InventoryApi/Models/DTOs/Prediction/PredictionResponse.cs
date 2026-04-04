using System.Text.Json.Serialization;

namespace InventoryApi.Models.DTOs.Prediction;

public class PredictionResponseDto
{
    [JsonPropertyName("predicted_quantity")]
    public int PredictedQuantity { get; set; }

    [JsonPropertyName("confidence")]
    public double Confidence { get; set; }
}