using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Prediction;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/predictions")]
[Authorize]
public class PredictionController : ControllerBase
{
    private readonly IPredictionService _service;

    public PredictionController(IPredictionService service)
    {
        _service = service;
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> Predict(Guid productId, Guid warehouseId)
    {
        var result = await _service.PredictAsync(productId, warehouseId);

        return Ok(ApiResponse<PredictionResponseDto>.SuccessResponse(
            result,
            "Prediction fetched successfully"
        ));
    }
}