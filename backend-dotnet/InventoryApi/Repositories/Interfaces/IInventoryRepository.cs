using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface IInventoryRepository
{
    Task<Inventory?> GetByIdAsync(Guid id);

    Task<Inventory?> GetByProductAndWarehouseAsync(Guid productId, Guid warehouseId);

    Task<IEnumerable<Inventory>> GetByWarehouseAsync(Guid warehouseId);

    Task AddAsync(Inventory inventory);

    void Update(Inventory inventory);

    Task SaveChangesAsync();
}