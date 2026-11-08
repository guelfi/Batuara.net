using Batuara.API.Filters;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Batuara.API.Controllers
{
    /// <summary>Plano simples: comanda de papel fotografada. Acesso por token do evento, sem login.</summary>
    [ApiController]
    [BingoExceptionFilter]
    [Route("api/comanda-foto")]
    public class ComandaFotoController(IComandaFotoService service) : ControllerBase
    {
        private bool Allowed(string? queryToken)
            => service.IsTokenValid(Request.Headers["X-Comanda-Token"].FirstOrDefault() ?? queryToken);

        [HttpPost("ler")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> Extract([FromBody] ComandaFotoExtractRequest request, CancellationToken ct)
            => !Allowed(null) ? Unauthorized() : Ok(new { success = true, data = await service.ExtractAsync(request, ct) });

        [HttpPost]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> Save([FromBody] ComandaFotoSaveRequest request, CancellationToken ct)
            => !Allowed(null) ? Unauthorized() : Ok(new { success = true, data = await service.SaveAsync(request, ct) });

        [HttpGet("relatorio")]
        [EnableRateLimiting("bingo-read")]
        public async Task<IActionResult> Report(CancellationToken ct)
            => !Allowed(null) ? Unauthorized() : Ok(new { success = true, data = await service.GetReportAsync(ct) });

        [HttpGet("{id:int}/foto")]
        [EnableRateLimiting("bingo-read")]
        public async Task<IActionResult> Photo(int id, [FromQuery] string? t, CancellationToken ct)
        {
            if (!Allowed(t))
            {
                return Unauthorized();
            }

            var photo = await service.GetPhotoAsync(id, ct);
            return photo is null ? NotFound() : File(photo.Value.Data, photo.Value.ContentType);
        }

        [HttpDelete("{id:int}")]
        [EnableRateLimiting("bingo-write")]
        public async Task<IActionResult> Discard(int id, CancellationToken ct)
        {
            if (!Allowed(null))
            {
                return Unauthorized();
            }

            await service.DiscardAsync(id, ct);
            return Ok(new { success = true });
        }

        /// <summary>O Admin descobre o link/token do evento para repassar à equipe.</summary>
        [HttpGet("token")]
        [Authorize(Roles = "Admin")]
        public IActionResult Token() => Ok(new { success = true, data = new { token = service.GetAccessToken() } });

        /// <summary>Debug: verifica configuração (apenas Admin)</summary>
        [HttpGet("debug/config")]
        [Authorize(Roles = "Admin")]
        public IActionResult DebugConfig([FromServices] IConfiguration config)
        {
            var apiKey = config["GoogleAI:ApiKey"];
            var model = config["GoogleAI:Model"];
            return Ok(new
            {
                success = true,
                data = new
                {
                    hasApiKey = !string.IsNullOrWhiteSpace(apiKey),
                    apiKeyLength = apiKey?.Length ?? 0,
                    apiKeyPrefix = apiKey?.Length > 10 ? apiKey[..10] : "",
                    model = model ?? "(not set)",
                    canAccessInternet = TestInternetAccess()
                }
            });
        }

        private bool TestInternetAccess()
        {
            try
            {
                using var client = new System.Net.Http.HttpClient { Timeout = TimeSpan.FromSeconds(5) };
                var response = client.GetAsync("https://www.google.com").GetAwaiter().GetResult();
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
