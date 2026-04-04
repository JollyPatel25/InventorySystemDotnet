using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.UnitOfMeasure)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Barcode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(500);

        // 🔥 Multi-tenant uniqueness
        builder.HasIndex(p => new { p.OrganizationId, p.SKU })
            .IsUnique();

        // 🔥 Barcode uniqueness (optional but recommended)
        builder.HasIndex(p => new { p.OrganizationId, p.Barcode })
            .IsUnique();

        builder.HasOne(p => p.Organization)
            .WithMany(o => o.Products)
            .HasForeignKey(p => p.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}