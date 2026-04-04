using InventoryApi.Models.DTOs.Common;
using InventoryApi.Models.Enums;

namespace InventoryApi.Models.DTOs.Roles
{
    public class CreateUserWithRoleDto
    {
        public string Email { get; set; }
        public string Password { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string ContactNumber { get; set; }
        public AddressDto Address { get; set; }

        public UserRole Role { get; set; }   // 🔥 key
    }
}
