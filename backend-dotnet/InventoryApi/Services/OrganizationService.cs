using InventoryApi.Data;
using InventoryApi.Models.DTOs.Common;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace InventoryApi.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _repository;
        private readonly ICurrentUserService _currentUser;
        private readonly ApplicationDbContext _context;

        public OrganizationService(
            IOrganizationRepository repository,
            ICurrentUserService currentUser,
            ApplicationDbContext context)
        {
            _repository = repository;
            _currentUser = currentUser;
            _context = context;
        }

        // ---------------- GET MY ORG ----------------
        public async Task<OrganizationResponseDto> GetMyAsync()
        {
            // ✅ FIX #5: Verify calling user is active before allowing any operation
            await EnsureCurrentUserIsActiveAsync();

            if (!_currentUser.OrganizationId.HasValue)
                throw new UnauthorizedAccessException("Organization not found.");

            var org = await _repository.GetByIdAsync(_currentUser.OrganizationId.Value)
                      ?? throw new Exception("Organization not found.");

            // ✅ FIX #4: ValidateActive is now called here (was already here — keep it)
            ValidateActive(org);

            return Map(org);
        }

        // ---------------- GET ALL (PLATFORM ADMIN) ----------------
        public async Task<IEnumerable<OrganizationResponseDto>> GetAllAsync()
        {
            if (!_currentUser.IsPlatformAdmin)
                throw new UnauthorizedAccessException("Only Platform Admin allowed.");

            var orgs = await _repository.GetAllAsync();

            return orgs.Select(Map);
        }

        // ---------------- UPDATE ----------------
        public async Task<OrganizationResponseDto> UpdateAsync(UpdateOrganizationDto dto)
        {
            // ✅ FIX #5: Verify calling user is active before allowing any operation
            await EnsureCurrentUserIsActiveAsync();

            var orgId = SecurityHelper.GetOrgId(_currentUser);

            EnsureAdmin();

            var org = await _repository.GetByIdAsync(orgId)
                      ?? throw new Exception("Organization not found.");

            // ✅ FIX #4: ValidateActive is called here (was already here — keep it)
            ValidateActive(org);

            if (dto.Name != null)
                org.Name = dto.Name;

            if (dto.ContactEmail != null)
                org.ContactEmail = dto.ContactEmail;

            if (dto.ContactPhone != null)
                org.ContactPhone = dto.ContactPhone;

            if (dto.Address != null)
            {
                if (dto.Address.Line1 != null)
                    org.Address.Line1 = dto.Address.Line1;

                if (dto.Address.Line2 != null)
                    org.Address.Line2 = dto.Address.Line2;

                if (dto.Address.City != null)
                    org.Address.City = dto.Address.City;

                if (dto.Address.State != null)
                    org.Address.State = dto.Address.State;

                if (dto.Address.Country != null)
                    org.Address.Country = dto.Address.Country;

                if (dto.Address.PostalCode != null)
                    org.Address.PostalCode = dto.Address.PostalCode;
            }

            org.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(org);
            await _repository.SaveChangesAsync();

            return Map(org);
        }

        // ---------------- DEACTIVATE ----------------
        public async Task DeactivateAsync(Guid id)
        {
            if (!_currentUser.IsPlatformAdmin)
                throw new UnauthorizedAccessException("Only Platform Admin allowed.");

            var org = await _repository.GetByIdAsync(id)
                      ?? throw new Exception("Organization not found.");

            if (!org.IsActive)
                throw new Exception("Organization is already inactive.");

            org.IsActive = false;

            await _repository.UpdateAsync(org);
            await _repository.SaveChangesAsync();
        }

        // ---------------- REACTIVATE ----------------
        public async Task ReactivateAsync(Guid id)
        {
            if (!_currentUser.IsPlatformAdmin)
                throw new UnauthorizedAccessException("Only Platform Admin allowed.");

            var org = await _repository.GetByIdAsync(id)
                      ?? throw new Exception("Organization not found.");

            if (org.IsActive)
                throw new Exception("Organization is already active.");

            org.IsActive = true;

            await _repository.UpdateAsync(org);
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

        /// <summary>
        /// ✅ FIX #4: Validates the org is active and subscription has not expired.
        /// Called on every mutating AND read operation so deactivated org users are
        /// blocked at the service layer — not only inside GetMyAsync/UpdateAsync.
        /// </summary>
        private void ValidateActive(Organization org)
        {
            if (!org.IsActive)
                throw new UnauthorizedAccessException("Organization is inactive.");

            if (org.SubscriptionEndDate < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Organization subscription has expired.");
        }

        /// <summary>
        /// ✅ FIX #5: Ensures the currently authenticated user is active (not deactivated).
        /// A deactivated user whose JWT hasn't expired should not be able to perform operations.
        /// </summary>
        private async Task EnsureCurrentUserIsActiveAsync()
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId && !u.IsDeleted)
                ?? throw new UnauthorizedAccessException("User not found.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("User account is deactivated.");
        }

        private static OrganizationResponseDto Map(Organization o)
        {
            return new OrganizationResponseDto
            {
                Id = o.Id,
                Name = o.Name,
                ContactEmail = o.ContactEmail,
                ContactPhone = o.ContactPhone,
                IsActive = o.IsActive,
                SubscriptionEndDate = o.SubscriptionEndDate,
                PlanType = o.PlanType.ToString(),
                Address = new AddressDto
                {
                    Line1 = o.Address.Line1,
                    Line2 = o.Address.Line2,
                    City = o.Address.City,
                    State = o.Address.State,
                    Country = o.Address.Country,
                    PostalCode = o.Address.PostalCode
                }
            };
        }
    }
}