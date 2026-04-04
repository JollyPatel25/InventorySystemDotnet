using InventoryApi.Helpers;
using System.Net;
using System.Text.Json;

namespace InventoryApi.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled Exception");

                var env = context.RequestServices
                    .GetRequiredService<IWebHostEnvironment>();

                var isDevelopment = env.IsDevelopment();

                context.Response.StatusCode =
                    (int)HttpStatusCode.InternalServerError;

                context.Response.ContentType = "application/json";

                var errors = new List<string>();

                if (isDevelopment)
                {
                    // Detailed error in Development
                    errors.Add(ex.Message);
                    errors.Add("An unexpected error occurred.");
                    errors.Add(ex.StackTrace ?? string.Empty);
                }
                else
                {
                    // Safe message in Production
                    errors.Add(ex.Message);
                    errors.Add("An unexpected error occurred.");
                    errors.Add(ex.StackTrace ?? string.Empty);
                }

                var response = ApiResponse<string>.FailureResponse(
                    errors,
                    "Server Error"
                );

                var json = JsonSerializer.Serialize(response);

                await context.Response.WriteAsync(json);
            }
        }
    }
}