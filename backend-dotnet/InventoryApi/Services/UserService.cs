using InventoryApi.Data;
using InventoryApi.Models.DTOs.Common;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.DTOs.Users;
using InventoryApi.Models.Entities;
using InventoryApi.Models.Enums;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UserService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ---------------- GET ORG USERS ----------------
    public async Task<IEnumerable<UserListItemDto>> GetOrgUsersAsync()
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        EnsureAdmin();

        var userOrgs = await _context.UserOrganizations
            .Include(uo => uo.User)
            .Where(uo =>
                uo.OrganizationId == orgId &&
                uo.IsActive &&
                !uo.User.IsDeleted)
            .ToListAsync();

        return userOrgs.Select(uo => new UserListItemDto
        {
            Id = uo.User.Id,
            Email = uo.User.Email,
            FirstName = uo.User.FirstName,
            LastName = uo.User.LastName,
            ContactNumber = uo.User.ContactNumber,
            Role = uo.Role,
            IsActive = uo.User.IsActive
        });
    }

    // ---------------- ASSIGN WAREHOUSE ----------------
    public async Task<UserWarehouseAssignmentResponseDto> AssignWarehouseAsync(AssignWarehouseDto dto)
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        EnsureAdmin();

        // Validate user belongs to org
        var userOrg = await _context.UserOrganizations
            .FirstOrDefaultAsync(uo =>
                uo.UserId == dto.UserId &&
                uo.OrganizationId == orgId &&
                uo.IsActive)
            ?? throw new Exception("User not found in this organization.");

        // Validate warehouse belongs to org
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w =>
                w.Id == dto.WarehouseId &&
                w.OrganizationId == orgId &&
                !w.IsDeleted)
            ?? throw new Exception("Warehouse not found.");

        // Check duplicate
        var exists = await _context.UserWarehouseAssignments
            .AnyAsync(a =>
                a.UserId == dto.UserId &&
                a.WarehouseId == dto.WarehouseId &&
                a.IsActive);

        if (exists)
            throw new Exception("User already assigned to this warehouse.");

        var assignment = new UserWarehouseAssignment
        {
            UserId = dto.UserId,
            WarehouseId = dto.WarehouseId,
            AccessLevel = dto.AccessLevel,
            IsActive = true,
            AssignedAt = DateTime.UtcNow,
            AssignedByUserId = _currentUser.UserId
        };

        await _context.UserWarehouseAssignments.AddAsync(assignment);
        await _context.SaveChangesAsync();

        return new UserWarehouseAssignmentResponseDto
        {
            Id = assignment.Id,
            UserId = assignment.UserId,
            WarehouseId = assignment.WarehouseId,
            WarehouseName = warehouse.Name,
            WarehouseCode = warehouse.Code,
            AccessLevel = assignment.AccessLevel,
            IsActive = assignment.IsActive
        };
    }

    // ---------------- REMOVE WAREHOUSE ASSIGNMENT ----------------
    public async Task RemoveWarehouseAssignmentAsync(Guid assignmentId)
    {
        EnsureAdmin();

        var assignment = await _context.UserWarehouseAssignments
            .FirstOrDefaultAsync(a => a.Id == assignmentId)
            ?? throw new Exception("Assignment not found.");

        assignment.IsActive = false;

        await _context.SaveChangesAsync();
    }

    // ---------------- GET USER WAREHOUSE ASSIGNMENTS ----------------
    public async Task<IEnumerable<UserWarehouseAssignmentResponseDto>> GetUserWarehouseAssignmentsAsync(Guid userId)
    {
        var orgId = SecurityHelper.GetOrgId(_currentUser);

        EnsureAdmin();

        var assignments = await _context.UserWarehouseAssignments
            .Include(a => a.Warehouse)
            .Where(a =>
                a.UserId == userId &&
                a.IsActive &&
                a.Warehouse.OrganizationId == orgId)
            .ToListAsync();

        return assignments.Select(a => new UserWarehouseAssignmentResponseDto
        {
            Id = a.Id,
            UserId = a.UserId,
            WarehouseId = a.WarehouseId,
            WarehouseName = a.Warehouse.Name,
            WarehouseCode = a.Warehouse.Code,
            AccessLevel = a.AccessLevel,
            IsActive = a.IsActive
        });
    }

    public async Task<IEnumerable<UserOrganizationDto>> GetMyOrganizationsAsync()
    {
        var userId = _currentUser.UserId;

        var userOrgs = await _context.UserOrganizations
            .Include(uo => uo.Organization)
            .Where(uo =>
                uo.UserId == userId &&
                uo.IsActive &&
                !uo.Organization.IsDeleted)
            .ToListAsync();

        return userOrgs.Select(uo => new UserOrganizationDto
        {
            OrganizationId = uo.OrganizationId,
            OrganizationName = uo.Organization.Name,
            Role = uo.Role.ToString(),
            IsDefault = uo.IsDefault,
            IsActive = uo.Organization.IsActive
        });
    }


    // ---------------- GET ALL USERS (PLATFORM ADMIN) ----------------
    public async Task<IEnumerable<PlatformUserListItemDto>> GetAllUsersAsync()
    {
        if (!_currentUser.IsPlatformAdmin)
            throw new UnauthorizedAccessException("Only Platform Admin allowed.");

        var users = await _context.Users
            .Include(u => u.UserOrganizations)
                .ThenInclude(uo => uo.Organization)
            .Where(u => !u.IsDeleted && !u.IsPlatformAdmin)
            .ToListAsync();

        return users.Select(u => new PlatformUserListItemDto
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            ContactNumber = u.ContactNumber,
            IsActive = u.IsActive,
            IsPlatformAdmin = u.IsPlatformAdmin,
            Organizations = u.UserOrganizations
                .Where(uo => uo.IsActive)
                .Select(uo => new UserOrgRoleDto
                {
                    OrganizationId = uo.OrganizationId,
                    OrganizationName = uo.Organization?.Name ?? "",
                    Role = uo.Role.ToString(),
                    IsDefault = uo.IsDefault
                }).ToList()
        });
    }

    // ---------------- DEACTIVATE USER (PLATFORM ADMIN) ----------------
    public async Task DeactivateUserAsync(Guid userId)
    {
        if (!_currentUser.IsPlatformAdmin)
            throw new UnauthorizedAccessException("Only Platform Admin allowed.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted)
            ?? throw new Exception("User not found.");

        if (user.IsPlatformAdmin)
            throw new Exception("Cannot deactivate a Platform Admin.");

        if (!user.IsActive)
            throw new Exception("User is already inactive.");

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    // ---------------- REACTIVATE USER (PLATFORM ADMIN) ----------------
    public async Task ReactivateUserAsync(Guid userId)
    {
        if (!_currentUser.IsPlatformAdmin)
            throw new UnauthorizedAccessException("Only Platform Admin allowed.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted)
            ?? throw new Exception("User not found.");

        if (user.IsActive)
            throw new Exception("User is already active.");

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }


    // ---------------- ASSIGN EXISTING USER AS ORG ADMIN ----------------
    public async Task AssignAsOrgAdminAsync(Guid userId, Guid organizationId)
    {
        if (!_currentUser.IsPlatformAdmin)
            throw new UnauthorizedAccessException("Only Platform Admin allowed.");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted)
            ?? throw new Exception("User not found.");

        var org = await _context.Organizations
            .FirstOrDefaultAsync(o => o.Id == organizationId)
            ?? throw new Exception("Organization not found.");

        var existing = await _context.UserOrganizations
            .FirstOrDefaultAsync(uo =>
                uo.UserId == userId &&
                uo.OrganizationId == organizationId &&
                uo.IsActive);

        if (existing != null)
        {
            if (existing.Role == UserRole.Admin)
                throw new Exception("User is already an Admin of this organization.");

            // Upgrade existing role to Admin
            existing.Role = UserRole.Admin;
            await _context.SaveChangesAsync();
            return;
        }

        // Not a member — add as Admin
        var hasAnyOrg = await _context.UserOrganizations
            .AnyAsync(uo => uo.UserId == userId && uo.IsActive);

        var userOrg = new UserOrganization
        {
            UserId = userId,
            OrganizationId = organizationId,
            Role = UserRole.Admin,
            IsActive = true,
            IsDefault = !hasAnyOrg,
            AssignedByUserId = _currentUser.UserId
        };

        _context.UserOrganizations.Add(userOrg);
        await _context.SaveChangesAsync();
    }

    // ---------------- GET MY PROFILE ----------------
    public async Task<UserProfileDto> GetMyProfileAsync()
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId && !u.IsDeleted)
            ?? throw new Exception("User not found.");

        return MapProfile(user);
    }

    // ---------------- UPDATE MY PROFILE ----------------
    public async Task<UserProfileDto> UpdateMyProfileAsync(UpdateUserProfileDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId && !u.IsDeleted)
            ?? throw new Exception("User not found.");

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.ContactNumber != null) user.ContactNumber = dto.ContactNumber;

        if (dto.Address != null)
        {
            if (dto.Address.Line1 != null) user.Address.Line1 = dto.Address.Line1;
            if (dto.Address.Line2 != null) user.Address.Line2 = dto.Address.Line2;
            if (dto.Address.City != null) user.Address.City = dto.Address.City;
            if (dto.Address.State != null) user.Address.State = dto.Address.State;
            if (dto.Address.Country != null) user.Address.Country = dto.Address.Country;
            if (dto.Address.PostalCode != null) user.Address.PostalCode = dto.Address.PostalCode;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapProfile(user);
    }

    private static UserProfileDto MapProfile(User u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        FirstName = u.FirstName,
        LastName = u.LastName,
        ContactNumber = u.ContactNumber,
        IsPlatformAdmin = u.IsPlatformAdmin,
        IsActive = u.IsActive,
        Address = u.Address == null ? null : new AddressDto
        {
            Line1 = u.Address.Line1,
            Line2 = u.Address.Line2,
            City = u.Address.City,
            State = u.Address.State,
            Country = u.Address.Country,
            PostalCode = u.Address.PostalCode
        }
    };

    // ---------------- HELPERS ----------------
    private void EnsureAdmin()
    {
        if (_currentUser.IsPlatformAdmin) return;
        if (!_currentUser.Roles.Contains("Admin"))
            throw new UnauthorizedAccessException("Only Admin allowed.");
    }
}