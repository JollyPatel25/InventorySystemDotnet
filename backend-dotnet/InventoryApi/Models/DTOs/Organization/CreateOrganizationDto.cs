using System.ComponentModel.DataAnnotations;
using InventoryApi.Models.DTOs.Common;
using InventoryApi.Models.Enums;
public class CreateOrganizationDto
{
    [Required]
    public string Name { get; set; }

    [Required]
    public string RegistrationNumber { get; set; }

    [Required]
    public string TaxIdentificationNumber { get; set; }

    [Required]
    public AddressDto Address { get; set; }

    [Required, EmailAddress]
    public string ContactEmail { get; set; }

    [Required, Phone]
    public string ContactPhone { get; set; }

    [Required]
    public DateTime SubscriptionEndDate { get; set; }

    [Required]
    public PlanType PlanType { get; set; }
}