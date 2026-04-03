using Batuara.Application.Guides.Models;
using Batuara.Application.Guides.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/guides")]
    [Route("api/v1/guides")]
    [Authorize(Roles = "Admin,Editor")]
    public class GuidesController : ControllerBase
    {
        private readonly IGuideService _service;
        private readonly ILogger<GuidesController> _logger;

        public GuidesController(IGuideService service, ILogger<GuidesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] string? specialty,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetAdminAsync(q, specialty, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving guides");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving guides" });
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
                    return NotFound(new { success = false, message = "Guide not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving guide {GuideId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the guide" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Create([FromBody] CreateGuideRequest request)
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
                _logger.LogError(ex, "Error creating guide");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the guide" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateGuideRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _service.UpdateAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors[0] == "Guide not found")
                    {
                        return NotFound(new { success = false, message = "Guide not found" });
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
                _logger.LogError(ex, "Error updating guide {GuideId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the guide" });
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
                    return NotFound(new { success = false, message = "Guide not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting guide {GuideId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the guide" });
            }
        }
    }
}
