using InventoryApi.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Core Entities
        public DbSet<User> Users => Set<User>();
        public DbSet<Organization> Organizations => Set<Organization>();
        public DbSet<UserOrganization> UserOrganizations => Set<UserOrganization>();
        public DbSet<Warehouse> Warehouses => Set<Warehouse>();
        public DbSet<UserWarehouseAssignment> UserWarehouseAssignments => Set<UserWarehouseAssignment>();

        // Business Entities
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Inventory> Inventories => Set<Inventory>();
        public DbSet<Sale> Sales => Set<Sale>();
        public DbSet<SaleItem> SaleItems => Set<SaleItem>();
        public DbSet<Prediction> Predictions => Set<Prediction>();
        public DbSet<TaxConfiguration> TaxConfigurations => Set<TaxConfiguration>();

        public DbSet<StockAdjustment> StockAdjustments => Set<StockAdjustment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //  Apply all IEntityTypeConfiguration classes
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

            //  Global Soft Delete Filter
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    var method = typeof(ApplicationDbContext)
                        .GetMethod(nameof(SetSoftDeleteFilter),
                            System.Reflection.BindingFlags.NonPublic |
                            System.Reflection.BindingFlags.Static)
                        ?.MakeGenericMethod(entityType.ClrType);

                    method?.Invoke(null, new object[] { modelBuilder });
                }
            }
        }

        private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
            where TEntity : BaseEntity
        {
            modelBuilder.Entity<TEntity>()
                .HasQueryFilter(e => !e.IsDeleted);
        }
    }
}