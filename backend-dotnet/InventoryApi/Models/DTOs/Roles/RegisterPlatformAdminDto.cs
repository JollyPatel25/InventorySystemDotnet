using System.ComponentModel.DataAnnotations;
using InventoryApi.Models.DTOs.Common;

public class RegisterPlatformAdminDto
{
    [Required, EmailAddress]
    public string Email { get; set; }

    [Required, MinLength(8)]
    public string Password { get; set; }

    [Required]
    public string FirstName { get; set; }

    [Required]
    public string LastName { get; set; }

    [Required]
    public string ContactNumber { get; set; }

    [Required]
    public AddressDto Address { get; set; }
}