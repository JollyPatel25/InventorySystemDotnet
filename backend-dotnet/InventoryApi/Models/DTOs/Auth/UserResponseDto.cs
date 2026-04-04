namespace InventoryApi.Models.DTOs.Auth
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsPlatformAdmin { get; set; }
    }
}
