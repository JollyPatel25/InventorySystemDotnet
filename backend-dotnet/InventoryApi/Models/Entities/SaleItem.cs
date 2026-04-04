namespace InventoryApi.Models.Entities;
public class SaleItem : BaseEntity
{
    // Foreign Keys
    public required Guid SaleId { get; set; }
    public required Guid ProductId { get; set; }

    // Quantity sold
    public required int Quantity { get; set; }

    // Price snapshot at time of sale
    public required decimal UnitPrice { get; set; }

    public required decimal TotalPrice { get; set; }

    // Navigation
    public Sale Sale { get; set; } = null!;
    public Product Product { get; set; } = null!;
}