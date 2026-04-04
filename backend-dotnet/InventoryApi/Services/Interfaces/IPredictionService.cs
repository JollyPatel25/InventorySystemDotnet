using InventoryApi.Models.DTOs.Prediction;

namespace InventoryApi.Services.Interfaces;

public interface IPredictionService
{
    Task<PredictionResponseDto> PredictAsync(Guid productId, Guid warehouseId);
}