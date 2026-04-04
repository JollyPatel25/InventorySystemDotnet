using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Tax;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/tax")]
[Authorize]
public class TaxController : ControllerBase
{
    private readonly ITaxService _service;

    public TaxController(ITaxService service)
    {
        _service = service;
    }

    [HttpGet("getall")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<TaxConfigurationResponseDto>>
            .SuccessResponse(result, "Tax configurations fetched successfully."));
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateTaxConfigurationDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return Ok(ApiResponse<TaxConfigurationResponseDto>
            .SuccessResponse(result, "Tax configuration created successfully."));
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeactivateAsync(id);
        return Ok(ApiResponse<object>
            .SuccessResponse(null, "Tax configuration deactivated successfully."));
    }
}