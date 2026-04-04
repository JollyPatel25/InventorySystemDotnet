namespace InventoryApi.Models.DTOs.Tax;

public class TaxConfigurationResponseDto
{
    public Guid Id { get; set; }
    public string TaxName { get; set; } = string.Empty;
    public decimal TaxPercentage { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTaxConfigurationDto
{
    public required string TaxName { get; set; }
    public required decimal TaxPercentage { get; set; }
}