using Batuara.Application.SiteSettings.Models;
using Batuara.Application.SiteSettings.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/site-settings")]
    [Route("api/v1/site-settings")]
    public class SiteSettingsController : ControllerBase
    {
        private readonly ISiteSettingsService _siteSettingsService;
        private readonly ILogger<SiteSettingsController> _logger;

        public SiteSettingsController(ISiteSettingsService siteSettingsService, ILogger<SiteSettingsController> logger)
        {
            _siteSettingsService = siteSettingsService;
            _logger = logger;
        }

        [HttpGet("public")]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublic()
        {
            try
            {
                var settings = await _siteSettingsService.GetPublicAsync();
                return Ok(new { success = true, data = settings });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public site settings");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving site settings" });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Get()
        {
            try
            {
                var settings = await _siteSettingsService.GetAsync();
                return Ok(new { success = true, data = settings });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving site settings");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving site settings" });
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        [EnableRateLimiting("authenticated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromBody] UpdateSiteSettingsRequest request)
        {
            try
            {
                var settings = await _siteSettingsService.UpdateAsync(request);
                return Ok(new { success = true, data = settings });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating site settings");
                return StatusCode(500, new { success = false, message = "An error occurred while updating site settings" });
            }
        }
    }
}
