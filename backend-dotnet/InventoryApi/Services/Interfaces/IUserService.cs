using InventoryApi.Models.DTOs.Users;

namespace InventoryApi.Services.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserListItemDto>> GetOrgUsersAsync();
    Task<UserWarehouseAssignmentResponseDto> AssignWarehouseAsync(AssignWarehouseDto dto);
    Task RemoveWarehouseAssignmentAsync(Guid assignmentId);
    Task<IEnumerable<UserWarehouseAssignmentResponseDto>> GetUserWarehouseAssignmentsAsync(Guid userId);
}