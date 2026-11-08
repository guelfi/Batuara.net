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
            var model = options.Value.Model;
            
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
                "Foto de uma comanda de bingo de uma casa de caridade: tabela impressa com os itens do cardápio e marcações feitas à mão. " +
                "Devolva SOMENTE JSON: {\"customerName\":string,\"comandaNumber\":string,\"items\":[{\"name\":string,\"quantity\":number,\"unitPrice\":number,\"matched\":boolean}],\"notes\":string}.\n" +
                "customerName = nome escrito à mão no alto da comanda, acima da tabela (canto superior esquerdo); comandaNumber = número da comanda escrito à mão no canto superior direito, acima da coluna TOTAL. Se não houver, use string vazia.\n" +
                "Cardápio oficial:\n" + menuText + "\n" +
                "REGRAS: 1) O consumo é marcado SOMENTE na coluna QUANTIDADE (tracinhos, números ou riscos à direita do VALOR UNITÁRIO). Linhas sem marca nessa coluna NÃO entram. " +
                "2) Números escritos à mão ao lado ou dentro do nome do produto (ex.: '(2)' junto de Cerveja Heineken ou Cervejas diversas) fazem parte do item, indicam o pacote vendido, e NÃO são quantidade consumida: ignore-os. " +
                "3) quantity = número de marcas na coluna QUANTIDADE (tracinho = 1). unitPrice = valor impresso na coluna VALOR UNITÁRIO da própria linha, sem dividir nem multiplicar; use o cardápio só se o valor impresso estiver ilegível. " +
                "4) name = nome exato do cardápio, matched=true. " +
                "5) Linha manuscrita fora do cardápio (ex.: 'Batidas'): inclua só se tiver marca na coluna QUANTIDADE, com o preço escrito e matched=false; sem marca, ignore. " +
                "6) Ignore linhas riscadas. Em notes, avise se a foto estiver ilegível ou cortada.";

            // Google Gemini API request format
            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = request.MediaType,
                                    data = request.ImageBase64
                                }
                            },
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    maxOutputTokens = 1024,
                    responseMimeType = "application/json",
                    // Sem "raciocinio" longo: a leitura cai de ~27 s para ~2 s (o proxy corta em 60 s).
                    thinkingConfig = new { thinkingLevel = "low" }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            Console.WriteLine($"[ComandaFoto] Chamando Google Gemini API - Modelo: {model}");
            
            using var message = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(body)
            };

            var sw = System.Diagnostics.Stopwatch.StartNew();
            HttpResponseMessage response;
            try
            {
                response = await http.SendAsync(message, ct);
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"[ComandaFoto] Timeout ao chamar API do Google: {ex.Message}");
                throw new BingoException(BingoErrorKind.Validation,
                    "A leitura da foto demorou muito. Tente com uma foto menor ou com melhor iluminação.", "ocr_timeout");
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[ComandaFoto] Erro de conexão com API do Google: {ex.Message}");
                throw new BingoException(BingoErrorKind.Validation,
                    "Não foi possível conectar ao serviço de leitura. Tente novamente.", "ocr_connection_failed");
            }

            var raw = await response.Content.ReadAsStringAsync(ct);
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = $"[ComandaFoto] Google Gemini API error: {response.StatusCode} - {raw}";
                Console.WriteLine(errorMsg);
                throw new BingoException(BingoErrorKind.Validation,
                    "Não consegui ler a foto agora. Tente de novo ou digite os itens.", "ocr_failed");
            }
            
            Console.WriteLine($"[ComandaFoto] API respondeu com sucesso em {sw.ElapsedMilliseconds} ms");

            string text;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                text = doc.RootElement.GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao parsear resposta Gemini: {ex.Message}. Raw: {raw}");
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
            // Valida os itens contra o cardapio do evento: nome canonico quando reconhecido, senao matched=false.
            var menuNames = await Db.BingoMenuItems
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .Select(x => x.Name)
                .ToListAsync(ct);
            var byKey = menuNames.GroupBy(Normalize).ToDictionary(g => g.Key, g => g.First());
            foreach (var item in items)
            {
                if (byKey.TryGetValue(Normalize(item.Name), out var canonical))
                {
                    item.Name = canonical;
                    item.Matched = true;
                }
                else
                {
                    item.Name = item.Name.Trim();
                    item.Matched = false;
                }
            }

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
                EventDate = ev.EventDate,
                Build = configuration["BUILD_VERSION"] ?? "dev",
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

        private static string Normalize(string value)
        {
            var d = value.Trim().ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in d)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return string.Join(' ', sb.ToString().Split(' ', StringSplitOptions.RemoveEmptyEntries));
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
