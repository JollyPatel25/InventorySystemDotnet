using InventoryApi.Models.Common;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/v1/organizations")]
    [Authorize]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganizationService _service;

        public OrganizationController(IOrganizationService service)
        {
            _service = service;
        }

        // 🔹 Get My Org
        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            var result = await _service.GetMyAsync();

            return Ok(ApiResponse<object>.SuccessResponse(
                result,
                "Organization fetched"
            ));
        }

        // 🔹 Platform Admin → Get All
        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(ApiResponse<object>.SuccessResponse(
                result,
                "Organizations fetched"
            ));
        }

        // 🔹 Update Org
        [HttpPatch("update")]
        public async Task<IActionResult> Update([FromBody] UpdateOrganizationDto dto)
        {
            var result = await _service.UpdateAsync(dto);

            return Ok(ApiResponse<object>.SuccessResponse(
                result,
                "Organization updated"
            ));
        }

        // 🔹 Deactivate
        [HttpDelete("deactivate/{id}")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            await _service.DeactivateAsync(id);

            return Ok(ApiResponse<object>.SuccessResponse(
                null,
                "Organization deactivated"
            ));
        }

        [HttpPatch("reactivate/{id}")]
        public async Task<IActionResult> Reactivate(Guid id)
        {
            await _service.ReactivateAsync(id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Organization reactivated"));
        }
    }
}
