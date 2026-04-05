using InventoryApi.Models.DTOs.Product;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;

namespace InventoryApi.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly ICurrentUserService _currentUser;

        public ProductService(
            IProductRepository repository,
            ICurrentUserService currentUser)
        {
            _repository = repository;
            _currentUser = currentUser;
        }

        // ---------------- CREATE ----------------
        public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
        { 

            var organizationId = SecurityHelper.GetOrgId(_currentUser);

            EnsureCanModify();

            if (await _repository.ExistsBySkuAsync(organizationId, dto.SKU))
                throw new Exception("SKU already exists in this organization.");

            var product = new Product
            {
                OrganizationId = organizationId,
                Name = dto.Name,
                SKU = dto.SKU,
                Category = dto.Category,
                Price = dto.Price,
                Barcode = dto.Barcode,
                Description = dto.Description,
                UnitOfMeasure = dto.UnitOfMeasure,
                IsActive = true
            };

            await _repository.AddAsync(product);
            await _repository.SaveChangesAsync();

            return Map(product);
        }

        // ---------------- UPDATE ----------------
        public async Task<ProductResponseDto> UpdateAsync(Guid id, UpdateProductDto dto)
        {
            var organizationId = SecurityHelper.GetOrgId(_currentUser);

            EnsureCanModify();

            var product = await GetAndValidateProduct(id);

            if (product.IsDeleted)
                throw new Exception("Cannot update a deleted product.");

            if (dto.Name != null)
                product.Name = dto.Name;

            if (dto.Category != null)
                product.Category = dto.Category;

            if (dto.Price.HasValue)
                product.Price = dto.Price.Value;

            if (dto.Barcode != null)
                product.Barcode = dto.Barcode;

            if (dto.Description != null)
                product.Description = dto.Description;

            if (dto.UnitOfMeasure != null)
                product.UnitOfMeasure = dto.UnitOfMeasure;

            if (dto.IsActive.HasValue)
                product.IsActive = dto.IsActive.Value;

            await _repository.SaveChangesAsync();

            return Map(product);
        }


        // ---------------- GET ALL ----------------
        public async Task<IEnumerable<ProductResponseDto>> GetAllAsync(Guid? organizationId)
        {
            var orgId = SecurityHelper.GetOrgId(_currentUser);

            var products = await _repository.GetByOrganizationAsync(orgId);

            return products.Select(Map);
        }

        // ---------------- GET BY ID ----------------
        public async Task<ProductResponseDto> GetByIdAsync(Guid id)
        {
            var product = await GetAndValidateProduct(id);
            return Map(product);
        }

        // ---------------- DELETE (Soft) ----------------
        public async Task DeactivateAsync(Guid id)
        {
            // ✅ Only Admin (and Platform Admin)
            if (!_currentUser.IsPlatformAdmin &&
                !_currentUser.Roles.Contains("Admin"))
                throw new UnauthorizedAccessException("Only Admin can delete.");

            var product = await GetAndValidateProduct(id);

            //product.IsDeleted = true;
            product.IsActive = false;

            _repository.Update(product);
            await _repository.SaveChangesAsync();
        }

        // ---------------- PRIVATE HELPERS ----------------

        private void EnsureCanModify()
        {
            if (_currentUser.IsPlatformAdmin)
                return;

            if (!_currentUser.Roles.Contains("Admin") &&
                !_currentUser.Roles.Contains("Manager"))
                throw new UnauthorizedAccessException("Insufficient permissions.");
        }

        private async Task<Product> GetAndValidateProduct(Guid id)
        {
            var product = await _repository.GetByIdAsync(id)
                          ?? throw new Exception("Product not found.");

            // ❌ REMOVE this
            // if (_currentUser.IsPlatformAdmin)
            //     return product;

            if (!_currentUser.OrganizationId.HasValue)
                throw new UnauthorizedAccessException("Organization not found.");

            SecurityHelper.ValidateSameOrg(
                product.OrganizationId,
                _currentUser.OrganizationId.Value
            );

            return product;
        }

        private static ProductResponseDto Map(Product p)
        {
            return new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Category = p.Category,
                Price = p.Price,
                Barcode = p.Barcode,
                Description = p.Description,
                UnitOfMeasure = p.UnitOfMeasure,
                IsActive = p.IsActive
            };
        }
    }
}
