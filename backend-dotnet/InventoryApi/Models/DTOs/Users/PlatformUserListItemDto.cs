namespace InventoryApi.Models.DTOs.Users;

public class PlatformUserListItemDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsPlatformAdmin { get; set; }
    public List<UserOrgRoleDto> Organizations { get; set; } = new();
}

public class UserOrgRoleDto
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}