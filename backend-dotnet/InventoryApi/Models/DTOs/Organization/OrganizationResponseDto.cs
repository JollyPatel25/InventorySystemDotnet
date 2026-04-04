namespace InventoryApi.Models.DTOs.Organization
{
    public class OrganizationResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public bool IsActive { get; set; }
    }
}
