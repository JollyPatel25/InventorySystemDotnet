namespace InventoryApi.Models.Entities;
public class Product : BaseEntity
{
    // Tenant Isolation
    public required Guid OrganizationId { get; set; }

    // Basic Info
    public required string Name { get; set; }

    // Unique per organization
    public required string SKU { get; set; }

    public required string Category { get; set; }

    public required decimal Price { get; set; }

    public required bool IsActive { get; set; }

    // Enterprise Additions
    public required string Barcode { get; set; }

    public required string Description { get; set; }

    public required string UnitOfMeasure { get; set; }

    // Prediction / Reorder
    public int? ReorderPoint { get; set; }
    public int LeadTimeDays { get; set; } = 3;

    // Navigation
    public Organization Organization { get; set; } = null!;

    public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}