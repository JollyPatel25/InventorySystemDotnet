using InventoryApi.Models.DTOs.Sales;
using InventoryApi.Models.Enums;
using System.ComponentModel.DataAnnotations;

public class CreateSaleDto
{
    [Required]
    public Guid WarehouseId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<SaleItemDto> Items { get; set; } = new();

    [Range(0, double.MaxValue)]
    public decimal DiscountAmount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal TaxAmount { get; set; } // ✅ ADDED

    [Required]
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
}