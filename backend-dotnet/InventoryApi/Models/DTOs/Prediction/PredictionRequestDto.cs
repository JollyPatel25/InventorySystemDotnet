namespace InventoryApi.Models.DTOs.Prediction;

public class PredictionRequestDto
{
    public Guid ProductId { get; set; }

    public List<int> HistoricalSales { get; set; } = new();
}