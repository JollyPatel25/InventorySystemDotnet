using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);

    Task<IEnumerable<Product>> GetByOrganizationAsync(Guid organizationId);

    Task<bool> ExistsBySkuAsync(Guid organizationId, string sku);

    Task AddAsync(Product product);

    void Update(Product product);

    Task SaveChangesAsync();

    Task<IEnumerable<Product>> GetAllAsync();
}