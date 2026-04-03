using Batuara.Application.SpiritualContents.Models;
using Batuara.Application.SpiritualContents.Services;
using Batuara.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/spiritual-contents")]
    [Route("api/v1/spiritual-contents")]
    [Authorize(Roles = "Admin,Editor")]
    public class SpiritualContentsController : ControllerBase
    {
        private readonly ISpiritualContentService _service;
        private readonly ILogger<SpiritualContentsController> _logger;

        public SpiritualContentsController(ISpiritualContentService service, ILogger<SpiritualContentsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] SpiritualContentType? type,
            [FromQuery] SpiritualCategory? category,
            [FromQuery] bool? featured,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetAdminAsync(q, type, category, featured, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving spiritual contents");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving spiritual contents" });
            }
        }

        [HttpGet("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Spiritual content not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving spiritual content");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the spiritual content" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateSpiritualContentRequest request)
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
                _logger.LogError(ex, "Error creating spiritual content");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the spiritual content" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateSpiritualContentRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _service.UpdateAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors.Length == 1 && errors[0] == "Spiritual content not found")
                    {
                        return NotFound(new { success = false, message = "Spiritual content not found" });
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
                _logger.LogError(ex, "Error updating spiritual content");
                return StatusCode(500, new { success = false, message = "An error occurred while updating the spiritual content" });
            }
        }

        [HttpDelete("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var deleted = await _service.SoftDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { success = false, message = "Spiritual content not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting spiritual content");
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the spiritual content" });
            }
        }
    }
}
