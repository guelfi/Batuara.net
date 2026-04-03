using Batuara.Application.Guides.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/guides")]
    [Route("api/v1/public/guides")]
    public class PublicGuidesController : ControllerBase
    {
        private readonly IGuideService _service;
        private readonly ILogger<PublicGuidesController> _logger;

        public PublicGuidesController(IGuideService service, ILogger<PublicGuidesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        public async Task<IActionResult> Get([FromQuery] string? q, [FromQuery] string? specialty)
        {
            try
            {
                var result = await _service.GetPublicAsync(q, specialty);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public guides");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving guides" });
            }
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var item = await _service.GetPublicByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Guide not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public guide {GuideId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the guide" });
            }
        }
    }
}
