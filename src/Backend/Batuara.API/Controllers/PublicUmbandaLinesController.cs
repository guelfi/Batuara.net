using Batuara.Application.UmbandaLines.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/umbanda-lines")]
    [Route("api/v1/public/umbanda-lines")]
    public class PublicUmbandaLinesController : ControllerBase
    {
        private readonly IUmbandaLineService _service;
        private readonly ILogger<PublicUmbandaLinesController> _logger;

        public PublicUmbandaLinesController(IUmbandaLineService service, ILogger<PublicUmbandaLinesController> logger)
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
            [FromQuery] string? entity,
            [FromQuery] string? workingDay,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetPublicAsync(q, entity, workingDay, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public umbanda lines");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving umbanda lines" });
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
                    return NotFound(new { success = false, message = "Umbanda line not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public umbanda line");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the umbanda line" });
            }
        }
    }
}
