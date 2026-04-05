using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Models.Entities;

[Table("applicationlogs")]
[Keyless]
public class ApplicationLog
{
    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("level")]
    public string Level { get; set; } = string.Empty;

    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("exception")]
    public string? Exception { get; set; }

    [Column("stacktrace")]
    public string? StackTrace { get; set; }

    [Column("userid")]
    public Guid? UserId { get; set; }

    [Column("organizationid")]
    public Guid? OrganizationId { get; set; }

    [Column("requestpath")]
    public string? RequestPath { get; set; }

    [Column("requestmethod")]
    public string? RequestMethod { get; set; }

    [Column("ipaddress")]
    public string? IpAddress { get; set; }
}