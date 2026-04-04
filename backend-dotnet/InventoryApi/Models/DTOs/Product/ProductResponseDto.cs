namespace InventoryApi.Models.DTOs.Product
{
    public class ProductResponseDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string SKU { get; set; }

        public string Category { get; set; }

        public decimal Price { get; set; }

        public string? Barcode { get; set; }

        public string? Description { get; set; }

        public string UnitOfMeasure { get; set; }

        public bool IsActive { get; set; }
    }
}