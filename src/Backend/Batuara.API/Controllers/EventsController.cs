using Batuara.Application.Events.Models;
using Batuara.Application.Events.Services;
using Batuara.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Route("api/v1/events")]
    [Authorize(Roles = "Admin,Editor")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly ILogger<EventsController> _logger;

        public EventsController(IEventService eventService, ILogger<EventsController> logger)
        {
            _eventService = eventService;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAdminList(
            [FromQuery] string? q,
            [FromQuery] EventType? type,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _eventService.GetAdminAsync(q, type, fromDate, toDate, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving events list");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving events" });
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
                var item = await _eventService.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Event not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving event");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the event" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateEventRequest request)
        {
            try
            {
                var (created, errors, conflict) = await _eventService.CreateAsync(request);
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
                _logger.LogError(ex, "Error creating event");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the event" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateEventRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _eventService.UpdateAsync(id, request, isPatch: false);
                if (errors.Length > 0)
                {
                    if (updated == null && errors.Length == 1 && errors[0] == "Event not found")
                    {
                        return NotFound(new { success = false, message = "Event not found" });
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
                _logger.LogError(ex, "Error updating event");
                return StatusCode(500, new { success = false, message = "An error occurred while updating the event" });
            }
        }

        [HttpPatch("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Patch([FromRoute] int id, [FromBody] UpdateEventRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _eventService.UpdateAsync(id, request, isPatch: true);
                if (errors.Length > 0)
                {
                    if (updated == null && errors.Length == 1 && errors[0] == "Event not found")
                    {
                        return NotFound(new { success = false, message = "Event not found" });
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
                _logger.LogError(ex, "Error patching event");
                return StatusCode(500, new { success = false, message = "An error occurred while updating the event" });
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
                var deleted = await _eventService.SoftDeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { success = false, message = "Event not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting event");
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the event" });
            }
        }
    }
}
