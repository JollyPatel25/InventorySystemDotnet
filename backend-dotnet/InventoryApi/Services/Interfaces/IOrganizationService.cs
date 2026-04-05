using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.Entities;

namespace InventoryApi.Services.Interfaces
{
    public interface IOrganizationService
    {
        Task<OrganizationResponseDto> GetMyAsync();

        Task<IEnumerable<OrganizationResponseDto>> GetAllAsync();

        Task<OrganizationResponseDto> UpdateAsync(UpdateOrganizationDto dto);

        Task DeactivateAsync(Guid id);

        Task ReactivateAsync(Guid id);
    }
}
