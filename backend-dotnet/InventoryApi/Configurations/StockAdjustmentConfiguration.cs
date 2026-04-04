using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> builder)
    {
        builder.ToTable("StockAdjustments");

        // Enum (int)
        builder.Property(s => s.AdjustmentType)
            .IsRequired();

        builder.Property(s => s.QuantityChanged)
            .IsRequired();

        // 🔥 Add this (VERY IMPORTANT)
        builder.Property(s => s.NewQuantity)
            .IsRequired();

        builder.Property(s => s.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        // 🔥 Index for history lookup
        builder.HasIndex(s => s.InventoryId);

        // 🔥 Composite index (VERY IMPORTANT for real systems)
        builder.HasIndex(s => new { s.InventoryId, s.CreatedAt });

        // Relationships
        builder.HasOne(s => s.Inventory)
            .WithMany(i => i.StockAdjustments)
            .HasForeignKey(s => s.InventoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.CreatedByUser)
            .WithMany()
            .HasForeignKey(s => s.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}