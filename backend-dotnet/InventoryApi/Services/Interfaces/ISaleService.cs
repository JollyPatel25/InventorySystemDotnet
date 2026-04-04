using InventoryApi.Models.DTOs.Sales;

namespace InventoryApi.Services.Interfaces;

public interface ISalesService
{
    Task<SaleResponseDto> CreateSaleAsync(CreateSaleDto dto);

    Task<SaleResponseDto> GetSaleByIdAsync(Guid id);

    Task<IEnumerable<SaleResponseDto>> GetSalesByWarehouseAsync(Guid warehouseId);
}