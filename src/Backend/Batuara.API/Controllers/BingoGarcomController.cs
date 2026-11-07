using Batuara.API.Filters;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    [ApiController]
    [BingoExceptionFilter]
    [Authorize(Roles = "Member")]
    [ServiceFilter(typeof(BingoWaiterAccessFilter))]
    [EnableRateLimiting("bingo-garcom")]
    [Route("api/bingo/garcom")]
    public class BingoGarcomController(IBingoWaiterService service) : ControllerBase
    {
        [HttpGet("me")]
        [BingoSkipWaiterAccess]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetMeAsync(GetHouseMemberId(), cancellationToken) });
        }

        [HttpGet("pedidos")]
        public async Task<IActionResult> GetOrders(CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetOrdersAsync(cancellationToken) });
        }

        [HttpPost("itens/{itemId:int}/entregar")]
        public async Task<IActionResult> Deliver(int itemId, CancellationToken cancellationToken)
        {
            await service.DeliverAsync(GetHouseMemberId(), itemId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("comandas/{tabId:guid}/mesa")]
        public async Task<IActionResult> ChangeTable(Guid tabId, [FromBody] BingoChangeTableRequest request, CancellationToken cancellationToken)
        {
            await service.ChangeTableAsync(tabId, request.Mesa, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpGet("contas")]
        public async Task<IActionResult> GetAccounts(CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetAccountsAsync(cancellationToken) });
        }

        [HttpPost("comandas/pagar")]
        public async Task<IActionResult> Pay([FromBody] BingoPayRequest request, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.PayAsync(GetHouseMemberId(), request, cancellationToken) });
        }

        private int GetHouseMemberId()
        {
            return int.Parse(User.FindFirst("houseMemberId")?.Value ?? throw new UnauthorizedAccessException("Sessão inválida."));
        }
    }
}
