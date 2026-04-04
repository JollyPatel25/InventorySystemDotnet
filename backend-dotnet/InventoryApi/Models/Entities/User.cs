using InventoryApi.Models.Entities;

public class User : BaseEntity
{
    // Identity
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }

    // Personal Info
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string ContactNumber { get; set; }

    public required Address Address { get; set; }

    // Platform-Level Control
    public bool IsPlatformAdmin { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // 🔥 Security / Audit
    public DateTime? LastLoginAt { get; set; }

    // Navigation
    public ICollection<UserOrganization> UserOrganizations { get; set; } = new List<UserOrganization>();
    public ICollection<UserWarehouseAssignment> UserWarehouseAssignments { get; set; } = new List<UserWarehouseAssignment>();
}