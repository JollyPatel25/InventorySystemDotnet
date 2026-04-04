using InventoryApi.Models.DTOs.Common;

namespace InventoryApi.Models.DTOs.Warehouse
{
    public class UpdateWarehouseDto
    {
        public string Name { get; set; } = string.Empty;

        public string? Location { get; set; }

        public AddressDto? Address { get; set; }

        public bool? IsActive { get; set; }
    }
}
