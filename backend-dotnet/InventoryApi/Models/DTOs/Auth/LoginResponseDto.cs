using InventoryApi.Models.DTOs.Organization;

namespace InventoryApi.Models.DTOs.Auth
{
    public class LoginResponseDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; }

        public List<UserDefaultOrganizationDto> Organizations { get; set; } = new();
    }
}
