using InventoryApi.Models.Enums;

namespace InventoryApi.Models.Entities;

public class UserOrganization : BaseEntity
{
    // Foreign Keys
    public required Guid UserId { get; set; }
    public required Guid OrganizationId { get; set; }

    // Role inside this organization
    public required UserRole Role { get; set; }
    public bool IsDefault { get; set; } = false;

    public bool IsActive { get; set; } = true;

    // 🔥 Audit
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedByUserId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Organization Organization { get; set; } = null!;
}