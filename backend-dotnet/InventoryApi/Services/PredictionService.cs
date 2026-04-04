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

        // 🔹 Validate product
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null || product.OrganizationId != orgId)
            throw new UnauthorizedAccessException("Invalid product.");

        // 🔹 Validate warehouse
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.Id == warehouseId && w.OrganizationId == orgId);

        if (warehouse == null)
            throw new UnauthorizedAccessException("Invalid warehouse.");

        // 🔹 Get sales data
        var salesData = await _context.SaleItems
            .Where(si => si.ProductId == productId)
            .OrderByDescending(si => si.CreatedAt)
            .Take(10)
            .Select(si => si.Quantity)
            .ToListAsync();

        if (!salesData.Any())
            throw new Exception("Not enough data for prediction.");

        var client = _httpClientFactory.CreateClient("AIService");

        try
        {
            var response = await client.PostAsJsonAsync("/predict", new
            {
                product_id = productId,
                sales = salesData
            });

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<PredictionResponseDto>();

            if (result == null)
                throw new Exception("Invalid response from AI service.");

            // 🔹 Save prediction
            var prediction = new Prediction
            {
                ProductId = productId,
                WarehouseId = warehouseId,
                PredictedQuantity = result.PredictedQuantity,
                ConfidenceScore = result.Confidence,
                PredictionForDate = DateTime.UtcNow.Date.AddDays(1),
            };

            await _context.Predictions.AddAsync(prediction);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Prediction created for product {ProductId}", productId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI prediction failed");

            throw; // ✅ better than silent fail
        }
    }
}