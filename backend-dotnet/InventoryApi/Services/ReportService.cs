using InventoryApi.Data;
using InventoryApi.Models.DTOs.Reports;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ReportService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ---------------- DASHBOARD ----------------

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var orgId = _currentUser.OrganizationId
            ?? throw new UnauthorizedAccessException("Organization not found.");

        var today = DateTime.UtcNow.Date;

        var totalProducts = await _context.Products
            .CountAsync(p => p.OrganizationId == orgId);

        var totalWarehouses = await _context.Warehouses
            .CountAsync(w => w.OrganizationId == orgId);

        var lowStockCount = await _context.Inventories
            .Where(i => i.Product.OrganizationId == orgId)
            .CountAsync(i =>
                i.Product.OrganizationId == orgId &&
                i.Quantity <= i.LowStockThreshold);

        var salesToday = await _context.Sales
            .CountAsync(s =>
                s.OrganizationId == orgId &&
                s.CreatedAt.Date == today);

        var revenueToday = await _context.Sales
            .Where(s =>
                s.OrganizationId == orgId &&
                s.CreatedAt.Date == today)
            .SumAsync(s => (decimal?)s.TotalAmount) ?? 0;

        return new DashboardDto
        {
            TotalProducts = totalProducts,
            TotalWarehouses = totalWarehouses,
            LowStockCount = lowStockCount,
            SalesToday = salesToday,
            RevenueToday = revenueToday
        };
    }

    // ---------------- SALES TODAY ----------------

    public async Task<IEnumerable<object>> GetSalesTodayAsync()
    {
        var orgId = _currentUser.OrganizationId.Value;
        var today = DateTime.UtcNow.Date;

        return await _context.Sales
            .Where(s =>
                s.OrganizationId == orgId &&
                s.CreatedAt.Date == today)
            .Select(s => new
            {
                s.InvoiceNumber,
                s.TotalAmount,
                s.CreatedAt
            })
            .ToListAsync();
    }

    // ---------------- MONTHLY REVENUE ----------------

    public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync()
    {
        var orgId = _currentUser.OrganizationId.Value;

        return await _context.Sales
            .Where(s => s.OrganizationId == orgId)
            .GroupBy(s => s.CreatedAt.Month)
            .Select(g => new MonthlyRevenueDto
            {
                Month = g.Key,
                Revenue = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();
    }

    // ---------------- TOP PRODUCTS ----------------

    public async Task<IEnumerable<TopProductDto>> GetTopProductsAsync()
    {
        var orgId = _currentUser.OrganizationId.Value;

        return await _context.SaleItems
            .Where(si => si.Product.OrganizationId == orgId)
            .Where(si => si.Product.OrganizationId == orgId)
            .GroupBy(si => new { si.ProductId, si.Product.Name })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                QuantitySold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(5)
            .ToListAsync();
    }
}