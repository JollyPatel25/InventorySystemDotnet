using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.DTOs.Users;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[Route("api/v1/users")]

[Authorize(Roles = "Admin,Manager,Viewer,PlatformAdmin")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;

    public UserController(IUserService service)
    {
        _service = service;
    }

    // GET all users in org
    [Authorize(Roles = "Admin")]
    [HttpGet("getall")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetOrgUsersAsync();
        return Ok(ApiResponse<IEnumerable<UserListItemDto>>.SuccessResponse(
            result, "Users fetched successfully"));
    }

    // GET warehouse assignments for a user
    [Authorize(Roles = "Admin")]
    [HttpGet("{userId}/warehouse-assignments")]
    public async Task<IActionResult> GetWarehouseAssignments(Guid userId)
    {
        var result = await _service.GetUserWarehouseAssignmentsAsync(userId);
        return Ok(ApiResponse<IEnumerable<UserWarehouseAssignmentResponseDto>>.SuccessResponse(
            result, "Assignments fetched successfully"));
    }

    // POST assign warehouse to user
    [Authorize(Roles = "Admin")]
    [HttpPost("assign-warehouse")]
    public async Task<IActionResult> AssignWarehouse([FromBody] AssignWarehouseDto dto)
    {
        var result = await _service.AssignWarehouseAsync(dto);
        return Ok(ApiResponse<UserWarehouseAssignmentResponseDto>.SuccessResponse(
            result, "Warehouse assigned successfully"));
    }

    // DELETE remove warehouse assignment
    [Authorize(Roles = "Admin")]
    [HttpDelete("remove-warehouse/{assignmentId}")]
    public async Task<IActionResult> RemoveWarehouseAssignment(Guid assignmentId)
    {
        await _service.RemoveWarehouseAssignmentAsync(assignmentId);
        return Ok(ApiResponse<object>.SuccessResponse(
            null, "Assignment removed successfully"));
    }
    [Authorize(Roles = "Admin,Manager,Viewer")]
    [HttpGet("my-organizations")]
    public async Task<IActionResult> GetMyOrganizations()
    {
        var result = await _service.GetMyOrganizationsAsync();
        return Ok(ApiResponse<IEnumerable<UserOrganizationDto>>.SuccessResponse(
            result, "Organizations fetched successfully"));
    }

    // Add these 3 endpoints to UserController.cs

    // GET all users — Platform Admin only
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpGet("platform/getall")]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await _service.GetAllUsersAsync();
        return Ok(ApiResponse<IEnumerable<PlatformUserListItemDto>>.SuccessResponse(
            result, "Users fetched successfully"));
    }

    // PATCH deactivate user — Platform Admin only
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpPatch("platform/deactivate/{userId}")]
    public async Task<IActionResult> DeactivateUser(Guid userId)
    {
        await _service.DeactivateUserAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "User deactivated successfully"));
    }

    // PATCH reactivate user — Platform Admin only
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpPatch("platform/reactivate/{userId}")]
    public async Task<IActionResult> ReactivateUser(Guid userId)
    {
        await _service.ReactivateUserAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "User reactivated successfully"));
    }


    // POST assign existing user as org admin
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpPost("platform/assign-org-admin")]
    public async Task<IActionResult> AssignAsOrgAdmin([FromBody] AssignOrgAdminDto dto)
    {
        await _service.AssignAsOrgAdminAsync(dto.UserId, dto.OrganizationId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "User assigned as Org Admin successfully"));
    }


    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var result = await _service.GetMyProfileAsync();
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(result, "Profile fetched"));
    }

    [Authorize]
    [HttpPatch("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileDto dto)
    {
        var result = await _service.UpdateMyProfileAsync(dto);
        return Ok(ApiResponse<UserProfileDto>.SuccessResponse(result, "Profile updated"));
    }
}