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

        using var transaction = await _context.Database.BeginTransactionAsync();

        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == dto.WarehouseId);

        if (warehouse == null)
            throw new Exception("Warehouse not found");

        SecurityHelper.ValidateSameOrg(warehouse.OrganizationId, organizationId);

        try
        {
            if (!dto.Items.Any())
                throw new Exception("Sale must have at least one item.");

            decimal subTotal = 0;

            var invoiceNumber = await _invoiceGenerator.GenerateAsync();

            // ✅ STEP 1: Create Sale FIRST
            var sale = new Sale
            {
                OrganizationId = organizationId,
                WarehouseId = dto.WarehouseId,
                InvoiceNumber = invoiceNumber,
                SubTotal = 0, // temp
                TaxAmount = dto.TaxAmount,
                DiscountAmount = dto.DiscountAmount,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = 0, // temp
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

                var totalPrice = product.Price * item.Quantity;
                subTotal += totalPrice;

                // ✅ STEP 2: SaleItem with SaleId (FIXED)
                saleItems.Add(new SaleItem
                {
                    SaleId = sale.Id, // ✅ REQUIRED FIX
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    TotalPrice = totalPrice
                });

                // Inventory update
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

            // ✅ STEP 3: Final totals
            var totalAmount = subTotal + dto.TaxAmount - dto.DiscountAmount;

            sale.SubTotal = subTotal;
            sale.TotalAmount = totalAmount;

            // Save everything
            await _saleItemRepository.AddRangeAsync(saleItems);

            await _context.SaveChangesAsync(); // ✅ single save

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
            PaymentMethod = sale.PaymentMethod,   // ← add
            CreatedAt = sale.CreatedAt,
            Items = sale.SaleItems.Select(i => new SaleItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",  // ← add
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}