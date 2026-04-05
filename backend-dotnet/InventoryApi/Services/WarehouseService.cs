using InventoryApi.Models.DTOs.Common;
using InventoryApi.Models.DTOs.Warehouse;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;

namespace InventoryApi.Services;

public class WarehouseService : IWarehouseService
{
    private readonly IWarehouseRepository _repository;
    private readonly ICurrentUserService _currentUser;

    public WarehouseService(
        IWarehouseRepository repository,
        ICurrentUserService currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    // ---------------- CREATE ----------------
    public async Task<WarehouseResponseDto> CreateAsync(CreateWarehouseDto dto)
    {

        var orgId = SecurityHelper.GetOrgId(_currentUser);

        EnsureCanModify();

        if (await _repository.ExistsByCodeAsync(orgId, dto.Code))
            throw new Exception("Warehouse code already exists.");


        var warehouse = new Warehouse
        {
            OrganizationId = orgId,
            Name = dto.Name,
            Code = dto.Code,
            Location = dto.Location ?? "",
            Address = new Address
            {
                Line1 = dto.Address.Line1,
                Line2 = dto.Address.Line2,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                PostalCode = dto.Address.PostalCode
            },
            IsActive = true
        };

        await _repository.AddAsync(warehouse);
        await _repository.SaveChangesAsync();

        return Map(warehouse);
    }

    public async Task<WarehouseResponseDto> UpdateAsync(Guid id, UpdateWarehouseDto dto)
    {
        EnsureCanModify();

        var warehouse = await GetAndValidate(id);

        // ✅ Update only if provided
        if (dto.Name != null)
            warehouse.Name = dto.Name;

        if (dto.Location != null)
            warehouse.Location = dto.Location;

        if (dto.IsActive.HasValue)
            warehouse.IsActive = dto.IsActive.Value;

        // ✅ Address (nested partial update)
        if (dto.Address != null)
        {
            if (dto.Address.Line1 != null)
                warehouse.Address.Line1 = dto.Address.Line1;

            if (dto.Address.Line2 != null)
                warehouse.Address.Line2 = dto.Address.Line2;

            if (dto.Address.City != null)
                warehouse.Address.City = dto.Address.City;

            if (dto.Address.State != null)
                warehouse.Address.State = dto.Address.State;

            if (dto.Address.Country != null)
                warehouse.Address.Country = dto.Address.Country;

            if (dto.Address.PostalCode != null)
                warehouse.Address.PostalCode = dto.Address.PostalCode;
        }

        await _repository.SaveChangesAsync();

        return Map(warehouse);
    }

    // ---------------- GET ----------------
    public async Task<WarehouseResponseDto> GetByIdAsync(Guid id)
    {
        var warehouse = await GetAndValidate(id);
        return Map(warehouse);
    }
    public async Task<IEnumerable<WarehouseResponseDto>> GetAllAsync()
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        var warehouses = await _repository.GetByOrganizationAsync(orgId);

        return warehouses.Select(Map);
    }

    public async Task DeactivateAsync(Guid id)
    {
        EnsureAdmin();

        var warehouse = await GetAndValidate(id);

        warehouse.IsActive = false;

        _repository.Update(warehouse);
        await _repository.SaveChangesAsync();
    }


    // ---------------- DELETE ----------------
    public async Task DeleteAsync(Guid id)
    {
        EnsureAdmin();

        var warehouse = await GetAndValidate(id);

        warehouse.IsDeleted = true;
        warehouse.IsActive = false;

        _repository.Update(warehouse);
        await _repository.SaveChangesAsync();
    }


    // ---------------- REACTIVATE ----------------

    public async Task ReactivateAsync(Guid id)
    {
        EnsureAdmin();

        var warehouse = await _repository.GetByIdAsync(id)
                        ?? throw new Exception("Warehouse not found.");

        if (!_currentUser.OrganizationId.HasValue)
            throw new UnauthorizedAccessException("Organization not found.");

        SecurityHelper.ValidateSameOrg(
            warehouse.OrganizationId,
            _currentUser.OrganizationId.Value
        );

        if (warehouse.IsDeleted)
            throw new Exception("Cannot reactivate a deleted warehouse.");

        if (warehouse.IsActive)
            throw new Exception("Warehouse is already active.");

        warehouse.IsActive = true;
        warehouse.UpdatedAt = DateTime.UtcNow;

        _repository.Update(warehouse);
        await _repository.SaveChangesAsync();
    }
    // ---------------- HELPERS ----------------

    private void EnsureAdmin()
    {
        if (_currentUser.IsPlatformAdmin)
            return;

        if (!_currentUser.Roles.Contains("Admin"))
            throw new UnauthorizedAccessException("Only Admin allowed.");
    }

    private void EnsureCanModify()
    {
        if (_currentUser.IsPlatformAdmin)
            return;

        if (!_currentUser.Roles.Contains("Admin") &&
            !_currentUser.Roles.Contains("Manager"))
            throw new UnauthorizedAccessException("Only Admin or Manager allowed.");
    }

    private async Task<Warehouse> GetAndValidate(Guid id)
    {
        var warehouse = await _repository.GetByIdAsync(id)
                      ?? throw new Exception("Warehouse not found.");

        // ❌ REMOVE platform admin bypass

        if (!_currentUser.OrganizationId.HasValue)
            throw new UnauthorizedAccessException("Organization not found.");

        SecurityHelper.ValidateSameOrg(
            warehouse.OrganizationId,
            _currentUser.OrganizationId.Value
        );

        return warehouse;
    }

    private static WarehouseResponseDto Map(Warehouse w)
    {
        return new WarehouseResponseDto
        {
            Id = w.Id,
            Name = w.Name,
            Code = w.Code,
            Location = w.Location,
            Address = new AddressDto
            {
                Line1 = w.Address.Line1,
                Line2 = w.Address.Line2,
                City = w.Address.City,
                State = w.Address.State,
                Country = w.Address.Country,
                PostalCode = w.Address.PostalCode
            },
            IsActive = w.IsActive
        };
    }
}