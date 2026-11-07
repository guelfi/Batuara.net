using Batuara.API.Filters;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [BingoExceptionFilter]
    [Route("api/bingo/public")]
    public class BingoPublicController(IBingoPublicService service) : ControllerBase
    {
        [HttpGet("info")]
        [EnableRateLimiting("bingo-read")]
        public async Task<IActionResult> GetInfo(CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetInfoAsync(cancellationToken) });
        }

        [HttpPost("comandas")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> CreateTab([FromBody] BingoCreateTabRequest request, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.CreateTabAsync(request, cancellationToken) });
        }

        [HttpGet("comandas/{tabId:guid}")]
        [EnableRateLimiting("bingo-read")]
        public async Task<IActionResult> GetTab(Guid tabId, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetTabAsync(tabId, cancellationToken) });
        }

        [HttpPost("comandas/{tabId:guid}/itens")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> AddItems(Guid tabId, [FromBody] BingoAddItemsRequest request, CancellationToken cancellationToken)
        {
            await service.AddItemsAsync(tabId, request, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/encerrar")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> RequestClose(Guid tabId, CancellationToken cancellationToken)
        {
            await service.RequestCloseAsync(tabId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/confirmar-celular")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> ConfirmPhone(Guid tabId, [FromBody] BingoConfirmPhoneRequest request, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.ConfirmPhoneAsync(tabId, request?.Code ?? string.Empty, cancellationToken) });
        }

        [HttpPost("comandas/{tabId:guid}/reenviar-codigo")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> ResendCode(Guid tabId, CancellationToken cancellationToken)
        {
            await service.ResendCodeAsync(tabId, cancellationToken);
            return Ok(new { success = true });
        }
    }
}
