using InventoryApi.Models.Enums;
namespace InventoryApi.Models.Entities;
public class Sale : BaseEntity
{
    // Tenant Isolation
    public required Guid OrganizationId { get; set; }

    // Invoice Info
    public required string InvoiceNumber { get; set; }

    // Financial Breakdown
    public required decimal SubTotal { get; set; }
    public required decimal TaxAmount { get; set; }
    public required decimal DiscountAmount { get; set; }
    public required decimal TotalAmount { get; set; }

    public required PaymentMethod PaymentMethod { get; set; }

    // Foreign Keys
    public required Guid WarehouseId { get; set; }
    public required Guid CreatedByUserId { get; set; }

    // Navigation
    public Organization Organization { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;

    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}