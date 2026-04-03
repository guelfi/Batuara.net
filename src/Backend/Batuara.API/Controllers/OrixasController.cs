using Batuara.Application.Orixas.Models;
using Batuara.Application.Orixas.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/orixas")]
    [Route("api/v1/orixas")]
    [Authorize(Roles = "Admin,Editor")]
    public class OrixasController : ControllerBase
    {
        private readonly IOrixaService _orixaService;
        private readonly ILogger<OrixasController> _logger;

        public OrixasController(IOrixaService orixaService, ILogger<OrixasController> logger)
        {
            _orixaService = orixaService;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAdmin(
            [FromQuery] string? q,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _orixaService.GetAdminAsync(q, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Orixas");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving Orixas" });
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
                var item = await _orixaService.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Orixa not found" });
                }
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Orixa");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the Orixa" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateOrixaRequest request)
        {
            try
            {
                var (created, errors, conflict) = await _orixaService.CreateAsync(request);
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
                _logger.LogError(ex, "Error creating Orixa");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the Orixa" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateOrixaRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _orixaService.UpdateAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors.Length == 1 && errors[0] == "Orixa not found")
                    {
                        return NotFound(new { success = false, message = "Orixa not found" });
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
                _logger.LogError(ex, "Error updating Orixa");
                return StatusCode(500, new { success = false, message = "An error occurred while updating the Orixa" });
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
                var deleted = await _orixaService.SoftDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { success = false, message = "Orixa not found" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting Orixa");
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the Orixa" });
            }
        }
    }
}
