using InventoryApi.Data;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly ApplicationDbContext _context;

    public SaleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Sale sale)
    {
        await _context.Sales.AddAsync(sale);
    }

    public async Task<Sale?> GetByIdAsync(Guid id)
    {
        return await _context.Sales
            .Include(s => s.SaleItems)
                .ThenInclude(i => i.Product)  // ← add this
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<Sale>> GetByWarehouseAsync(Guid warehouseId)
    {
        return await _context.Sales
            .Where(s => s.WarehouseId == warehouseId)
            .Include(s => s.SaleItems)
                .ThenInclude(i => i.Product)  // ← add this
            .ToListAsync();
    }

    public async Task<string?> GetLatestInvoiceAsync(int year)
    {
        var prefix = $"INV-{year}-";

        return await _context.Sales
            .Where(s => s.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(s => s.InvoiceNumber)
            .Select(s => s.InvoiceNumber)
            .FirstOrDefaultAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}