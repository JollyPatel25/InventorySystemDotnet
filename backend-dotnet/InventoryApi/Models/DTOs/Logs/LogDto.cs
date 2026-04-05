namespace InventoryApi.Models.DTOs.Logs;

public class ApplicationLogDto
{
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Exception { get; set; }
    public Guid? UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public string? IpAddress { get; set; }
}

public class LogQueryDto
{
    public string? Level { get; set; }
    public string? Search { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class PagedLogsDto
{
    public IEnumerable<ApplicationLogDto> Items { get; set; } = new List<ApplicationLogDto>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}