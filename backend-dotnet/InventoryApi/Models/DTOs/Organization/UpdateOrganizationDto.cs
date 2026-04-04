using InventoryApi.Models.DTOs.Common;

namespace InventoryApi.Models.DTOs.Organization
{
    public class UpdateOrganizationDto
    {
        public string? Name { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }

        public AddressDto? Address { get; set; }
    }
}
