using InventoryApi.Models.DTOs.Warehouse;

namespace InventoryApi.Services.Interfaces;

public interface IWarehouseService
{
    Task<WarehouseResponseDto> CreateAsync(CreateWarehouseDto dto);

    Task<WarehouseResponseDto> UpdateAsync(Guid id, UpdateWarehouseDto dto);

    Task<WarehouseResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<WarehouseResponseDto>> GetAllAsync();

    Task DeleteAsync(Guid id);
}