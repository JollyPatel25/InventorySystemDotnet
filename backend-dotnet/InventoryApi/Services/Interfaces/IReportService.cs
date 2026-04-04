using InventoryApi.Models.DTOs.Reports;

namespace InventoryApi.Services.Interfaces;

public interface IReportService
{
    Task<DashboardDto> GetDashboardAsync();

    Task<IEnumerable<object>> GetSalesTodayAsync();

    Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync();

    Task<IEnumerable<TopProductDto>> GetTopProductsAsync();
}