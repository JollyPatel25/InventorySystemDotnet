using System.ComponentModel.DataAnnotations;

public class InitializeInventoryDto
{
    [Required]
    public Guid ProductId { get; set; }

    [Required]
    public Guid WarehouseId { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Initial quantity must be >= 0")]
    public int InitialQuantity { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Low stock threshold must be >= 0")]
    public int LowStockThreshold { get; set; }
}