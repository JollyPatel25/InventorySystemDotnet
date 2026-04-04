using InventoryApi.Models.DTOs.Tax;

namespace InventoryApi.Services.Interfaces;

public interface ITaxService
{
    Task<IEnumerable<TaxConfigurationResponseDto>> GetAllAsync();
    Task<TaxConfigurationResponseDto> CreateAsync(CreateTaxConfigurationDto dto);
    Task DeactivateAsync(Guid id);
}