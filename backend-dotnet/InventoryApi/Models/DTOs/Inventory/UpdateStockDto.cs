using InventoryApi.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace InventoryApi.Models.DTOs.Inventory
{

    public class UpdateStockDto
    {
        [Required]
        public Guid ProductId { get; set; }

        [Required]
        public Guid WarehouseId { get; set; }

        [Range(-1000000, 1000000, ErrorMessage = "Quantity change is invalid")]
        public int QuantityChanged { get; set; }

        [Required]
        [MinLength(3)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public StockAdjustmentType AdjustmentType { get; set; }
    }
}
