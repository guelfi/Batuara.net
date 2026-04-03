using Batuara.Application.Calendar.Services;
using Batuara.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/calendar/attendances")]
    [Route("api/v1/public/calendar/attendances")]
    public class PublicCalendarAttendancesController : ControllerBase
    {
        private readonly ICalendarAttendanceService _service;
        private readonly ILogger<PublicCalendarAttendancesController> _logger;

        public PublicCalendarAttendancesController(ICalendarAttendanceService service, ILogger<PublicCalendarAttendancesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] AttendanceType? type,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] bool? requiresRegistration,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetPublicAsync(q, type, fromDate, toDate, requiresRegistration, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public calendar attendances");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving calendar attendances" });
            }
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var item = await _service.GetPublicByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Attendance not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public calendar attendance");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the attendance" });
            }
        }
    }
}
