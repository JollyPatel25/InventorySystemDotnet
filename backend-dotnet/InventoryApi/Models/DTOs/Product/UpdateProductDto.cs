using System.ComponentModel.DataAnnotations;

namespace InventoryApi.Models.DTOs.Product
{
    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? Category { get; set; }

        [Range(0, 999999)]
        public decimal? Price { get; set; }
        public string? Barcode { get; set; }
        public string? Description { get; set; }
        public string? UnitOfMeasure { get; set; }
        public bool? IsActive { get; set; }
    }
}
