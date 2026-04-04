using InventoryApi.Models.DTOs.Inventory;

namespace InventoryApi.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<IEnumerable<InventoryResponseDto>> GetByWarehouseAsync(Guid warehouseId);

        Task<InventoryResponseDto> UpdateStockAsync(UpdateStockDto dto);

        Task<IEnumerable<InventoryResponseDto>> GetLowStockAsync(Guid warehouseId);

        Task InitializeAsync(InitializeInventoryDto dto);
    }
}
