using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories;

public class WarehouseRepository : IWarehouseRepository
{
    private readonly ApplicationDbContext _context;

    public WarehouseRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Warehouse warehouse)
    {
        await _context.Warehouses.AddAsync(warehouse);
    }

    public void Update(Warehouse warehouse)
    {
        _context.Warehouses.Update(warehouse);
    }

    public async Task<Warehouse?> GetByIdAsync(Guid id)
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<IEnumerable<Warehouse>> GetByOrganizationAsync(Guid organizationId)
    {
        return await _context.Warehouses
            .Where(w => w.OrganizationId == organizationId)
            .ToListAsync();
    }

    public async Task<bool> ExistsByCodeAsync(Guid organizationId, string code)
    {
        return await _context.Warehouses
            .AnyAsync(w => w.OrganizationId == organizationId && w.Code == code);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}