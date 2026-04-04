using InventoryApi.Models.DTOs.Product;

namespace InventoryApi.Services.Interfaces
{
    public interface IProductService
    {
        Task<ProductResponseDto> CreateAsync(CreateProductDto dto);

        Task<ProductResponseDto> UpdateAsync(Guid id, UpdateProductDto dto);

        Task<IEnumerable<ProductResponseDto>> GetAllAsync(Guid? organizationId);

        Task<ProductResponseDto> GetByIdAsync(Guid id);

        Task DeactivateAsync(Guid id);
    }
}
