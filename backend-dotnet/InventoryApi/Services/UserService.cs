using InventoryApi.Data;
using InventoryApi.Models.DTOs.Users;
using InventoryApi.Models.Entities;
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

    // ---------------- HELPERS ----------------
    private void EnsureAdmin()
    {
        if (_currentUser.IsPlatformAdmin) return;
        if (!_currentUser.Roles.Contains("Admin"))
            throw new UnauthorizedAccessException("Only Admin allowed.");
    }
}