using Serilog;

namespace InventoryApi.Logging
{
    public static class LoggingService
    {
        public static void LogInformation(string message)
        {
            Log.Information(message);
        }

        public static void LogError(Exception ex, string message)
        {
            Log.Error(ex, message);
        }
    }
}