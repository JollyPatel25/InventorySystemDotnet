using InventoryApi.Services.Interfaces;

public static class SecurityHelper
{
    public static Guid GetOrgId(ICurrentUserService user)
    {
        if (!user.OrganizationId.HasValue)
            throw new UnauthorizedAccessException("Organization not found");

        return user.OrganizationId.Value;
    }

    public static void ValidateSameOrg(Guid entityOrgId, Guid userOrgId)
    {
        if (entityOrgId != userOrgId)
            throw new UnauthorizedAccessException("Cross-tenant access denied");
    }
}