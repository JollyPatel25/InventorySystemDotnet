using InventoryApi.Models.Entities;
using InventoryApi.Models.Enums;
public class Organization : BaseEntity
{
    public required string Name { get; set; }
    public required string RegistrationNumber { get; set; }
    public required string TaxIdentificationNumber { get; set; }

    public required Address Address { get; set; }

    public required string ContactEmail { get; set; }
    public required string ContactPhone { get; set; }

    public required bool IsActive { get; set; }

    public required DateTime SubscriptionEndDate { get; set; }

    public required PlanType PlanType { get; set; }

    public ICollection<UserOrganization> UserOrganizations { get; set; } = new List<UserOrganization>();
    public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}