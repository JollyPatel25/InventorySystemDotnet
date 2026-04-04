using InventoryApi.Models.DTOs.Auth;
using InventoryApi.Models.DTOs.Roles;
using InventoryApi.Models.Entities;
using InventoryApi.Models.Enums;

namespace InventoryApi.Services.Interfaces;

public interface IAuthService
{
    Task<User> RegisterPlatformAdminAsync(RegisterPlatformAdminDto registerPlatformAdminDto);

    Task<Organization> CreateOrganizationAsync(CreateOrganizationDto createOrganizationDto);

    Task<User> CreateOrgAdminAsync(CreateOrgAdminDto createOrgAdminDto);

    Task<User> CreateUserWithRoleAsync(
    Guid organizationId,
    Guid currentUserId,
    UserRole currentUserRole,
    CreateUserWithRoleDto dto);

    Task<string> LoginAsync(string email, string password);
    Task<string> SwitchOrganizationAsync(Guid userId, Guid organizationId);

    string GenerateJwtToken(
        User user,
        Guid? organizationId,
        IEnumerable<string>? roles = null);

    Task SetDefaultOrganizationAsync(Guid userId, Guid organizationId);
}