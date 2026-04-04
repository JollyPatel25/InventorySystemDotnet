using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class UserWarehouseAssignmentConfiguration
    : IEntityTypeConfiguration<UserWarehouseAssignment>
{
    public void Configure(EntityTypeBuilder<UserWarehouseAssignment> builder)
    {
        builder.ToTable("UserWarehouseAssignments");

        // Unique constraint
        builder.HasIndex(x => new { x.UserId, x.WarehouseId })
            .IsUnique();

        builder.Property(x => x.AccessLevel)
            .IsRequired();

        builder.Property(x => x.AssignedAt)
            .IsRequired();

        // 🔥 Helpful index for queries
        builder.HasIndex(x => new { x.WarehouseId, x.IsActive });

        // Relationships
        builder.HasOne(x => x.User)
            .WithMany(u => u.UserWarehouseAssignments)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Warehouse)
            .WithMany(w => w.UserWarehouseAssignments)
            .HasForeignKey(x => x.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}