using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("Inventories");

        builder.Property(i => i.Quantity)
            .IsRequired();

        builder.Property(i => i.LowStockThreshold)
            .IsRequired();

        // Unique per warehouse per product
        builder.HasIndex(i => new { i.ProductId, i.WarehouseId })
            .IsUnique();

        builder.HasOne(i => i.Product)
            .WithMany(p => p.Inventories)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Warehouse)
            .WithMany(w => w.Inventories)
            .HasForeignKey(i => i.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}