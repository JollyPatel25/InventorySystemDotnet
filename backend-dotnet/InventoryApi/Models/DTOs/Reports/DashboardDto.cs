namespace InventoryApi.Models.DTOs.Reports;

public class DashboardDto
{
    public int TotalProducts { get; set; }

    public int TotalWarehouses { get; set; }

    public int LowStockCount { get; set; }

    public int SalesToday { get; set; }

    public decimal RevenueToday { get; set; }
}