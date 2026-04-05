using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.DTOs.Users;

namespace InventoryApi.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserOrganizationDto>> GetMyOrganizationsAsync();
    Task<IEnumerable<UserListItemDto>> GetOrgUsersAsync();
    Task<UserWarehouseAssignmentResponseDto> AssignWarehouseAsync(AssignWarehouseDto dto);
    Task RemoveWarehouseAssignmentAsync(Guid assignmentId);
    Task<IEnumerable<UserWarehouseAssignmentResponseDto>> GetUserWarehouseAssignmentsAsync(Guid userId);
    // Add to IUserService interface:

    Task<IEnumerable<PlatformUserListItemDto>> GetAllUsersAsync();
    Task DeactivateUserAsync(Guid userId);
    Task ReactivateUserAsync(Guid userId);
    Task AssignAsOrgAdminAsync(Guid userId, Guid organizationId);
    Task<UserProfileDto> GetMyProfileAsync();
    Task<UserProfileDto> UpdateMyProfileAsync(UpdateUserProfileDto dto);
}