using InventoryApi.Models.DTOs.Logs;

namespace InventoryApi.Services.Interfaces;

public interface ILogService
{
    Task<PagedLogsDto> GetLogsAsync(LogQueryDto query);
}