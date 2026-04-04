namespace InventoryApi.Models.DTOs.Inventory
{
    public class InventoryResponseDto
    {
        public Guid InventoryId { get; set; }

        public Guid ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string SKU { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public int LowStockThreshold { get; set; }

        // 🔥 Optional but useful
        public bool IsLowStock => Quantity <= LowStockThreshold;
    }
}
