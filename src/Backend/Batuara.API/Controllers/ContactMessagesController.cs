using Batuara.Application.ContactMessages.Models;
using Batuara.Application.ContactMessages.Services;
using Batuara.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/contact-messages")]
    [Route("api/v1/contact-messages")]
    [Authorize(Roles = "Admin,Editor")]
    public class ContactMessagesController : ControllerBase
    {
        private readonly IContactMessageService _service;
        private readonly ILogger<ContactMessagesController> _logger;

        public ContactMessagesController(IContactMessageService service, ILogger<ContactMessagesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> Get(
            [FromQuery] string? q,
            [FromQuery] ContactMessageStatus? status,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _service.GetAdminAsync(q, status, fromDate, toDate, pageNumber, pageSize, sort);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact messages");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving contact messages" });
            }
        }

        [HttpGet("{id:int}")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Contact message not found" });
                }

                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact message {MessageId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the contact message" });
            }
        }

        [HttpPatch("{id:int}/status")]
        [EnableRateLimiting("authenticated")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateContactMessageStatusRequest request)
        {
            try
            {
                var (updated, errors) = await _service.UpdateStatusAsync(id, request);
                if (errors.Length > 0)
                {
                    if (updated == null && errors[0] == "Contact message not found")
                    {
                        return NotFound(new { success = false, message = "Contact message not found" });
                    }

                    return BadRequest(new { success = false, message = errors[0], errors });
                }

                return Ok(new { success = true, data = updated });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contact message {MessageId}", id);
                return StatusCode(500, new { success = false, message = "An error occurred while updating the contact message" });
            }
        }
    }
}
