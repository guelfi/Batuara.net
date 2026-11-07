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
    [Authorize(Roles = "Admin")]
    [EnableRateLimiting("bingo-admin")]
    [Route("api/bingo/admin")]
    public class BingoAdminController(IBingoAdminService service, IBingoReminderService reminders, IComandaFotoService comandaFoto) : ControllerBase
    {
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetSettingsAsync(eventoId, ct) });

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] BingoUpdateSettingsRequest request, [FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.UpdateSettingsAsync(eventoId, request, ct) });

        [HttpGet("menu")]
        public async Task<IActionResult> GetMenu([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetMenuAsync(eventoId, ct) });

        [HttpPost("menu")]
        public async Task<IActionResult> CreateMenuItem([FromBody] BingoMenuItemRequest request, [FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.CreateMenuItemAsync(eventoId, request, ct) });

        [HttpPut("menu/{id:int}")]
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] BingoMenuItemRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.UpdateMenuItemAsync(id, request, ct) });

        [HttpDelete("menu/{id:int}")]
        public async Task<IActionResult> DeleteMenuItem(int id, CancellationToken ct)
        {
            await service.DeleteMenuItemAsync(id, ct);
            return Ok(new { success = true });
        }

        [HttpPatch("menu/{id:int}/disponibilidade")]
        public async Task<IActionResult> SetAvailability(int id, [FromBody] BingoAvailabilityRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.SetMenuItemAvailabilityAsync(id, request.IsAvailable, ct) });

        [HttpGet("mesas")]
        public async Task<IActionResult> GetTables([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetTablesAsync(eventoId, ct) });

        [HttpPut("mesas")]
        public async Task<IActionResult> SetTables([FromBody] BingoTablesRequest request, [FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.SetTablesAsync(eventoId, request.Quantidade, ct) });

        [HttpGet("garcons")]
        public async Task<IActionResult> GetWaiters([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetWaitersAsync(eventoId, ct) });

        [HttpPost("garcons")]
        public async Task<IActionResult> AddWaiter([FromBody] BingoAddWaiterRequest request, [FromQuery] int? eventoId, CancellationToken ct)
        {
            await service.AddWaiterAsync(eventoId, request.HouseMemberId, ct);
            return Ok(new { success = true });
        }

        [HttpDelete("garcons/{houseMemberId:int}")]
        public async Task<IActionResult> RemoveWaiter(int houseMemberId, [FromQuery] int? eventoId, CancellationToken ct)
        {
            await service.RemoveWaiterAsync(eventoId, houseMemberId, ct);
            return Ok(new { success = true });
        }

        [HttpPost("garcons/encerrar-sessoes")]
        public async Task<IActionResult> EndWaiterSessions([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = new { affected = await service.EndWaiterSessionsAsync(eventoId, ct) } });

        [HttpGet("painel")]
        public async Task<IActionResult> GetPanel([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetPanelAsync(eventoId, ct) });

        [HttpGet("resumo")]
        public async Task<IActionResult> GetSummary([FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetSummaryAsync(eventoId, ct) });

        [HttpPost("comandas/pagar")]
        public async Task<IActionResult> PayTabs([FromBody] BingoAdminPayRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.PayTabsAsync(ActorName(), request, ct) });

        [HttpGet("mesas/{mesa:int}/comandas")]
        public async Task<IActionResult> GetTableTabs(int mesa, [FromQuery] int? eventoId, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetTableTabsAsync(eventoId, mesa, ct) });

        [HttpPost("itens/{itemId:int}/cancelar")]
        public async Task<IActionResult> CancelItem(int itemId, [FromBody] BingoCancelItemRequest request, CancellationToken ct)
        {
            await service.CancelItemAsync(ActorName(), itemId, request.Reason, ct);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/resolver-contestacao")]
        public async Task<IActionResult> ResolveContestation(int itemId, [FromBody] BingoResolveContestRequest request, CancellationToken ct)
        {
            await service.ResolveContestationAsync(ActorName(), itemId, request, ct);
            return Ok(new { success = true });
        }

        [HttpPost("itens/{itemId:int}/entregar")]
        public async Task<IActionResult> DeliverItem(int itemId, CancellationToken ct)
        {
            await service.DeliverItemAsync(ActorName(), itemId, ct);
            return Ok(new { success = true });
        }

        [HttpGet("formas-pagamento")]
        public async Task<IActionResult> GetPaymentMethods(CancellationToken ct)
            => Ok(new { success = true, data = await service.GetPaymentMethodsAsync(ct) });

        [HttpPost("formas-pagamento")]
        public async Task<IActionResult> CreatePaymentMethod([FromBody] BingoPaymentMethodRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.CreatePaymentMethodAsync(request, ct) });

        [HttpPut("formas-pagamento/{id:int}")]
        public async Task<IActionResult> UpdatePaymentMethod(int id, [FromBody] BingoPaymentMethodRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.UpdatePaymentMethodAsync(id, request, ct) });

        [HttpDelete("formas-pagamento/{id:int}")]
        public async Task<IActionResult> DeletePaymentMethod(int id, CancellationToken ct)
        {
            await service.DeletePaymentMethodAsync(id, ct);
            return Ok(new { success = true });
        }

        private string ActorName()
        {
            var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name)?.Value
                ?? User.FindFirst("name")?.Value;
            return string.IsNullOrWhiteSpace(name) ? "Administrador" : name.Trim();
        }

        [HttpPost("zerar-evento")]
        public async Task<IActionResult> Reset([FromBody] BingoResetRequest request, [FromQuery] int? eventoId, CancellationToken ct)
        {
            await service.ResetAsync(eventoId, request.Confirmar, ct);
            return Ok(new { success = true });
        }

        [HttpGet("eventos")]
        public async Task<IActionResult> GetEvents(CancellationToken ct)
            => Ok(new { success = true, data = await service.GetEventsAsync(ct) });

        [HttpPost("eventos")]
        public async Task<IActionResult> CreateEvent([FromBody] BingoCreateEventRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await service.CreateEventAsync(request, ct) });

        [HttpPost("eventos/{id:int}/abrir")]
        public async Task<IActionResult> OpenEvent(int id, CancellationToken ct)
            => Ok(new { success = true, data = await service.OpenEventAsync(id, ct) });

        [HttpPost("eventos/{id:int}/encerrar")]
        public async Task<IActionResult> CloseEvent(int id, CancellationToken ct)
            => Ok(new { success = true, data = await service.CloseEventAsync(id, ct) });

        [HttpGet("eventos/{id:int}/resumo")]
        public async Task<IActionResult> GetEventSummary(int id, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetEventSummaryAsync(id, ct) });

        [HttpGet("eventos/{id:int}/comandas")]
        public async Task<IActionResult> GetEventTabs(int id, CancellationToken ct)
            => Ok(new { success = true, data = await service.GetEventTabsAsync(id, ct) });

        [HttpGet("eventos/{id:int}/lembretes/previa")]
        public async Task<IActionResult> ReminderPreview(int id, CancellationToken ct)
            => Ok(new { success = true, data = await reminders.PreviewAsync(id, ct) });

        [HttpPost("eventos/{id:int}/lembretes/enviar")]
        public async Task<IActionResult> SendReminders(int id, [FromBody] BingoConfirmReminderRequest request, CancellationToken ct)
            => Ok(new { success = true, data = await reminders.SendAsync(id, request?.Confirmar ?? false, ct) });

        [HttpGet("comandas-foto")]
        public async Task<IActionResult> GetPhotoTabs(CancellationToken ct)
            => Ok(new { success = true, data = await comandaFoto.GetReportAsync(ct) });

        [HttpGet("comandas-foto/{id:int}/foto")]
        public async Task<IActionResult> GetPhotoTabImage(int id, CancellationToken ct)
        {
            var photo = await comandaFoto.GetPhotoAsync(id, ct);
            return photo is null ? NotFound() : File(photo.Value.Data, photo.Value.ContentType);
        }

        [HttpDelete("comandas-foto/{id:int}")]
        public async Task<IActionResult> DiscardPhotoTab(int id, CancellationToken ct)
        {
            await comandaFoto.DiscardAsync(id, ct);
            return Ok(new { success = true });
        }
    }
}
