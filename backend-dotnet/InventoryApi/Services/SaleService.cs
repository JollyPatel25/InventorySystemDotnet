using InventoryApi.Data;
using InventoryApi.Helpers;
using InventoryApi.Models.DTOs.Sales;
using InventoryApi.Models.Entities;
using InventoryApi.Models.Enums;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class SalesService : ISalesService
{
    private readonly ApplicationDbContext _context;
    private readonly ISaleRepository _saleRepository;
    private readonly ISaleItemRepository _saleItemRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IProductRepository _productRepository;
    private readonly InvoiceGenerator _invoiceGenerator;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<SalesService> _logger;

    public SalesService(
        ApplicationDbContext context,
        ISaleRepository saleRepository,
        ISaleItemRepository saleItemRepository,
        IInventoryRepository inventoryRepository,
        IProductRepository productRepository,
        InvoiceGenerator invoiceGenerator,
        ICurrentUserService currentUser,
        ILogger<SalesService> logger)
    {
        _context = context;
        _saleRepository = saleRepository;
        _saleItemRepository = saleItemRepository;
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _invoiceGenerator = invoiceGenerator;
        _currentUser = currentUser;
        _logger = logger;
    }

    // ---------------- CREATE SALE ----------------

    public async Task<SaleResponseDto> CreateSaleAsync(CreateSaleDto dto)
    {
        var organizationId = SecurityHelper.GetOrgId(_currentUser);

        // ✅ FIX #5: Verify calling user is active before allowing any operation
        await EnsureCurrentUserIsActiveAsync();

        // ✅ FIX #4: Verify the organization is active and subscription is valid
        await EnsureOrganizationActiveAsync(organizationId);

        using var transaction = await _context.Database.BeginTransactionAsync();

        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == dto.WarehouseId);

        if (warehouse == null)
            throw new Exception("Warehouse not found.");

        SecurityHelper.ValidateSameOrg(warehouse.OrganizationId, organizationId);

        // ✅ FIX #1: Check warehouse is active and not deleted before processing sale
        if (warehouse.IsDeleted)
            throw new Exception("Warehouse has been deleted.");

        if (!warehouse.IsActive)
            throw new Exception("Warehouse is inactive.");

        try
        {
            if (!dto.Items.Any())
                throw new Exception("Sale must have at least one item.");

            decimal subTotal = 0;

            var invoiceNumber = await _invoiceGenerator.GenerateAsync();

            var sale = new Sale
            {
                OrganizationId = organizationId,
                WarehouseId = dto.WarehouseId,
                InvoiceNumber = invoiceNumber,
                SubTotal = 0,
                TaxAmount = dto.TaxAmount,
                DiscountAmount = dto.DiscountAmount,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = 0,
                CreatedByUserId = _currentUser.UserId
            };

            await _saleRepository.AddAsync(sale);

            var saleItems = new List<SaleItem>();

            foreach (var item in dto.Items)
            {
                if (item.Quantity <= 0)
                    throw new Exception("Quantity must be greater than zero.");

                var inventory = await _inventoryRepository
                    .GetByProductAndWarehouseAsync(item.ProductId, dto.WarehouseId);

                if (inventory == null)
                    throw new Exception("Inventory not found for product.");

                if (inventory.Quantity < item.Quantity)
                    throw new Exception("Insufficient stock for product.");

                var product = await _productRepository.GetByIdAsync(item.ProductId)
                    ?? throw new Exception("Product not found.");

                SecurityHelper.ValidateSameOrg(product.OrganizationId, organizationId);

                // ✅ FIX #1: Check product is active and not deleted before processing sale
                if (product.IsDeleted)
                    throw new Exception($"Product '{product.Name}' has been deleted.");

                if (!product.IsActive)
                    throw new Exception($"Product '{product.Name}' is inactive.");

                var totalPrice = product.Price * item.Quantity;
                subTotal += totalPrice;

                saleItems.Add(new SaleItem
                {
                    SaleId = sale.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = totalPrice
                });

                var newQuantity = inventory.Quantity - item.Quantity;
                inventory.Quantity = newQuantity;

                await _context.StockAdjustments.AddAsync(new StockAdjustment
                {
                    InventoryId = inventory.Id,
                    AdjustmentType = StockAdjustmentType.Sale,
                    QuantityChanged = -item.Quantity,
                    NewQuantity = newQuantity,
                    Reason = "Sale transaction",
                    CreatedByUserId = _currentUser.UserId
                });

                inventory.UpdatedAt = DateTime.UtcNow;
                inventory.UpdatedBy = _currentUser.UserId;

                _inventoryRepository.Update(inventory);
            }

            var totalAmount = subTotal + dto.TaxAmount - dto.DiscountAmount;

            sale.SubTotal = subTotal;
            sale.TotalAmount = totalAmount;

            await _saleItemRepository.AddRangeAsync(saleItems);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new SaleResponseDto
            {
                InvoiceNumber = sale.InvoiceNumber,
                SubTotal = subTotal,
                DiscountAmount = dto.DiscountAmount,
                TaxAmount = dto.TaxAmount,
                TotalAmount = totalAmount,
                CreatedAt = sale.CreatedAt,
                Items = saleItems.Select(i => new SaleItemResponseDto
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Sale transaction failed.");
            throw;
        }
    }

    // ---------------- GET SALE ----------------

    public async Task<SaleResponseDto> GetSaleByIdAsync(Guid id)
    {
        var sale = await _saleRepository.GetByIdAsync(id)
                   ?? throw new Exception("Sale not found.");

        return MapSale(sale);
    }

    public async Task<IEnumerable<SaleResponseDto>> GetSalesByWarehouseAsync(Guid warehouseId)
    {
        var sales = await _saleRepository.GetByWarehouseAsync(warehouseId);

        return sales.Select(MapSale);
    }

    // ---------------- GUARD HELPERS ----------------

    /// <summary>
    /// ✅ FIX #5: Ensures the currently authenticated user is active (not deactivated).
    /// A deactivated user whose JWT hasn't expired should not be able to perform operations.
    /// </summary>
    private async Task EnsureCurrentUserIsActiveAsync()
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId && !u.IsDeleted)
            ?? throw new UnauthorizedAccessException("User not found.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("User account is deactivated.");
    }

    /// <summary>
    /// ✅ FIX #4: Ensures the organization is active and subscription has not expired.
    /// Deactivated org members should not be able to perform any business operations.
    /// </summary>
    private async Task EnsureOrganizationActiveAsync(Guid organizationId)
    {
        var org = await _context.Organizations
            .FirstOrDefaultAsync(o => o.Id == organizationId)
            ?? throw new Exception("Organization not found.");

        if (!org.IsActive)
            throw new UnauthorizedAccessException("Organization is inactive.");

        if (org.SubscriptionEndDate < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Organization subscription has expired.");
    }

    // ---------------- MAPPING ----------------

    private static SaleResponseDto MapSale(Sale sale)
    {
        return new SaleResponseDto
        {
            InvoiceNumber = sale.InvoiceNumber,
            SubTotal = sale.SubTotal,
            TaxAmount = sale.TaxAmount,
            DiscountAmount = sale.DiscountAmount,
            TotalAmount = sale.TotalAmount,
            PaymentMethod = sale.PaymentMethod,
            CreatedAt = sale.CreatedAt,
            Items = sale.SaleItems.Select(i => new SaleItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}