using System.Security.Cryptography;
using System.Text;
using Batuara.Application.Events.Services;
using Batuara.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Route("api/public/events")]
    [Route("api/v1/public/events")]
    public class PublicEventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly ILogger<PublicEventsController> _logger;

        public PublicEventsController(IEventService eventService, ILogger<PublicEventsController> logger)
        {
            _eventService = eventService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        [EnableRateLimiting("public")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPublicList(
            [FromQuery] string? q,
            [FromQuery] EventType? type,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sort = null)
        {
            try
            {
                var result = await _eventService.GetPublicAsync(q, type, fromDate, toDate, pageNumber, pageSize, sort);
                var etag = ComputeETag(result.TotalCount, result.PageNumber, result.PageSize, q, type, fromDate, toDate, sort, result.Data.Count);
                if (Request.Headers.IfNoneMatch.Any(v => v == etag))
                {
                    return StatusCode(StatusCodes.Status304NotModified);
                }

                Response.Headers.ETag = etag;
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public events list");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving events" });
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
                var item = await _eventService.GetPublicByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { success = false, message = "Event not found" });
                }

                var etag = $"W/\"{ComputeHash($"{item.Id}:{item.UpdatedAt:O}")}\"";
                if (Request.Headers.IfNoneMatch.Any(v => v == etag))
                {
                    return StatusCode(StatusCodes.Status304NotModified);
                }

                Response.Headers.ETag = etag;
                return Ok(new { success = true, data = item });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving public event");
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving the event" });
            }
        }

        private static string ComputeETag(
            int totalCount,
            int pageNumber,
            int pageSize,
            string? q,
            EventType? type,
            DateTime? fromDate,
            DateTime? toDate,
            string? sort,
            int itemCount)
        {
            var seed = $"{totalCount}:{pageNumber}:{pageSize}:{q}:{type}:{fromDate:O}:{toDate:O}:{sort}:{itemCount}";
            return $"W/\"{ComputeHash(seed)}\"";
        }

        private static string ComputeHash(string input)
        {
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
