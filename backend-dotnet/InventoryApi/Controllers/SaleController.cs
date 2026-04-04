using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Sales;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/sales")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ISalesService _salesService;

    public SalesController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    // ---------------- CREATE SALE ----------------

    [HttpPost]
    public async Task<IActionResult> CreateSale([FromBody] CreateSaleDto dto)
    {
        var result = await _salesService.CreateSaleAsync(dto);

        return Ok(ApiResponse<SaleResponseDto>.SuccessResponse(
            result,
            "Sale created successfully"
        ));
    }

    // ---------------- GET SALE BY ID ----------------

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSale(Guid id)
    {
        var result = await _salesService.GetSaleByIdAsync(id);

        return Ok(ApiResponse<SaleResponseDto>.SuccessResponse(
            result,
            "Sale fetched successfully"
        ));
    }

    // ---------------- GET SALES BY WAREHOUSE ----------------

    [HttpGet("warehouse/{warehouseId}")]
    public async Task<IActionResult> GetSalesByWarehouse(Guid warehouseId)
    {
        var result = await _salesService.GetSalesByWarehouseAsync(warehouseId);

        return Ok(ApiResponse<IEnumerable<SaleResponseDto>>.SuccessResponse(
            result,
            "Sales fetched successfully"
        ));
    }
}