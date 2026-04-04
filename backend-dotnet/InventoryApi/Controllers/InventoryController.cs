using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Inventory;
using InventoryApi.Services;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/inventory")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service)
    {
        _service = service;
    }

    [HttpPost("initialize")]
    public async Task<IActionResult> Initialize([FromBody] InitializeInventoryDto dto)
    {
        await _service.InitializeAsync(dto);

        return Ok(ApiResponse<object>.SuccessResponse(null, "Inventory initialized successfully")); ;
    }

    [HttpGet("warehouse/{warehouseId}")]
    public async Task<IActionResult> GetByWarehouse(Guid warehouseId)
    {
        var result = await _service.GetByWarehouseAsync(warehouseId);
        return Ok(ApiResponse<IEnumerable<InventoryResponseDto>>
            .SuccessResponse(result));
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> UpdateStock([FromBody] UpdateStockDto dto)
    {
        var result = await _service.UpdateStockAsync(dto);
        return Ok(ApiResponse<InventoryResponseDto>
            .SuccessResponse(result, "Stock updated successfully."));
    }

    [HttpGet("low-stock/{warehouseId}")]
    public async Task<IActionResult> GetLowStock(Guid warehouseId)
    {
        var result = await _service.GetLowStockAsync(warehouseId);
        return Ok(ApiResponse<IEnumerable<InventoryResponseDto>>
            .SuccessResponse(result));
    }
}