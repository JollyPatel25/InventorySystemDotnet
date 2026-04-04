using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses");

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Location)
            .IsRequired()
            .HasMaxLength(200);

        // 🔥 Address (good already)
        builder.OwnsOne(w => w.Address, a =>
        {
            a.Property(x => x.Line1).HasMaxLength(200).IsRequired();
            a.Property(x => x.Line2).HasMaxLength(200).IsRequired();

            a.Property(x => x.City).HasMaxLength(100).IsRequired();
            a.Property(x => x.State).HasMaxLength(100).IsRequired();
            a.Property(x => x.Country).HasMaxLength(100).IsRequired();
            a.Property(x => x.PostalCode).HasMaxLength(20).IsRequired();
        });

        // 🔥 Multi-tenant uniqueness
        builder.HasIndex(w => new { w.OrganizationId, w.Code })
            .IsUnique();

        // 🔥 Query performance index (VERY IMPORTANT)
        builder.HasIndex(w => new { w.OrganizationId, w.IsActive });

        // Relationships
        builder.HasOne(w => w.Organization)
            .WithMany(o => o.Warehouses)
            .HasForeignKey(w => w.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.UserWarehouseAssignments)
            .WithOne(uwa => uwa.Warehouse)
            .HasForeignKey(uwa => uwa.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}