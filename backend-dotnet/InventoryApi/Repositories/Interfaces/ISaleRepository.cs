using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface ISaleRepository
{
    Task AddAsync(Sale sale);

    Task<Sale?> GetByIdAsync(Guid id);

    Task<IEnumerable<Sale>> GetByWarehouseAsync(Guid warehouseId);

    Task<string?> GetLatestInvoiceAsync(int year);

    Task SaveChangesAsync();
}