using Serilog.Context;

namespace InventoryApi.Middleware;

public class SerilogContextMiddleware
{
    private readonly RequestDelegate _next;

    public SerilogContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var userIdClaim = context.User?.FindFirst("UserId")?.Value;
        var orgIdClaim = context.User?.FindFirst("OrganizationId")?.Value;

        Guid.TryParse(userIdClaim, out var userId);
        Guid.TryParse(orgIdClaim, out var organizationId);

        using (LogContext.PushProperty("UserId", userId))
        using (LogContext.PushProperty("OrganizationId", organizationId))
        using (LogContext.PushProperty("RequestPath", context.Request.Path.ToString()))
        using (LogContext.PushProperty("RequestMethod", context.Request.Method))
        using (LogContext.PushProperty("IPAddress", context.Connection.RemoteIpAddress?.ToString()))
        {
            await _next(context);
        }
    }
}