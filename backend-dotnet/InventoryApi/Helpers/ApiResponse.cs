namespace InventoryApi.Helpers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public T? Data { get; set; }

        public List<string> Errors { get; set; } = new();

        public static ApiResponse<T> SuccessResponse(T data, string message = "")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }

        public static ApiResponse<T> FailureResponse(List<string> errors, string message = "")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Errors = errors,
                Message = message
            };
        }
    }
}