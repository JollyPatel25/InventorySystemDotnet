using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.ToTable("Sales");

        builder.Property(s => s.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(100);


        // 🔥 Apply precision to ALL money fields
        builder.Property(s => s.SubTotal).HasPrecision(18, 2).IsRequired();
        builder.Property(s => s.TaxAmount).HasPrecision(18, 2).IsRequired();
        builder.Property(s => s.DiscountAmount).HasPrecision(18, 2).IsRequired();
        builder.Property(s => s.TotalAmount).HasPrecision(18, 2).IsRequired();

        builder.Property(s => s.PaymentMethod)
            .IsRequired()
            .HasMaxLength(50);

        // Unique invoice per organization
        builder.HasIndex(s => new { s.OrganizationId, s.InvoiceNumber })
            .IsUnique();

        builder.HasOne(s => s.Organization)
            .WithMany()
            .HasForeignKey(s => s.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
            .WithMany(w => w.Sales)
            .HasForeignKey(s => s.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.CreatedByUser)
            .WithMany()
            .HasForeignKey(s => s.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.SaleItems)
            .WithOne(si => si.Sale)
            .HasForeignKey(si => si.SaleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}