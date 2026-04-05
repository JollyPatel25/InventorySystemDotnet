using InventoryApi.Data;
using InventoryApi.Models.DTOs.Prediction;
using InventoryApi.Models.Entities;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

namespace InventoryApi.Services;

public class PredictionService : IPredictionService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<PredictionService> _logger;

    public PredictionService(
        ApplicationDbContext context,
        IHttpClientFactory httpClientFactory,
        ICurrentUserService currentUser,
        ILogger<PredictionService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<PredictionResponseDto> PredictAsync(Guid productId, Guid warehouseId)
    {
        var orgId = _currentUser.OrganizationId
            ?? throw new UnauthorizedAccessException("Organization not found.");

        // ── Validate product ────────────────────────────────────────────────
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null || product.OrganizationId != orgId)
            throw new UnauthorizedAccessException("Invalid product.");

        // ── Validate warehouse ──────────────────────────────────────────────
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == warehouseId && w.OrganizationId == orgId);

        if (warehouse == null)
            throw new UnauthorizedAccessException("Invalid warehouse.");

        // ── Fetch enriched sales data (last 30 points with dates) ───────────
        var salesItems = await _context.SaleItems
            .Where(si => si.ProductId == productId)
            .OrderByDescending(si => si.CreatedAt)
            .Take(30)
            .Select(si => new { si.Quantity, si.CreatedAt })
            .ToListAsync();

        if (salesItems.Count < 3)
            throw new InvalidOperationException(
                "Not enough sales data. At least 3 sales records are required for prediction.");

        // Reverse so oldest → newest (time series order)
        salesItems.Reverse();

        var salesQuantities = salesItems.Select(s => s.Quantity).ToList();
        var salesDates = salesItems.Select(s => s.CreatedAt.ToString("yyyy-MM-dd")).ToList();

        // ── Current stock level for this product/warehouse ──────────────────
        var inventoryEntry = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.WarehouseId == warehouseId);

        int? currentStock = inventoryEntry?.Quantity;

        // ── Product meta for reorder logic ──────────────────────────────────
        int? reorderPoint = product.ReorderPoint;      // add this field if not present
        int leadTimeDays = product.LeadTimeDays > 0    // add this field if not present
            ? product.LeadTimeDays
            : 3;

        // ── Call AI service ─────────────────────────────────────────────────
        var payload = new PredictionRequestDto
        {
            ProductId = productId.ToString(),
            Sales = salesQuantities,
            Dates = salesDates,
            CurrentStock = currentStock,
            ReorderPoint = reorderPoint,
            LeadTimeDays = leadTimeDays
        };

        var client = _httpClientFactory.CreateClient("AIService");

        PredictionResponseDto result;
        try
        {
            var response = await client.PostAsJsonAsync("/predict", payload);
            response.EnsureSuccessStatusCode();

            result = await response.Content.ReadFromJsonAsync<PredictionResponseDto>()
                ?? throw new InvalidOperationException("Empty response from AI service.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI prediction failed for product {ProductId}", productId);
            throw;
        }

        // ── Persist prediction ───────────────────────────────────────────────
        var prediction = new Prediction
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            PredictedQuantity = (int)Math.Round(result.PredictedQuantity),
            ConfidenceScore = result.Confidence,
            PredictionForDate = DateTime.UtcNow.Date.AddDays(1),
            Trend = result.Trend,
            TrendPercent = result.TrendPercent,
            StockoutRiskDays = result.StockoutRiskDays,
            RecommendedReorderQty = result.RecommendedReorderQty,
            AnomalyDetected = result.AnomalyDetected,
            InsightMessage = result.InsightMessage,
            ModelUsed = result.ModelUsed,
        };

        await _context.Predictions.AddAsync(prediction);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Prediction saved: product={ProductId} qty={Qty} confidence={Conf:P0} trend={Trend}",
            productId, result.PredictedQuantity, result.Confidence, result.Trend);

        return result;
    }
}