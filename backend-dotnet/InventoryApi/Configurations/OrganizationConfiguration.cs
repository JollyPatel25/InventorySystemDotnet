using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace InventoryApi.Data.Configurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("Organizations");

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.ContactEmail)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(o => o.ContactEmail)
            .IsUnique();

        builder.OwnsOne(o => o.Address, a =>
        {
            a.Property(x => x.Line1).HasMaxLength(200).IsRequired();
            a.Property(x => x.Line2).HasMaxLength(200);

            a.Property(x => x.City).HasMaxLength(100).IsRequired();
            a.Property(x => x.State).HasMaxLength(100).IsRequired();

            a.Property(x => x.Country).HasMaxLength(100).IsRequired();

            a.Property(x => x.PostalCode).HasMaxLength(20).IsRequired();
        });

        builder.HasIndex(o => o.RegistrationNumber)
            .IsUnique();

        builder.HasMany(o => o.UserOrganizations)
            .WithOne(uo => uo.Organization)
            .HasForeignKey(uo => uo.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Warehouses)
            .WithOne(w => w.Organization)
            .HasForeignKey(w => w.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.TaxIdentificationNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(o => o.TaxIdentificationNumber)
            .IsUnique();

        builder.Property(o => o.ContactEmail)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(o => o.ContactPhone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(o => o.PlanType)
       .HasConversion<string>()
       .IsRequired(); // ✅ FIX

        builder.Property(o => o.SubscriptionEndDate)
            .IsRequired();
    }

}