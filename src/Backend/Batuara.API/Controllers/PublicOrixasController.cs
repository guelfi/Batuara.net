using Batuara.Application.Orixas.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/orixas")]
    [Route("api/v1/public/orixas")]
    public class PublicOrixasController : ControllerBase
    {
        private readonly IOrixaService _orixaService;
        private readonly ILogger<PublicOrixasController> _logger;

        public PublicOrixasController(IOrixaService orixaService, ILogger<PublicOrixasController> logger)
        {
            _orixaService = orixaService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublic([FromQuery] string? q)
        {
            try
            {
                var items = await _orixaService.GetPublicAsync(q);
                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Orixas");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving Orixas" });
            }
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPublicById([FromRoute] int id)
        {
            try
            {
                var item = await _orixaService.GetPublicByIdAsync(id);
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
    }
}
