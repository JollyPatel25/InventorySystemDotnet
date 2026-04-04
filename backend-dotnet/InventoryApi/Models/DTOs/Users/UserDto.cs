using InventoryApi.Models.Enums;

namespace InventoryApi.Models.DTOs.Users;

public class UserListItemDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
}

public class AssignWarehouseDto
{
    public Guid UserId { get; set; }
    public Guid WarehouseId { get; set; }
    public WarehouseAccessLevel AccessLevel { get; set; }
}

public class UserWarehouseAssignmentResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string WarehouseCode { get; set; } = string.Empty;
    public WarehouseAccessLevel AccessLevel { get; set; }
    public bool IsActive { get; set; }
}