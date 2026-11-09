using Batuara.API.Filters;
using Batuara.API.Services;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [BingoExceptionFilter]
    [Route("api/bingo/public")]
    public class BingoPublicController(IBingoPublicService service, IConfiguration configuration) : ControllerBase
    {
        [HttpGet("info")]
        [EnableRateLimiting("bingo-read")]
        public async Task<IActionResult> GetInfo([FromQuery] int? mesa, [FromQuery] string? s, CancellationToken cancellationToken)
        {
            var info = await service.GetInfoAsync(cancellationToken);
            if (mesa is > 0 && BingoMesaSignature.IsValid(configuration, mesa.Value, s) && info.Mesas.Contains(mesa.Value))
            {
                info.LockedMesa = mesa.Value;
            }

            return Ok(new { success = true, data = info });
        }

        [HttpPost("comandas")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> CreateTab([FromBody] BingoCreateTabRequest request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrEmpty(request.MesaSignature) && !BingoMesaSignature.IsValid(configuration, request.Mesa, request.MesaSignature))
            {
                throw new BingoException(BingoErrorKind.Validation, "QR da mesa inválido. Leia o QR da mesa novamente.");
            }

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
        public async Task<IActionResult> RequestClose(Guid tabId, [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] BingoCloseRequest? request, CancellationToken cancellationToken)
        {
            await service.RequestCloseAsync(tabId, request?.CancelUndelivered == true, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/nova")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> Reopen(Guid tabId, [FromBody] BingoReopenRequest request, CancellationToken cancellationToken)
        {
            var result = await service.ReopenAsync(tabId, request.Mesa, cancellationToken);
            return Ok(new { success = true, data = result });
        }

        [HttpPost("comandas/{tabId:guid}/reabrir")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> CancelClose(Guid tabId, CancellationToken cancellationToken)
        {
            await service.CancelCloseAsync(tabId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/itens/{itemId:int}/cancelar")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> CancelOwnItem(Guid tabId, int itemId, CancellationToken cancellationToken)
        {
            await service.CancelOwnItemAsync(tabId, itemId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/itens/{itemId:int}/contestar")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> ContestItem(Guid tabId, int itemId, [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] BingoContestRequest? request, CancellationToken cancellationToken)
        {
            await service.ContestItemAsync(tabId, itemId, request?.Note, cancellationToken);
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
