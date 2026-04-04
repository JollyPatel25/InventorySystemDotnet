using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface ISaleItemRepository
{
    Task AddRangeAsync(IEnumerable<SaleItem> saleItems);

    Task SaveChangesAsync();
}