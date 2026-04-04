using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Product;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/products")]
[Authorize]
public class ProductController : ControllerBase
{
    private readonly IProductService _service;

    public ProductController(IProductService service)
    {
        _service = service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return Ok(ApiResponse<ProductResponseDto>
            .SuccessResponse(result, "Product created successfully."));
    }

    [HttpPatch("update/{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateProductDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(ApiResponse<ProductResponseDto>
            .SuccessResponse(result, "Product updated successfully."));
    }

    [HttpGet("getall/{organizationId?}")]
    public async Task<IActionResult> GetAll(Guid? organizationId)
    {
        var result = await _service.GetAllAsync(organizationId);
        return Ok(ApiResponse<IEnumerable<ProductResponseDto>>
            .SuccessResponse(result));
    }

    [HttpGet("getbyid/{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(ApiResponse<ProductResponseDto>
            .SuccessResponse(result));
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeactivateAsync(id);
        return Ok(ApiResponse<string>
            .SuccessResponse("Product deactivated successfully."));
    }
}