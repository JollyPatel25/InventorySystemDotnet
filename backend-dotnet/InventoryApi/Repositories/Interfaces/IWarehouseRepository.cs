using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface IWarehouseRepository
{
    Task AddAsync(Warehouse warehouse);

    void Update(Warehouse warehouse);

    Task<Warehouse?> GetByIdAsync(Guid id);

    Task<IEnumerable<Warehouse>> GetByOrganizationAsync(Guid organizationId);

    Task<bool> ExistsByCodeAsync(Guid organizationId, string code);

    Task SaveChangesAsync();
}