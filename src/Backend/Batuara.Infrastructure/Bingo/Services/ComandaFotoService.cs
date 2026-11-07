using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.Bingo.Services
{
    public class ComandaFotoService(
        BatuaraDbContext db,
        HttpClient http,
        IConfiguration configuration,
        IOptions<ComandaFotoOptions> options) : BingoServiceBase(db), IComandaFotoService
    {
        private const int MaxPhotoBytes = 3 * 1024 * 1024;
        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        public string GetAccessToken()
        {
            var secret = configuration["JwtSettings:Secret"] ?? string.Empty;
            var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes("comanda-foto"));
            return Convert.ToHexString(hash)[..20].ToLowerInvariant();
        }

        public bool IsTokenValid(string? token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return false;
            }

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(GetAccessToken()), Encoding.UTF8.GetBytes(token));
        }

        public async Task<ComandaFotoExtractResult> ExtractAsync(ComandaFotoExtractRequest request, CancellationToken ct)
        {
            ValidateImage(request.ImageBase64);
            var apiKey = options.Value.ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new BingoException(BingoErrorKind.Validation,
                    "Leitura automática indisponível. Digite os itens manualmente.", "ocr_unavailable");
            }

            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var menu = await Db.BingoMenuItems
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ToListAsync(ct);
            var menuText = string.Join("\n", menu.Select(m => $"- {m.Name} = R$ {m.UnitPrice:0.00}"));

            var prompt =
                "Esta é a foto de uma comanda de bingo escrita à mão (ou impressa) de uma casa de caridade. " +
                "Leia as linhas de itens consumidos e devolva SOMENTE um JSON, sem texto extra, no formato " +
                "{\"items\":[{\"name\":string,\"quantity\":number,\"unitPrice\":number,\"matched\":boolean}],\"notes\":string}.\n" +
                "Cardápio e preços oficiais:\n" + menuText + "\n" +
                "Regras: associe cada linha ao item mais parecido do cardápio e use o nome e o preço do cardápio (matched=true). " +
                "Traços, riscos ou contagens como /// ou |||| indicam quantidade. Some linhas repetidas do mesmo item. " +
                "Se uma linha não corresponder a nada do cardápio, mantenha o texto lido, use o preço escrito (ou 0) e matched=false. " +
                "Ignore linhas riscadas/canceladas. Em notes, avise se a foto está ilegível ou cortada.";

            var body = new
            {
                model = options.Value.Model,
                max_tokens = 1500,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "image", source = new { type = "base64", media_type = request.MediaType, data = request.ImageBase64 } },
                            new { type = "text", text = prompt }
                        }
                    }
                }
            };

            using var message = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages")
            {
                Content = JsonContent.Create(body)
            };
            message.Headers.Add("x-api-key", apiKey);
            message.Headers.Add("anthropic-version", "2023-06-01");

            using var response = await http.SendAsync(message, ct);
            var raw = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
            {
                throw new BingoException(BingoErrorKind.Validation,
                    "Não consegui ler a foto agora. Tente de novo ou digite os itens.", "ocr_failed");
            }

            string text;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                text = doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? string.Empty;
            }
            catch (Exception)
            {
                throw new BingoException(BingoErrorKind.Validation, "Resposta de leitura inválida.", "ocr_failed");
            }

            var start = text.IndexOf('{');
            var end = text.LastIndexOf('}');
            if (start < 0 || end <= start)
            {
                throw new BingoException(BingoErrorKind.Validation, "Não consegui entender a foto. Tente de novo.", "ocr_failed");
            }

            var parsed = JsonSerializer.Deserialize<ComandaFotoExtractResult>(text[start..(end + 1)], Json)
                ?? new ComandaFotoExtractResult();
            parsed.Items = parsed.Items
                .Where(i => !string.IsNullOrWhiteSpace(i.Name) && i.Quantity > 0)
                .ToList();
            parsed.Total = SumTotal(parsed.Items);
            return parsed;
        }

        public async Task<ComandaFotoDto> SaveAsync(ComandaFotoSaveRequest request, CancellationToken ct)
        {
            var items = request.Items.Where(i => !string.IsNullOrWhiteSpace(i.Name) && i.Quantity > 0).ToList();
            if (items.Count == 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe ao menos um item.");
            }

            if (items.Any(i => i.UnitPrice < 0 || i.Quantity > 500))
            {
                throw new BingoException(BingoErrorKind.Validation, "Quantidade ou valor inválido.");
            }

            var photo = ValidateImage(request.ImageBase64);
            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var total = SumTotal(items);
            var entity = new BingoPhotoTab(ev.Id, request.Label ?? string.Empty,
                JsonSerializer.Serialize(items, Json), total, photo);
            Db.BingoPhotoTabs.Add(entity);
            await Db.SaveChangesAsync(ct);
            return ToDto(entity);
        }

        public async Task<ComandaFotoReport> GetReportAsync(CancellationToken ct)
        {
            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var rows = await Db.BingoPhotoTabs
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.CreatedAt)
                .Select(x => new { x.Id, x.Label, x.Total, x.CreatedAt, x.ItemsJson })
                .ToListAsync(ct);

            var comandas = rows.Select(r => new ComandaFotoDto
            {
                Id = r.Id,
                Label = r.Label,
                Total = r.Total,
                CreatedAt = r.CreatedAt,
                Items = JsonSerializer.Deserialize<List<ComandaFotoItem>>(r.ItemsJson, Json) ?? new()
            }).ToList();

            var itemTotals = comandas
                .SelectMany(c => c.Items)
                .GroupBy(i => i.Name, StringComparer.OrdinalIgnoreCase)
                .Select(g => new ComandaFotoItem
                {
                    Name = g.Key,
                    Quantity = g.Sum(i => i.Quantity),
                    UnitPrice = g.Sum(i => i.Quantity * i.UnitPrice)
                })
                .OrderBy(i => i.Name)
                .ToList();

            return new ComandaFotoReport
            {
                EventName = ev.Name,
                Count = comandas.Count,
                GrandTotal = comandas.Sum(c => c.Total),
                ItemTotals = itemTotals,
                Comandas = comandas
            };
        }

        public async Task<(byte[] Data, string ContentType)?> GetPhotoAsync(int id, CancellationToken ct)
        {
            var photo = await Db.BingoPhotoTabs
                .Where(x => x.Id == id && x.IsActive)
                .Select(x => x.Photo)
                .FirstOrDefaultAsync(ct);
            return photo is { Length: > 0 } ? (photo, "image/jpeg") : null;
        }

        public async Task DiscardAsync(int id, CancellationToken ct)
        {
            var entity = await Db.BingoPhotoTabs.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
            entity.Discard();
            await Db.SaveChangesAsync(ct);
        }

        // UnitPrice no relatório por item guarda o valor total da linha (soma qty*preço).
        private static decimal SumTotal(IEnumerable<ComandaFotoItem> items)
            => items.Sum(i => i.Quantity * i.UnitPrice);

        private static ComandaFotoDto ToDto(BingoPhotoTab e) => new()
        {
            Id = e.Id,
            Label = e.Label,
            Total = e.Total,
            CreatedAt = e.CreatedAt,
            Items = JsonSerializer.Deserialize<List<ComandaFotoItem>>(e.ItemsJson, Json) ?? new()
        };

        private static byte[] ValidateImage(string base64)
        {
            if (string.IsNullOrWhiteSpace(base64))
            {
                throw new BingoException(BingoErrorKind.Validation, "Foto obrigatória.");
            }

            try
            {
                var bytes = Convert.FromBase64String(base64);
                if (bytes.Length > MaxPhotoBytes)
                {
                    throw new BingoException(BingoErrorKind.Validation, "Foto muito grande.");
                }

                return bytes;
            }
            catch (FormatException)
            {
                throw new BingoException(BingoErrorKind.Validation, "Foto inválida.");
            }
        }
    }
}
