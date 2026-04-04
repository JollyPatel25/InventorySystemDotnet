using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Auth;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.DTOs.Roles;
using InventoryApi.Models.Enums;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    //  Public Login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            accessToken = token
        }, "Login successful"));
    }

    //  Platform Admin Only
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpPost("platform/create-organization")]
    public async Task<IActionResult> CreateOrganization(
        [FromBody] CreateOrganizationDto request)
    {
        var org = await _authService.CreateOrganizationAsync(request);

        return Ok(ApiResponse<Organization>.SuccessResponse(
            org,
            "Organization created successfully"
        ));
    }

    //  Platform Admin Only
    [Authorize(Policy = "PlatformAdminOnly")]
    [HttpPost("platform/create-org-admin")]
    public async Task<IActionResult> CreateOrgAdmin(
        [FromBody] CreateOrgAdminDto request)
    {

        var user = await _authService.CreateOrgAdminAsync(request);

        var response = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsPlatformAdmin = user.IsPlatformAdmin
        };

        return Ok(ApiResponse<UserResponseDto>.SuccessResponse(
            response,
            "Organization admin created successfully"
        ));
    }



    // CREATE user(MANAGER OR VIEWER)
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("org/create-user")]
    public async Task<IActionResult> CreateUserWithRole(
    [FromBody] CreateUserWithRoleDto request)
    {
        // 🔹 Extract from JWT
        var orgId = Guid.Parse(User.FindFirst("OrganizationId")!.Value);
        var userId = Guid.Parse(User.FindFirst("UserId")!.Value);

        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (!Enum.TryParse<UserRole>(roleClaim, out var currentUserRole))
            throw new Exception("Invalid role in token.");

        var user = await _authService.CreateUserWithRoleAsync(
            orgId,
            userId,
            currentUserRole,
            request);

        return Ok(ApiResponse<UserResponseDto>.SuccessResponse(
            new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsPlatformAdmin = user.IsPlatformAdmin
            },
            "User created successfully"
        ));
    }

    [Authorize]
    [HttpPost("switch-organization")]
    public async Task<IActionResult> SwitchOrganization(
    [FromBody] SwitchOrganizationDto request)
    {
        var userId = Guid.Parse(User.FindFirst("UserId")!.Value);

        var token = await _authService.SwitchOrganizationAsync(
            userId,
            request.OrganizationId);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            accessToken = token
        }, "Organization switched"));
    }

    [Authorize]
    [HttpPost("set-default-organization")]
    public async Task<IActionResult> SetDefaultOrganization(
    [FromBody] SwitchOrganizationDto request)
    {
        var userId = Guid.Parse(User.FindFirst("UserId")!.Value);

        await _authService.SetDefaultOrganizationAsync(
            userId,
            request.OrganizationId);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            "Default organization updated successfully"
        ));
    }

}