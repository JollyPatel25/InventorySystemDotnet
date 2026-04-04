using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories;

public class TaxRepository : ITaxRepository
{
    private readonly ApplicationDbContext _context;

    public TaxRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TaxConfiguration>> GetByOrganizationAsync(Guid organizationId)
    {
        return await _context.TaxConfigurations
            .Where(t => t.OrganizationId == organizationId && !t.IsDeleted)
            .ToListAsync();
    }

    public async Task<TaxConfiguration?> GetByIdAsync(Guid id)
    {
        return await _context.TaxConfigurations
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
    }

    public async Task AddAsync(TaxConfiguration tax)
    {
        await _context.TaxConfigurations.AddAsync(tax);
    }

    public void Update(TaxConfiguration tax)
    {
        _context.TaxConfigurations.Update(tax);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}