using InventoryApi.Models.DTOs.Common;
namespace InventoryApi.Models.DTOs.Roles;

public class CreateOrgAdminDto
{
        public Guid OrganizationId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

        public string ContactNumber { get; set; } = string.Empty;
        public AddressDto Address { get; set; } = new AddressDto();   
}