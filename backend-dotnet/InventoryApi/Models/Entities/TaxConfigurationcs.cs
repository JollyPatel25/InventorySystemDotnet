namespace InventoryApi.Models.Entities;

public class TaxConfiguration : BaseEntity
{
    public required Guid OrganizationId { get; set; }
    public required string TaxName { get; set; }
    public required decimal TaxPercentage { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Organization Organization { get; set; } = null!;
}