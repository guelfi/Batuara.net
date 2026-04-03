using Batuara.Application.SpiritualContents.Services;
using Batuara.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/spiritual-contents")]
    [Route("api/v1/public/spiritual-contents")]
    public class PublicSpiritualContentsController : ControllerBase
    {
        private readonly ISpiritualContentService _service;
        private readonly ILogger<PublicSpiritualContentsController> _logger;

        public PublicSpiritualContentsController(ISpiritualContentService service, ILogger<PublicSpiritualContentsController> logger)
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
            [FromQuery] SpiritualContentType? type,
            [FromQuery] SpiritualCategory? category,
            [FromQuery] bool? featured,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetPublicAsync(q, type, category, featured, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public spiritual contents");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving spiritual contents" });
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
                    return NotFound(new { success = false, message = "Spiritual content not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public spiritual content");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the spiritual content" });
            }
        }
    }
}
