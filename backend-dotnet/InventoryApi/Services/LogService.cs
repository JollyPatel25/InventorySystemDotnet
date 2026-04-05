using InventoryApi.Data;
using InventoryApi.Models.DTOs.Logs;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class LogService : ILogService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public LogService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PagedLogsDto> GetLogsAsync(LogQueryDto query)
    {
        if (!_currentUser.IsPlatformAdmin)
            throw new UnauthorizedAccessException("Only Platform Admin allowed.");

        var q = _context.ApplicationLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Level))
            q = q.Where(l => l.Level == query.Level);

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(l =>
                l.Message.Contains(query.Search) ||
                (l.RequestPath != null && l.RequestPath.Contains(query.Search)));

        if (query.From.HasValue)
            q = q.Where(l => l.Timestamp >= query.From.Value);

        if (query.To.HasValue)
            q = q.Where(l => l.Timestamp <= query.To.Value);

        var totalCount = await q.CountAsync();

        var items = await q
            .OrderByDescending(l => l.Timestamp)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(l => new ApplicationLogDto
            {
                Timestamp = l.Timestamp,
                Level = l.Level,
                Message = l.Message,
                Exception = l.Exception,
                UserId = l.UserId,
                OrganizationId = l.OrganizationId,
                RequestPath = l.RequestPath,
                RequestMethod = l.RequestMethod,
                IpAddress = l.IpAddress
            })
            .ToListAsync();

        return new PagedLogsDto
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
}