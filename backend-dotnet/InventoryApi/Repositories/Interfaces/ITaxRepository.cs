using InventoryApi.Models.Entities;

namespace InventoryApi.Repositories.Interfaces;

public interface ITaxRepository
{
    Task<IEnumerable<TaxConfiguration>> GetByOrganizationAsync(Guid organizationId);
    Task<TaxConfiguration?> GetByIdAsync(Guid id);
    Task AddAsync(TaxConfiguration tax);
    void Update(TaxConfiguration tax);
    Task SaveChangesAsync();
}