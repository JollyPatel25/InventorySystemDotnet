using InventoryApi.Models.DTOs.Common;
namespace InventoryApi.Models.DTOs.Warehouse
{
    public class CreateWarehouseDto
    {
        public string Name { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public string? Location { get; set; }

        public AddressDto? Address { get; set; } = new();
    }
}
