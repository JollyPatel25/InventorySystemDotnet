using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;

namespace InventoryApi.Repositories;

public class SaleItemRepository : ISaleItemRepository
{
    private readonly ApplicationDbContext _context;

    public SaleItemRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddRangeAsync(IEnumerable<SaleItem> saleItems)
    {
        await _context.SaleItems.AddRangeAsync(saleItems);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}