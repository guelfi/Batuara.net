using Batuara.Application.ContactMessages.Models;
using Batuara.Application.ContactMessages.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/contact-messages")]
    [Route("api/v1/public/contact-messages")]
    public class PublicContactMessagesController : ControllerBase
    {
        private readonly IContactMessageService _service;
        private readonly ILogger<PublicContactMessagesController> _logger;

        public PublicContactMessagesController(IContactMessageService service, ILogger<PublicContactMessagesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        public async Task<IActionResult> Create([FromBody] CreateContactMessageRequest request)
        {
            try
            {
                var (created, errors, _) = await _service.CreatePublicAsync(request);
                if (errors.Length > 0)
                {
                    return BadRequest(new { success = false, message = errors[0], errors });
                }

                return Created(string.Empty, new { success = true, data = created });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating public contact message");
                return StatusCode(500, new { success = false, message = "An error occurred while sending the contact message" });
            }
        }
    }
}
