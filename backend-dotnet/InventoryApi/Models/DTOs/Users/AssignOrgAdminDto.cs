namespace InventoryApi.Models.DTOs.Users
{

    // Add to Models/DTOs/Users/
    public class AssignOrgAdminDto
    {
        public Guid UserId { get; set; }
        public Guid OrganizationId { get; set; }
    }

}
