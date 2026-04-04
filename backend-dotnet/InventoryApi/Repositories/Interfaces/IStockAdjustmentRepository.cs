using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface IStockAdjustmentRepository
{
    Task AddAsync(StockAdjustment adjustment);

    Task<IEnumerable<StockAdjustment>> GetByInventoryAsync(Guid inventoryId);

    Task SaveChangesAsync();
}