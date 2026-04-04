using InventoryApi.Data;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Helpers;

public class InvoiceGenerator
{
    private readonly ApplicationDbContext _context;

    public InvoiceGenerator(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateAsync()
    {
        var year = DateTime.UtcNow.Year;

        var prefix = $"INV-{year}-";

        var lastInvoice = await _context.Sales
            .Where(s => s.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(s => s.InvoiceNumber)
            .Select(s => s.InvoiceNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;

        if (lastInvoice != null)
        {
            var lastNumberPart = lastInvoice.Split('-').Last();
            nextNumber = int.Parse(lastNumberPart) + 1;
        }

        return $"{prefix}{nextNumber.ToString("D5")}";
    }
}