using InventoryApi.Data;
using InventoryApi.Models.DTOs.Inventory;
using InventoryApi.Models.Entities;
using InventoryApi.Repositories;
using InventoryApi.Repositories.Interfaces;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryApi.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IProductRepository _productRepository;
    private readonly IStockAdjustmentRepository _adjustmentRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SalesService> _logger;

    public InventoryService(
        IInventoryRepository inventoryRepository,
        IProductRepository productRepository,
        IStockAdjustmentRepository adjustmentRepository,
        IWarehouseRepository warehouseRepository,
        ICurrentUserService currentUser,
        ApplicationDbContext context,
        ILogger<SalesService> logger)
    {
        _inventoryRepository = inventoryRepository;
        _productRepository = productRepository;
        _adjustmentRepository = adjustmentRepository;
        _warehouseRepository = warehouseRepository;
        _currentUser = currentUser;
        _context = context;
        _logger = logger;
    }

    // ---------------- GET INVENTORY BY WAREHOUSE ----------------
    public async Task<IEnumerable<InventoryResponseDto>> GetByWarehouseAsync(Guid warehouseId)
    {
        await ValidateWarehouseAccess(warehouseId, false);

        var inventories = await _inventoryRepository.GetByWarehouseAsync(warehouseId);

        return inventories.Select(Map);
    }

    // ---------------- UPDATE STOCK ----------------
    public async Task<InventoryResponseDto> UpdateStockAsync(UpdateStockDto dto)
    {
        await ValidateWarehouseAccess(dto.WarehouseId, true);

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var inventory = await _inventoryRepository
                .GetByProductAndWarehouseAsync(dto.ProductId, dto.WarehouseId);

            if (inventory == null)
            {
                inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.WarehouseId,
                    Quantity = 0,
                    LowStockThreshold = 5
                };

                await _inventoryRepository.AddAsync(inventory);
            }

            var newQuantity = inventory.Quantity + dto.QuantityChanged;

            if (newQuantity < 0)
                throw new Exception("Stock cannot be negative.");

            inventory.Quantity = newQuantity;

            _inventoryRepository.Update(inventory);

            var adjustment = new StockAdjustment
            {
                InventoryId = inventory.Id,
                AdjustmentType = dto.AdjustmentType,
                QuantityChanged = dto.QuantityChanged,
                NewQuantity = inventory.Quantity, // ✅ FIXED
                Reason = dto.Reason,
                CreatedByUserId = _currentUser.UserId
            };

            await _adjustmentRepository.AddAsync(adjustment);

            await _context.SaveChangesAsync(); // ✅ single save

            await transaction.CommitAsync();

            return Map(inventory);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    } 

    // ---------------- LOW STOCK ----------------
    public async Task<IEnumerable<InventoryResponseDto>> GetLowStockAsync(Guid warehouseId)
    {
        await ValidateWarehouseAccess(warehouseId, false);

        var inventories = await _inventoryRepository.GetByWarehouseAsync(warehouseId);

        return inventories
            .Where(i => i.Quantity <= i.LowStockThreshold)
            .Select(Map);
    }

    // ---------------- WAREHOUSE ACCESS VALIDATION ----------------
    private async Task ValidateWarehouseAccess(Guid warehouseId, bool requireManageAccess)
    {
        if (_currentUser.IsPlatformAdmin)
            return;

        if (!_currentUser.OrganizationId.HasValue)
            throw new UnauthorizedAccessException("Organization missing.");

        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == warehouseId);

        if (warehouse == null)
            throw new Exception("Warehouse not found.");

        if (warehouse.OrganizationId != _currentUser.OrganizationId.Value)
            throw new UnauthorizedAccessException("Cross-tenant access denied.");

        if (_currentUser.Roles.Contains("Admin"))
            return;

        if (_currentUser.Roles.Contains("Manager"))
        {
            var assignment = await _context.UserWarehouseAssignments
                .FirstOrDefaultAsync(a =>
                    a.UserId == _currentUser.UserId &&
                    a.WarehouseId == warehouseId &&
                    a.IsActive);

            if (assignment == null)
                throw new UnauthorizedAccessException("No warehouse assignment.");

            if (requireManageAccess &&
                assignment.AccessLevel != Models.Enums.WarehouseAccessLevel.Manage)
                throw new UnauthorizedAccessException("Manage permission required.");

            return;
        }

        if (_currentUser.Roles.Contains("Viewer"))
        {
            if (requireManageAccess)
                throw new UnauthorizedAccessException("Viewer cannot modify stock.");

            return;
        }

        throw new UnauthorizedAccessException("Unauthorized role.");
    }

    private static InventoryResponseDto Map(Inventory i)
    {
        return new InventoryResponseDto
        {
            InventoryId = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? "",
            SKU = i.Product?.SKU ?? "",
            Quantity = i.Quantity,
            LowStockThreshold = i.LowStockThreshold
        };
    }

    public async Task InitializeAsync(InitializeInventoryDto dto)
    {
        if (!_currentUser.OrganizationId.HasValue)
            throw new UnauthorizedAccessException("Organization not found.");

        var orgId = SecurityHelper.GetOrgId(_currentUser);

        // Validate product
        var product = await _productRepository.GetByIdAsync(dto.ProductId)
                      ?? throw new Exception("Product not found.");

        SecurityHelper.ValidateSameOrg(product.OrganizationId,orgId);

        // Validate warehouse
        var warehouse = await _warehouseRepository.GetByIdAsync(dto.WarehouseId)
                        ?? throw new Exception("Warehouse not found.");

        SecurityHelper.ValidateSameOrg(warehouse.OrganizationId, orgId);

        // Check existing inventory
        var existing = await _inventoryRepository
            .GetByProductAndWarehouseAsync(dto.ProductId, dto.WarehouseId);

        if (existing != null)
            throw new Exception("Inventory already initialized for this product and warehouse.");

        // Create inventory
        var inventory = new Inventory
        {
            ProductId = dto.ProductId,
            WarehouseId = dto.WarehouseId,
            Quantity = dto.InitialQuantity,
            LowStockThreshold = dto.LowStockThreshold,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId
        };

        await _inventoryRepository.AddAsync(inventory);
        await _inventoryRepository.SaveChangesAsync();

        _logger.LogInformation(
            "Inventory initialized Product {ProductId} Warehouse {WarehouseId}",
            dto.ProductId,
            dto.WarehouseId);
    }
}