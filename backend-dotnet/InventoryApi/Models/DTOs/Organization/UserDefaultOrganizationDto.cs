using InventoryApi.Models.Enums;

namespace InventoryApi.Models.DTOs.Organization
{
    public class UserDefaultOrganizationDto
    {
        public Guid OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public UserRole Role { get; set; }
    }
}
