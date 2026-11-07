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
            return Ok(new { success = true, data = await service.GetOrdersAsync(GetHouseMemberId(), cancellationToken) });
        }

        [HttpPost("itens/{itemId:int}/retirar")]
        public async Task<IActionResult> Retrieve(int itemId, CancellationToken cancellationToken)
        {
            await service.RetrieveAsync(GetHouseMemberId(), itemId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/devolver")]
        public async Task<IActionResult> Return(int itemId, CancellationToken cancellationToken)
        {
            await service.ReturnAsync(itemId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/entregar")]
        public async Task<IActionResult> Deliver(int itemId, CancellationToken cancellationToken)
        {
            await service.DeliverAsync(GetHouseMemberId(), itemId, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/cancelar")]
        public async Task<IActionResult> CancelItem(int itemId, [FromBody] BingoCancelItemRequest request, CancellationToken cancellationToken)
        {
            await service.CancelItemAsync(GetHouseMemberId(), itemId, request.Reason, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/resolver-contestacao")]
        public async Task<IActionResult> ResolveContestation(int itemId, [FromBody] BingoResolveContestRequest request, CancellationToken cancellationToken)
        {
            await service.ResolveContestationAsync(GetHouseMemberId(), itemId, request, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpGet("formas-pagamento")]
        public async Task<IActionResult> GetPaymentMethods(CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetPaymentMethodsAsync(cancellationToken) });
        }

        [HttpPost("comandas/{tabId:guid}/mesa")]
        public async Task<IActionResult> ChangeTable(Guid tabId, [FromBody] BingoChangeTableRequest request, CancellationToken cancellationToken)
        {
            await service.ChangeTableAsync(tabId, request.Mesa, cancellationToken);
            return Ok(new { success = true });
        }

        [HttpGet("saida/{tabId:guid}")]
        public async Task<IActionResult> GetExit(Guid tabId, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetExitCheckAsync(tabId, cancellationToken) });
        }

        [HttpPost("saida/{tabId:guid}/liberar")]
        public async Task<IActionResult> ReleaseExit(Guid tabId, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.ReleaseExitAsync(GetHouseMemberId(), tabId, cancellationToken) });
        }

        [HttpGet("contas")]
        public async Task<IActionResult> GetAccounts([FromQuery] bool todas, CancellationToken cancellationToken)
        {
            return Ok(new { success = true, data = await service.GetAccountsAsync(todas, cancellationToken) });
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
