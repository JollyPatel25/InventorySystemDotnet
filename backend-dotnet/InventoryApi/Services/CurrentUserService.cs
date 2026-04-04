using InventoryApi.Services.Interfaces;
using System.Security.Claims;

namespace InventoryApi.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User =>
        _httpContextAccessor.HttpContext?.User;

    public Guid UserId
    {
        get
        {
            var claim = User?.FindFirst("UserId")?.Value;

            if (claim == null)
                throw new UnauthorizedAccessException("UserId claim missing.");

            return Guid.Parse(claim);
        }
    }

    public Guid? OrganizationId
    {
        get
        {
            var claim = User?.FindFirst("OrganizationId")?.Value;

            if (string.IsNullOrWhiteSpace(claim))
                return null;

            return Guid.Parse(claim);
        }
    }

    public bool IsPlatformAdmin
    {
        get
        {
            var claim = User?.FindFirst("PlatformAdmin")?.Value;

            return claim == "True";
        }
    }

    public IEnumerable<string> Roles
    {
        get
        {
            return User?.FindAll(ClaimTypes.Role)
                        .Select(r => r.Value)
                   ?? Enumerable.Empty<string>();
        }
    }
}