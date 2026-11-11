using System.Collections.Concurrent;
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

        // Leituras (OCR) ja feitas por evento. Fica em memoria: reiniciar a API so reabre o teto, nunca o aumenta.
        private static readonly ConcurrentDictionary<int, int> ReadsByEvent = new();

        private byte[] SigningKey()
            => Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"] ?? string.Empty);

        private static string Sign(byte[] key, long expiresAt)
            => Convert.ToHexString(HMACSHA256.HashData(key, Encoding.UTF8.GetBytes($"comanda-foto|{expiresAt}")))[..32].ToLowerInvariant();

        /// <summary>Token assinado com validade: "{expiracao}.{assinatura}". Link vazado deixa de servir sozinho.</summary>
        public string GetAccessToken(TimeSpan? lifetime = null)
        {
            var validity = lifetime ?? TimeSpan.FromHours(Math.Max(1, options.Value.TokenHours));
            var expiresAt = DateTimeOffset.UtcNow.Add(validity).ToUnixTimeSeconds();
            return $"{expiresAt}.{Sign(SigningKey(), expiresAt)}";
        }

        public bool IsTokenValid(string? token)
        {
            if (string.IsNullOrEmpty(token) || token.Length > 64)
            {
                return false;
            }

            var parts = token.Split('.');
            if (parts.Length != 2 || !long.TryParse(parts[0], out var expiresAt))
            {
                return false;
            }

            var signatureOk = CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(Sign(SigningKey(), expiresAt)), Encoding.UTF8.GetBytes(parts[1]));
            return signatureOk && expiresAt > DateTimeOffset.UtcNow.ToUnixTimeSeconds();
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
            if (ReadsByEvent.AddOrUpdate(ev.Id, 1, (_, n) => n + 1) > options.Value.MaxReadsPerEvent)
            {
                throw new BingoException(BingoErrorKind.TooManyRequests,
                    "Limite de leituras por foto deste evento atingido. Digite os itens manualmente ou fale com o administrador.", "ocr_quota");
            }

            var menu = await Db.BingoMenuItems
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ToListAsync(ct);
            var menuText = string.Join("\n", menu.Select(m => $"- {StripConfirm(m.Name)} = R$ {m.UnitPrice:0.00}"));
            var payOptions = await Db.BingoPaymentOptions.Where(x => x.IsActive).OrderBy(x => x.SortOrder).ThenBy(x => x.Name).ToListAsync(ct);
            var payText = string.Join(", ", payOptions.Select(m => $"\"{m.Name}\""));

            var prompt =
                "Foto de uma comanda de bingo de uma casa de caridade: tabela impressa com os itens do cardápio e marcações feitas à mão. " +
                "Devolva SOMENTE JSON: {\"customerName\":string,\"comandaNumber\":string,\"payments\":[{\"method\":string,\"amount\":number}],\"items\":[{\"name\":string,\"quantity\":number,\"unitPrice\":number,\"matched\":boolean}],\"notes\":string}.\n" +
                "customerName = nome escrito à mão no alto da comanda, acima da tabela (canto superior esquerdo); comandaNumber = número da comanda escrito à mão no canto superior direito, acima da coluna TOTAL. Se não houver, use string vazia.\n" +
                "Cardápio oficial:\n" + menuText + "\n" +
                "REGRAS: 1) O consumo é marcado SOMENTE na coluna QUANTIDADE (tracinhos, números ou riscos à direita do VALOR UNITÁRIO). Linhas sem marca nessa coluna NÃO entram. " +
                "2) Números escritos à mão ao lado ou dentro do nome do produto (ex.: '(2)' junto de Cerveja Heineken ou Cervejas diversas) fazem parte do item, indicam o pacote vendido, e NÃO são quantidade consumida: ignore-os. " +
                "3) CONTAGEM: cada traço feito à mão conta 1, em qualquer direção. Um 'L' ou 'Γ' (um traço vertical mais um horizontal) = 2; '||' = 2; '///' = 3. Grupo de cinco: quatro traços paralelos cortados por um traço transversal = 5; um quadrado (4 lados) cortado por uma diagonal = 5. Some grupos e traços soltos (ex.: um grupo de 5 e mais 2 traços = 7). quantity = total contado. unitPrice = valor impresso na coluna VALOR UNITÁRIO da própria linha, sem dividir nem multiplicar; use o cardápio só se o valor impresso estiver ilegível. " +
                "4) name = nome exato do cardápio, matched=true. " +
                "5) Linha manuscrita fora do cardápio (ex.: 'Batidas'): inclua só se tiver marca na coluna QUANTIDADE, com o preço escrito e matched=false; sem marca, ignore. " +
                "6) Ignore linhas riscadas. " +
                "7) payments = formas de pagamento escritas ou marcadas à mão, normalmente no FINAL da comanda, depois da linha dos totais e FORA da tabela de itens. Formas possíveis: " + payText + ". Uma comanda pode ser paga em MAIS DE UMA forma (ex.: 'deb. 300,00' e 'din. 136,00'): devolva um objeto por forma escrita, com method = exatamente um desses nomes e amount = o valor escrito junto dela (número; 0 se não houver valor). Se não houver nada escrito ou marcado, lista vazia. Não deduza nem invente. " +
                "Em notes, avise se a foto estiver ilegível ou cortada.";

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

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
            Console.WriteLine($"[ComandaFoto] Chamando Google Gemini API - Modelo: {model}");
            
            var sw = System.Diagnostics.Stopwatch.StartNew();
            HttpResponseMessage response;
            string raw;
            // 429 (limite de uso) e 5xx sao passageiros: ate 2 novas tentativas, com espera curta (o proxy corta em 60 s)
            for (var attempt = 1; ; attempt++)
            {
                using var message = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = JsonContent.Create(body)
                };
                // Chave no header (nao na URL): nao aparece em logs de requisicao nem em mensagens de erro.
                message.Headers.TryAddWithoutValidation("x-goog-api-key", apiKey);
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

                raw = await response.Content.ReadAsStringAsync(ct);
                if (response.IsSuccessStatusCode)
                {
                    break;
                }

                var status = (int)response.StatusCode;
                Console.WriteLine($"[ComandaFoto] Google Gemini API error (tentativa {attempt}): {response.StatusCode} - {raw}");
                var transient = status == 429 || status >= 500;
                if (transient && attempt < 3)
                {
                    var wait = response.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(2 * attempt);
                    await Task.Delay(wait > TimeSpan.FromSeconds(5) ? TimeSpan.FromSeconds(5) : wait, ct);
                    continue;
                }

                if (status == 429)
                {
                    throw new BingoException(BingoErrorKind.Validation,
                        "O serviço de leitura atingiu o limite de uso. Aguarde um minuto e tente de novo, ou digite os itens.", "ocr_quota");
                }

                throw new BingoException(BingoErrorKind.Validation,
                    transient
                        ? "O serviço de leitura está instável. Tente de novo em instantes ou digite os itens."
                        : "Não consegui ler a foto agora. Tente de novo ou digite os itens.", "ocr_failed");
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
            // Conferencia real no backend: nao confia no "matched" do modelo.
            ValidateAgainstMenu(parsed.Items, menu.Select(m => m.Name));
            parsed.Total = SumTotal(parsed.Items);
            var payPairs = payOptions.Select(m => (m.Id, m.Name)).ToList();
            foreach (var h in parsed.Payments)
            {
                h.PaymentMethodId = MatchPaymentMethod(h.Method, payPairs);
                if (h.Amount is <= 0)
                {
                    h.Amount = null;
                }
            }

            parsed.Payments = parsed.Payments.Where(h => !string.IsNullOrWhiteSpace(h.Method)).ToList();
            // compatibilidade: uma forma so continua preenchendo os campos antigos
            if (parsed.Payments.Count == 1)
            {
                parsed.PaymentMethod = parsed.Payments[0].Method;
                parsed.PaymentMethodId = parsed.Payments[0].PaymentMethodId;
            }
            else
            {
                parsed.PaymentMethod = null;
                parsed.PaymentMethodId = null;
            }
            var dup = await FindDuplicateAsync(ev.Id, NormalizeNumber(parsed.ComandaNumber), ct);
            parsed.Duplicate = dup == null ? null : new ComandaFotoDuplicate { Id = dup.Id, Label = dup.Label, Total = dup.Total, CreatedAt = dup.CreatedAt };
            return parsed;
        }

        public async Task<List<BingoPaymentMethodDto>> GetPaymentMethodsAsync(CancellationToken ct)
        {
            var list = await Db.BingoPaymentOptions.Where(x => x.IsActive).ToListAsync(ct);
            return list.OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
                .Select(x => new BingoPaymentMethodDto { Id = x.Id, Name = x.Name }).ToList();
        }

        public async Task<ComandaFotoDto> SaveAsync(ComandaFotoSaveRequest request, CancellationToken ct)
        {
            var result = await SaveBatchAsync(new ComandaFotoBatchRequest
            {
                Comandas = new() { new() { Label = request.Label, ComandaNumber = request.ComandaNumber, Items = request.Items, ImageBase64 = request.ImageBase64 } },
                PaymentMethodId = request.PaymentMethodId,
                PaymentNotIdentified = request.PaymentNotIdentified,
                Payments = request.Payments,
            }, ct);
            var dto = result.Comandas[0];
            dto.AddedToMenu = result.AddedToMenu;
            return dto;
        }

        /// <summary>Salva uma ou mais comandas de uma vez (tudo ou nada). Cada comanda fica separada; o pagamento e unico e e repartido em ordem entre elas.</summary>
        public async Task<ComandaFotoBatchResult> SaveBatchAsync(ComandaFotoBatchRequest request, CancellationToken ct)
        {
            if (request.Comandas.Count == 0 || request.Comandas.Count > 10)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe de 1 a 10 comandas.");
            }

            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var menuItems = await Db.BingoMenuItems.Where(x => x.EventId == ev.Id && x.IsActive).ToListAsync(ct);
            var nextSort = menuItems.Count == 0 ? 1 : menuItems.Max(m => m.SortOrder) + 1;
            var added = new List<ComandaFotoItem>();
            var prepared = new List<(ComandaFotoBatchEntry Entry, List<ComandaFotoItem> Items, decimal Total, string? Number, byte[] Photo)>();
            var seenNumbers = new HashSet<string>();

            foreach (var entry in request.Comandas)
            {
                var items = entry.Items.Where(i => !string.IsNullOrWhiteSpace(i.Name) && i.Quantity > 0).ToList();
                // a marca "(confirmar)" e so do cardapio: nunca entra no nome do item da comanda
                foreach (var it in items)
                {
                    it.Name = StripConfirm(it.Name);
                }

                // Comanda sem consumo (nenhum item) e valida: guarda o numero para nao ser lancada de novo.
                if (items.Count == 0 && string.IsNullOrWhiteSpace(entry.ComandaNumber))
                {
                    throw new BingoException(BingoErrorKind.Validation, "Informe o número da comanda.");
                }

                if (items.Any(i => i.UnitPrice < 0 || i.Quantity > 500))
                {
                    throw new BingoException(BingoErrorKind.Validation, "Quantidade ou valor inválido.");
                }

                // Comanda digitada manualmente chega sem foto.
                var photo = string.IsNullOrWhiteSpace(entry.ImageBase64) ? Array.Empty<byte>() : ValidateImage(entry.ImageBase64);
                ValidateAgainstMenu(items, menuItems.Select(m => m.Name));
                // Item novo (com valor) entra no cardapio do evento; nome parecido com um existente fica para o usuario decidir.
                foreach (var item in items.Where(i => !i.Matched && i.UnitPrice > 0 && i.Name.Length <= 150))
                {
                    var key = Normalize(item.Name);
                    if (menuItems.Select(m => StripConfirm(m.Name)).Any(n => IsSimilarName(Normalize(n), key)))
                    {
                        continue;
                    }

                    // "(confirmar)": o Admin revisa o nome e o valor no Cardapio e tira a marca
                    var created = new BingoMenuItem(ev.Id, item.Name + ConfirmSuffix, item.UnitPrice, true, nextSort++);
                    Db.BingoMenuItems.Add(created);
                    menuItems.Add(created);
                    added.Add(new ComandaFotoItem { Name = item.Name, Quantity = 1, UnitPrice = created.UnitPrice, Matched = true });
                    item.Matched = true;
                }

                // itens repetidos na mesma comanda com o nome ja criado acima tambem passam a reconhecidos
                ValidateAgainstMenu(items, menuItems.Select(m => m.Name));

                var number = NormalizeNumber(entry.ComandaNumber);
                if (number != null && !seenNumbers.Add(number))
                {
                    throw new BingoException(BingoErrorKind.Validation, $"A comanda {number} aparece mais de uma vez neste fechamento.");
                }

                var existing = await FindDuplicateAsync(ev.Id, number, ct);
                if (existing != null)
                {
                    throw new BingoException(BingoErrorKind.Conflict,
                        $"A comanda {number} já foi fechada às {existing.CreatedAt.AddHours(-3):HH:mm} (R$ {existing.Total:0.00}). Se foi engano, a anterior precisa ser cancelada (em evento regular, pelo administrador no Dashboard) antes de fechar de novo.",
                        "duplicate_comanda");
                }

                prepared.Add((entry, items, SumTotal(items), number, photo));
            }

            // pagamento unico para todas as comandas: sem consumo (total zero) nao tem forma de pagamento
            var grandTotal = prepared.Sum(p => p.Total);
            var perComanda = prepared.Select(_ => ((string? Name, string? Json))(null, null)).ToList();
            if (grandTotal > 0 && request.Payments is { Count: > 0 })
            {
                var active = await Db.BingoPaymentOptions.Where(x => x.IsActive).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
                var parts = BingoPaymentSplit.Build(request.Payments, active, grandTotal);
                var allocated = BingoPaymentSplit.Allocate(parts, prepared.Select(p => p.Total).ToList());
                for (var i = 0; i < prepared.Count; i++)
                {
                    if (prepared[i].Total > 0)
                    {
                        perComanda[i] = (BingoPaymentPart.Label(allocated[i]), allocated[i].Count > 1 ? BingoPaymentPart.Serialize(allocated[i]) : null);
                    }
                }
            }
            else if (grandTotal > 0 && !request.PaymentNotIdentified)
            {
                var method = await Db.BingoPaymentOptions.FirstOrDefaultAsync(x => x.Id == request.PaymentMethodId && x.IsActive, ct)
                    ?? throw new BingoException(BingoErrorKind.Validation, "Escolha a forma de pagamento.");
                for (var i = 0; i < prepared.Count; i++)
                {
                    if (prepared[i].Total > 0)
                    {
                        perComanda[i] = (method.Name, null);
                    }
                }
            }

            var entities = new List<BingoPhotoTab>();
            for (var i = 0; i < prepared.Count; i++)
            {
                var p = prepared[i];
                var label = (p.Entry.Label ?? string.Empty).Trim();
                var entity = new BingoPhotoTab(ev.Id, label.Length > 60 ? label[..60] : label,
                    JsonSerializer.Serialize(p.Items, Json), p.Total, p.Photo, p.Number, perComanda[i].Item1, perComanda[i].Item2);
                Db.BingoPhotoTabs.Add(entity);
                entities.Add(entity);
            }

            await Db.SaveChangesAsync(ct);
            return new ComandaFotoBatchResult
            {
                Comandas = entities.Select(ToDto).ToList(),
                AddedToMenu = added.Count > 0 ? added : null,
            };
        }

        public async Task<List<BingoMenuItemDto>> GetMenuAsync(CancellationToken ct)
        {
            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var items = await Db.BingoMenuItems
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .ToListAsync(ct);
            return items.Select(x => new BingoMenuItemDto { Id = x.Id, Name = StripConfirm(x.Name), UnitPrice = x.UnitPrice, IsAvailable = x.IsAvailable }).ToList();
        }

        public async Task<ComandaFotoReport> GetReportAsync(CancellationToken ct)
        {
            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var rows = await Db.BingoPhotoTabs
                .Where(x => x.EventId == ev.Id && x.IsActive)
                .OrderBy(x => x.CreatedAt)
                .Select(x => new { x.Id, x.Label, x.Total, x.PaymentMethod, x.PaymentsJson, x.CreatedAt, x.ItemsJson, x.CancelledAt, x.CancelReason, x.CancelledByName })
                .ToListAsync(ct);

            var comandas = rows.Select(r => new ComandaFotoDto
            {
                Id = r.Id,
                Label = r.Label,
                Total = r.Total,
                PaymentMethod = r.PaymentMethod,
                Payments = SplitDto(r.PaymentsJson),
                CreatedAt = r.CreatedAt,
                Cancelled = r.CancelledAt != null,
                CancelledAt = r.CancelledAt,
                CancelReason = r.CancelReason,
                CancelledByName = r.CancelledByName,
                Items = JsonSerializer.Deserialize<List<ComandaFotoItem>>(r.ItemsJson, Json) ?? new()
            }).ToList();

            // cancelada continua visivel, mas nao entra nos totais
            var active = comandas.Where(c => !c.Cancelled).ToList();
            var itemTotals = active
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
                IsTest = ev.IsTest,
                Count = active.Count,
                GrandTotal = active.Sum(c => c.Total),
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

        /// <summary>Descarte sem justificativa: so no evento de teste. Evento regular exige cancelamento justificado.</summary>
        public async Task DiscardAsync(int id, CancellationToken ct)
        {
            var entity = await Db.BingoPhotoTabs.FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
            var ev = await Db.BingoEvents.FirstAsync(x => x.Id == entity.EventId, ct);
            if (!ev.IsTest)
            {
                throw new BingoException(BingoErrorKind.Forbidden,
                    "Em evento regular a comanda só pode ser cancelada pelo administrador no Dashboard, com justificativa.",
                    "cancel_requires_reason");
            }

            entity.Discard();
            await Db.SaveChangesAsync(ct);
        }

        public async Task CancelAsync(int id, string? reason, string actorName, CancellationToken ct)
        {
            var text = (reason ?? string.Empty).Trim();
            if (text.Length < 10 || text.Length > 200)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe a justificativa do cancelamento (10 a 200 caracteres).");
            }

            var entity = await Db.BingoPhotoTabs.FirstOrDefaultAsync(x => x.Id == id && x.IsActive, ct)
                ?? throw new BingoException(BingoErrorKind.NotFound, "Comanda não encontrada.");
            if (entity.CancelledAt != null)
            {
                throw new BingoException(BingoErrorKind.Conflict, "Comanda já cancelada.");
            }

            entity.Cancel(text, actorName, DateTime.UtcNow);
            await Db.SaveChangesAsync(ct);
        }

        private static void ValidateAgainstMenu(IEnumerable<ComandaFotoItem> items, IEnumerable<string> menuNames)
        {
            // o nome gravado na comanda nunca leva a marca "(confirmar)": o relatorio por item nao se parte quando o Admin confirma
            var byKey = menuNames.Select(StripConfirm).GroupBy(Normalize).ToDictionary(g => g.Key, g => g.First());
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
        }

        public async Task<ComandaFotoItem> RegisterMenuItemAsync(ComandaFotoMenuRequest request, CancellationToken ct)
        {
            var name = (request.Name ?? string.Empty).Trim();
            if (name.Length == 0 || name.Length > 150)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe o nome do item (até 150 caracteres).");
            }

            if (request.UnitPrice <= 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Informe um valor maior que zero.");
            }

            var ev = await FindOpenEventAsync(ct)
                ?? throw new BingoException(BingoErrorKind.Validation, "Não há evento aberto.");
            var existing = await Db.BingoMenuItems.Where(x => x.EventId == ev.Id && x.IsActive).ToListAsync(ct);
            var key = Normalize(name);
            var found = existing.FirstOrDefault(m => Normalize(StripConfirm(m.Name)) == key);
            if (found == null)
            {
                found = new BingoMenuItem(ev.Id, name, request.UnitPrice, true, (existing.Count == 0 ? 0 : existing.Max(m => m.SortOrder)) + 1);
                Db.BingoMenuItems.Add(found);
                await Db.SaveChangesAsync(ct);
            }

            return new ComandaFotoItem { Name = StripConfirm(found.Name), Quantity = 1, UnitPrice = request.UnitPrice, Matched = true };
        }

        private static string? NormalizeNumber(string? raw)
        {
            var v = (raw ?? string.Empty).Trim();
            if (v.Length == 0)
            {
                return null;
            }

            if (v.All(char.IsDigit))
            {
                v = v.TrimStart('0');
                return v.Length == 0 ? "0" : (v.Length > 10 ? v[..10] : v);
            }

            v = v.ToUpperInvariant();
            return v.Length > 10 ? v[..10] : v;
        }

        private Task<BingoPhotoTab?> FindDuplicateAsync(int eventId, string? number, CancellationToken ct)
        {
            if (number == null)
            {
                return Task.FromResult<BingoPhotoTab?>(null);
            }

            return Db.BingoPhotoTabs.FirstOrDefaultAsync(
                x => x.EventId == eventId && x.IsActive && x.CancelledAt == null && x.ComandaNumber == number, ct);
        }

        private static string Normalize(string value) => NormalizeName(value);

        /// <summary>Marca no nome do item criado sozinho a partir de uma comanda, ate o Admin confirmar.</summary>
        public const string ConfirmSuffix = " (confirmar)";

        internal static string StripConfirm(string name)
            => System.Text.RegularExpressions.Regex.Replace(name, @"(\s*\(confirmar\))+\s*$", string.Empty, System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();

        /// <summary>Nomes iguais ou a uma letra (ou duas, em nomes longos) de distancia: provavel erro de leitura.</summary>
        internal static bool IsSimilarName(string a, string b)
        {
            if (a == b)
            {
                return true;
            }

            var max = Math.Max(a.Length, b.Length) >= 10 ? 2 : 1;
            if (Math.Abs(a.Length - b.Length) > max)
            {
                return false;
            }

            var prev = Enumerable.Range(0, b.Length + 1).ToArray();
            for (var i = 1; i <= a.Length; i++)
            {
                var cur = new int[b.Length + 1];
                cur[0] = i;
                for (var j = 1; j <= b.Length; j++)
                {
                    cur[j] = Math.Min(Math.Min(cur[j - 1] + 1, prev[j] + 1), prev[j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1));
                }

                prev = cur;
            }

            return prev[b.Length] <= max;
        }

        /// <summary>
        /// Liga o texto lido na comanda a uma forma de pagamento cadastrada (sem acento/caixa; aceita variações
        /// como "cartão de crédito", "crédito", "espécie"). Só devolve quando há exatamente uma correspondência.
        /// </summary>
        public static int? MatchPaymentMethod(string? raw, IEnumerable<(int Id, string Name)> methods)
        {
            var text = Normalize(raw ?? string.Empty);
            if (text.Length == 0)
            {
                return null;
            }

            var list = methods.Select(m => (m.Id, Key: Normalize(m.Name))).Where(m => m.Key.Length > 0).ToList();
            var exact = list.Where(m => m.Key == text).ToList();
            if (exact.Count == 1)
            {
                return exact[0].Id;
            }

            // variacoes comuns escritas a mao
            var aliases = new Dictionary<string, string[]>
            {
                ["dinheiro"] = new[] { "dinheiro", "especie", "cash" },
                ["pix"] = new[] { "pix" },
                ["credito"] = new[] { "credito", "cred" },
                ["debito"] = new[] { "debito", "deb" },
            };
            var hits = list.Where(m =>
                    text.Contains(m.Key) || m.Key.Contains(text)
                    || aliases.Any(a => m.Key.Contains(a.Key) && a.Value.Any(v => text.Contains(v))))
                .Select(m => m.Id).Distinct().ToList();
            return hits.Count == 1 ? hits[0] : null;
        }

        // UnitPrice no relatório por item guarda o valor total da linha (soma qty*preço).
        private static decimal SumTotal(IEnumerable<ComandaFotoItem> items)
            => items.Sum(i => i.Quantity * i.UnitPrice);

        private static List<ComandaFotoPaymentPartDto>? SplitDto(string? paymentsJson)
        {
            var parts = BingoPaymentPart.Parse(paymentsJson);
            return parts.Count > 1
                ? parts.Select(p => new ComandaFotoPaymentPartDto { Method = p.Method, Amount = p.Amount }).ToList()
                : null;
        }

        private static ComandaFotoDto ToDto(BingoPhotoTab e) => new()
        {
            Id = e.Id,
            Label = e.Label,
            Total = e.Total,
            PaymentMethod = e.PaymentMethod,
            Payments = SplitDto(e.PaymentsJson),
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
