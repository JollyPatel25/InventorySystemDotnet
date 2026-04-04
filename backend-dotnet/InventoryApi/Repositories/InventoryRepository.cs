using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly ApplicationDbContext _context;

    public InventoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Inventory?> GetByIdAsync(Guid id)
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .Include(i => i.Warehouse)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Inventory?> GetByProductAndWarehouseAsync(Guid productId, Guid warehouseId)
    {
        return await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.WarehouseId == warehouseId);
    }

    public async Task<IEnumerable<Inventory>> GetByWarehouseAsync(Guid warehouseId)
    {
        return await _context.Inventories
            .Include(i => i.Product)
            .Where(i => i.WarehouseId == warehouseId)
            .ToListAsync();
    }

    public async Task AddAsync(Inventory inventory)
    {
        await _context.Inventories.AddAsync(inventory);
    }

    public void Update(Inventory inventory)
    {
        _context.Inventories.Update(inventory);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}