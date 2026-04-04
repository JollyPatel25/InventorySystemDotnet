using InventoryApi.Helpers;
using InventoryApi.Repositories;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services;
using InventoryApi.Services.Interfaces;

namespace InventoryApi.Configurations
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services)
        {
            // Get Current user from JWT
            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            //  Auth Service
            services.AddScoped<IAuthService, AuthService>();

            // Product Service
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IProductService, ProductService>();

            // Inventory Service
            services.AddScoped<IInventoryRepository, InventoryRepository>();
            services.AddScoped<IInventoryService, InventoryService>();

            // StockAdjustment Service
            services.AddScoped<IStockAdjustmentRepository, StockAdjustmentRepository>();

            //InvoiceGenerator helper
            services.AddScoped<InvoiceGenerator>();

            // Sale Service
            services.AddScoped<ISaleRepository, SaleRepository>();
            services.AddScoped<ISaleItemRepository, SaleItemRepository>();
            services.AddScoped<ISalesService, SalesService>();

            //Warehouse Service
            services.AddScoped<IWarehouseRepository, WarehouseRepository>();
            services.AddScoped<IWarehouseService, WarehouseService>();

            // Report Service
            services.AddScoped<IReportService, ReportService>();

            // Prediction Service
            services.AddScoped<IPredictionService, PredictionService>();

            //Organization Service
            services.AddScoped<IOrganizationRepository, OrganizationRepository>();
            services.AddScoped<IOrganizationService, OrganizationService>();

            // User service
            services.AddScoped<IUserService, UserService>();

            // Tax Service
            services.AddScoped<ITaxRepository, TaxRepository>();
            services.AddScoped<ITaxService, TaxService>();

            return services;
        }
    }
}