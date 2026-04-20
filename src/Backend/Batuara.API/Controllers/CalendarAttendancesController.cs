using Batuara.Application.Calendar.Models;
using Batuara.Application.Calendar.Services;
using Batuara.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/calendar/attendances")]
    [Route("api/v1/calendar/attendances")]
    [Authorize(Roles = "Admin,Editor")]
    public class CalendarAttendancesController : ControllerBase
    {
        private readonly ICalendarAttendanceService _service;
        private readonly ILogger<CalendarAttendancesController> _logger;

        public CalendarAttendancesController(ICalendarAttendanceService service, ILogger<CalendarAttendancesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] AttendanceType? type,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] bool? requiresRegistration,
            [FromQuery] bool? isActive,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                // Lógica de filtragem por mês/ano se fornecidos
                if (month.HasValue && year.HasValue)
                {
                    fromDate = new DateTime(year.Value, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                    toDate = fromDate.Value.AddMonths(1).AddTicks(-1);
                }

                var result = await _service.GetAdminAsync(q, type, fromDate, toDate, requiresRegistration, isActive, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving calendar attendances");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving calendar attendances" });
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
                    return NotFound(new { success = false, message = "Attendance not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving calendar attendance");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the attendance" });
            }
        }

        [HttpPost]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateCalendarAttendanceRequest request)
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
                _logger.LogError(ex, "Error creating calendar attendance");
                return StatusCode(500, new { success = false, message = "An error occurred while creating the attendance" });
            }
        }

        [HttpPut("{id:int}")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateCalendarAttendanceRequest request)
        {
            try
            {
                var (updated, errors, conflict) = await _service.UpdateAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors.Length == 1 && errors[0] == "Attendance not found")
                    {
                        return NotFound(new { success = false, message = "Attendance not found" });
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
                _logger.LogError(ex, "Error updating calendar attendance");
                return StatusCode(500, new { success = false, message = "An error occurred while updating the attendance" });
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
                    return NotFound(new { success = false, message = "Attendance not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting calendar attendance");
                return StatusCode(500, new { success = false, message = "An error occurred while deleting the attendance" });
            }
        }
    }
}
