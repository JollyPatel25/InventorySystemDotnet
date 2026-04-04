namespace InventoryApi.Repositories.Interfaces
{
    public interface IOrganizationRepository
    {
        Task<Organization?> GetByIdAsync(Guid id);

        Task<IEnumerable<Organization>> GetAllAsync();

        Task UpdateAsync(Organization organization);

        Task SaveChangesAsync();
    }
}
