namespace InventoryApi.Models.Entities;
public class Warehouse : BaseEntity
{
    // Tenant Isolation
    public required Guid OrganizationId { get; set; }

    // Basic Info
    public required string Name { get; set; }

    // Unique per organization
    public required string Code { get; set; }

    public required string Location { get; set; }

    public required Address Address { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;

    public ICollection<UserWarehouseAssignment> UserWarehouseAssignments { get; set; } = new List<UserWarehouseAssignment>();

    public ICollection<Sale> Sales { get; set; } = new List<Sale>();

    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
}