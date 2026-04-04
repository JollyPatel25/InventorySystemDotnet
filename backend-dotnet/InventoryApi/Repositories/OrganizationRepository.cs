using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly ApplicationDbContext _context;

        public OrganizationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Organization?> GetByIdAsync(Guid id)
        {
            return await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
        }

        public async Task<IEnumerable<Organization>> GetAllAsync()
        {
            return await _context.Organizations
                .Where(o => !o.IsDeleted)
                .ToListAsync();
        }

        public async Task UpdateAsync(Organization organization)
        {
            _context.Organizations.Update(organization);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
