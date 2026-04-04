using Microsoft.AspNetCore.Mvc;

namespace InventoryApi.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Backend Foundation Working");
        }

        [HttpGet("error")]
        public IActionResult ThrowError()
        {
            throw new Exception("Test exception");
        }
    }
}