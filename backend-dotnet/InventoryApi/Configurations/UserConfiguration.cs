using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InventoryApi.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500); // 🔥 important for hashing

        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.ContactNumber)
            .IsRequired()
            .HasMaxLength(20);

        // 🔥 Address (correct)
        builder.OwnsOne(u => u.Address, a =>
        {
            a.Property(x => x.Line1).HasMaxLength(200).IsRequired();
            a.Property(x => x.Line2).HasMaxLength(200).IsRequired();

            a.Property(x => x.City).HasMaxLength(100).IsRequired();
            a.Property(x => x.State).HasMaxLength(100).IsRequired();
            a.Property(x => x.Country).HasMaxLength(100).IsRequired();
            a.Property(x => x.PostalCode).HasMaxLength(20).IsRequired();
        });

        // 🔥 Case-insensitive uniqueness
        builder.HasIndex(u => u.Email)
            .IsUnique();
    }
}