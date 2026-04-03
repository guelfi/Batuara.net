using Batuara.Application.HouseMembers.Models;
using Batuara.Application.HouseMembers.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/house-members")]
    [Route("api/v1/house-members")]
    [Authorize(Roles = "Admin,Editor")]
    public class HouseMembersController : ControllerBase
    {
        private readonly IHouseMemberService _service;
        private readonly ILogger<HouseMembersController> _logger;

        public HouseMembersController(IHouseMemberService service, ILogger<HouseMembersController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] string? city,
            [FromQuery] string? state,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetAdminAsync(q, city, state, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving house members");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving house members" });
            }
        }

        [HttpGet("{id:int}")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "House member not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving house member {MemberId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the house member" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Create([FromBody] CreateHouseMemberRequest request)
        {
            try
            {
                var (created, errors, conflict) = await _service.CreateAsync(request);
                if (errors.Length > 0)
                {
                    if (conflict)
                    {
                        return Conflict(new { success = false, message = errors[0], errors });
                    }

                    return BadRequest(new { success = false, message = errors[0], errors });
                }

                return CreatedAtAction(nameof(GetById), new { id = created!.Id }, new { success = true, data = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating house member");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the house member" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateHouseMemberRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _service.UpdateAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors[0] == "House member not found")
                    {
                        return NotFound(new { success = false, message = "House member not found" });
                    }

                    if (conflict)
                    {
                        return Conflict(new { success = false, message = errors[0], errors });
                    }

                    return BadRequest(new { success = false, message = errors[0], errors });
                }

                return Ok(new { success = true, data = updated });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating house member {MemberId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the house member" });
            }
        }

        [HttpDelete("{id:int}")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var deleted = await _service.SoftDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { success = false, message = "House member not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting house member {MemberId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the house member" });
            }
        }
    }
}
