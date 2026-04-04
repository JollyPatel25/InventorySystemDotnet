using InventoryApi.Models.DTOs.Tax;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;

namespace InventoryApi.Services;

public class TaxService : ITaxService
{
    private readonly ITaxRepository _repository;
    private readonly ICurrentUserService _currentUser;

    public TaxService(ITaxRepository repository, ICurrentUserService currentUser)
    {
        _repository = repository;
        _currentUser = currentUser;
    }

    // ---------------- GET ALL ----------------
    public async Task<IEnumerable<TaxConfigurationResponseDto>> GetAllAsync()
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        var taxes = await _repository.GetByOrganizationAsync(orgId);

        return taxes.Select(Map);
    }

    // ---------------- CREATE ----------------
    public async Task<TaxConfigurationResponseDto> CreateAsync(CreateTaxConfigurationDto dto)
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        EnsureAdmin();

        var tax = new TaxConfiguration
        {
            OrganizationId = orgId,
            TaxName = dto.TaxName.Trim(),
            TaxPercentage = dto.TaxPercentage,
            IsActive = true
        };

        await _repository.AddAsync(tax);
        await _repository.SaveChangesAsync();

        return Map(tax);
    }

    // ---------------- DEACTIVATE ----------------
    public async Task DeactivateAsync(Guid id)
    {
        EnsureAdmin();

        var orgId = SecurityHelper.GetOrgId(_currentUser);

        var tax = await _repository.GetByIdAsync(id)
                  ?? throw new Exception("Tax configuration not found.");

        SecurityHelper.ValidateSameOrg(tax.OrganizationId, orgId);

        tax.IsActive = false;
        tax.IsDeleted = true;

        _repository.Update(tax);
        await _repository.SaveChangesAsync();
    }

    // ---------------- HELPERS ----------------
    private void EnsureAdmin()
    {
        if (_currentUser.IsPlatformAdmin) return;
        if (!_currentUser.Roles.Contains("Admin"))
            throw new UnauthorizedAccessException("Only Admin allowed.");
    }

    private static TaxConfigurationResponseDto Map(TaxConfiguration t)
    {
        return new TaxConfigurationResponseDto
        {
            Id = t.Id,
            TaxName = t.TaxName,
            TaxPercentage = t.TaxPercentage,
            IsActive = t.IsActive
        };
    }
}