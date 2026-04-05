using InventoryApi.Models.DTOs.Common;

namespace InventoryApi.Models.DTOs.Users;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public bool IsPlatformAdmin { get; set; }
    public bool IsActive { get; set; }
    public AddressDto? Address { get; set; }
}

public class UpdateUserProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ContactNumber { get; set; }
    public UpdateAddressDto? Address { get; set; }
}

public class UpdateAddressDto
{
    public string? Line1 { get; set; }
    public string? Line2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
}