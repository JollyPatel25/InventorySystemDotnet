using InventoryApi.Models.Common;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _service;

    public ReportsController(IReportService service)
    {
        _service = service;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var result = await _service.GetDashboardAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            result,
            "Dashboard data fetched successfully"
        ));
    }

    [HttpGet("sales/today")]
    public async Task<IActionResult> SalesToday()
    {
        var result = await _service.GetSalesTodayAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            result,
            "Today's sales fetched successfully"
        ));
    }

    [HttpGet("revenue/monthly")]
    public async Task<IActionResult> MonthlyRevenue()
    {
        var result = await _service.GetMonthlyRevenueAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            result,
            "Monthly revenue fetched successfully"
        ));
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts()
    {
        var result = await _service.GetTopProductsAsync();

        return Ok(ApiResponse<object>.SuccessResponse(
            result,
            "Top products fetched successfully"
        ));
    }
}