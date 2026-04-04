using InventoryApi.Models.Enums;

namespace InventoryApi.Models.Entities;

public class UserWarehouseAssignment : BaseEntity
{
    // Foreign Keys
    public required Guid UserId { get; set; }
    public required Guid WarehouseId { get; set; }

    // Permission Level
    public required WarehouseAccessLevel AccessLevel { get; set; }

    public bool IsActive { get; set; } = true;

    // 🔥 Audit
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedByUserId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
}