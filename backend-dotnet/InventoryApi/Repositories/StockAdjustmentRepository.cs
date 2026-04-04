using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories;

public class StockAdjustmentRepository : IStockAdjustmentRepository
{
    private readonly ApplicationDbContext _context;

    public StockAdjustmentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(StockAdjustment adjustment)
    {
        await _context.StockAdjustments.AddAsync(adjustment);
    }

    public async Task<IEnumerable<StockAdjustment>> GetByInventoryAsync(Guid inventoryId)
    {
        return await _context.StockAdjustments
            .Where(s => s.InventoryId == inventoryId)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}