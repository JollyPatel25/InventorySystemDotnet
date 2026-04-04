using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Users;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;

    public UserController(IUserService service)
    {
        _service = service;
    }

    // GET all users in org
    [HttpGet("getall")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetOrgUsersAsync();
        return Ok(ApiResponse<IEnumerable<UserListItemDto>>.SuccessResponse(
            result, "Users fetched successfully"));
    }

    // GET warehouse assignments for a user
    [HttpGet("{userId}/warehouse-assignments")]
    public async Task<IActionResult> GetWarehouseAssignments(Guid userId)
    {
        var result = await _service.GetUserWarehouseAssignmentsAsync(userId);
        return Ok(ApiResponse<IEnumerable<UserWarehouseAssignmentResponseDto>>.SuccessResponse(
            result, "Assignments fetched successfully"));
    }

    // POST assign warehouse to user
    [HttpPost("assign-warehouse")]
    public async Task<IActionResult> AssignWarehouse([FromBody] AssignWarehouseDto dto)
    {
        var result = await _service.AssignWarehouseAsync(dto);
        return Ok(ApiResponse<UserWarehouseAssignmentResponseDto>.SuccessResponse(
            result, "Warehouse assigned successfully"));
    }

    // DELETE remove warehouse assignment
    [HttpDelete("remove-warehouse/{assignmentId}")]
    public async Task<IActionResult> RemoveWarehouseAssignment(Guid assignmentId)
    {
        await _service.RemoveWarehouseAssignmentAsync(assignmentId);
        return Ok(ApiResponse<object>.SuccessResponse(
            null, "Assignment removed successfully"));
    }
}