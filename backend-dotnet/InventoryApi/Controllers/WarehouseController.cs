using InventoryApi.Models.DTOs.Warehouse;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using InventoryApi.Models.Common;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;
[ApiController]
[Route("api/v1/warehouses")]
[Authorize]
public class WarehouseController : ControllerBase
{
    private readonly IWarehouseService _service;

    public WarehouseController(IWarehouseService service)
    {
        _service = service;
    }

    // CREATE
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseDto dto)
    {
        var result = await _service.CreateAsync(dto);

        return Ok(ApiResponse<WarehouseResponseDto>.SuccessResponse(
            result,
            "Warehouse created successfully"
        ));
    }

    // GET ALL
    [HttpGet("getall")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(ApiResponse<IEnumerable<WarehouseResponseDto>>.SuccessResponse(
            result,
            "Warehouses fetched successfully"
        ));
    }

    // GET BY ID (ADD THIS)
    [HttpGet("getbyid/{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);

        return Ok(ApiResponse<WarehouseResponseDto>.SuccessResponse(
            result,
            "Warehouse fetched successfully"
        ));
    }

    // UPDATE
    [HttpPatch("update/{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);

        return Ok(ApiResponse<WarehouseResponseDto>.SuccessResponse(
            result,
            "Warehouse updated successfully"
        ));
    }
    // DEACTIVATE
    [HttpDelete("deactivate/{id}")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await _service.DeactivateAsync(id);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            "Warehouse deactivated successfully"
        ));
    }


    [HttpPatch("reactivate/{id}")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        await _service.ReactivateAsync(id);
        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            "Warehouse reactivated successfully"
        ));
    }

    // DELETE
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            "Warehouse deleted successfully"
        ));
    }
}