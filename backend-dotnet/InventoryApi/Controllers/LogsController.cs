using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Logs;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/logs")]
[Authorize(Policy = "PlatformAdminOnly")]
public class LogsController : ControllerBase
{
    private readonly ILogService _service;

    public LogsController(ILogService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] LogQueryDto query)
    {
        var result = await _service.GetLogsAsync(query);
        return Ok(ApiResponse<PagedLogsDto>.SuccessResponse(result, "Logs fetched successfully"));
    }
}