using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class PredictionConfiguration : IEntityTypeConfiguration<Prediction>
{
    public void Configure(EntityTypeBuilder<Prediction> builder)
    {
        builder.ToTable("Predictions");

        builder.Property(p => p.PredictedQuantity)
            .IsRequired();

        builder.Property(p => p.ConfidenceScore)
            .IsRequired();

        builder.Property(p => p.PredictionForDate)
            .IsRequired();


        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // 🚀 Optional UNIQUE (depends on your logic)
        builder.HasIndex(p => new { p.ProductId, p.WarehouseId, p.PredictionForDate, p.CreatedAt });
    
        builder.HasIndex(p => new { p.ProductId, p.WarehouseId, p.PredictionForDate });

        builder.HasOne(p => p.Product)
            .WithMany(p => p.Predictions)
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}