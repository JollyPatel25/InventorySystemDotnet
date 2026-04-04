using InventoryApi.Models.Enums;

namespace InventoryApi.Models.DTOs.Sales;

public class SaleResponseDto
{
    public string InvoiceNumber { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public PaymentMethod PaymentMethod { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<SaleItemResponseDto> Items { get; set; } = new();
}