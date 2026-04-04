namespace InventoryApi.Services.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }

    Guid? OrganizationId { get; }

    bool IsPlatformAdmin { get; }

    IEnumerable<string> Roles { get; }
}