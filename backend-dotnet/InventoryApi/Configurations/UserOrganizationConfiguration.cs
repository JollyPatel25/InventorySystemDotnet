using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class UserOrganizationConfiguration : IEntityTypeConfiguration<UserOrganization>
{
    public void Configure(EntityTypeBuilder<UserOrganization> builder)
    {
        builder.ToTable("UserOrganizations");

        // 🔥 Unique per user-org
        builder.HasIndex(uo => new { uo.UserId, uo.OrganizationId })
            .IsUnique();

        builder.Property(uo => uo.Role)
            .IsRequired();

        builder.Property(uo => uo.AssignedAt)
            .IsRequired();

        // 🔥 Useful for filtering active users
        builder.HasIndex(uo => new { uo.OrganizationId, uo.IsActive });

        // Relationships
        builder.HasOne(uo => uo.User)
            .WithMany(u => u.UserOrganizations)
            .HasForeignKey(uo => uo.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(uo => uo.Organization)
            .WithMany(o => o.UserOrganizations)
            .HasForeignKey(uo => uo.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(uo => new { uo.UserId, uo.IsDefault })
            .HasFilter("\"IsDefault\" = true")
            .IsUnique();
    }
}