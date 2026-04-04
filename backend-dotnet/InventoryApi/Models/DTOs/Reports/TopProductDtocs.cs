namespace InventoryApi.Models.DTOs.Reports;

public class TopProductDto
{
    public Guid ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int QuantitySold { get; set; }
}