namespace InventoryApi.Models.DTOs.Sales;

public class SaleItemDto
{
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }
}