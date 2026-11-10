using System.Text.Json;

namespace Batuara.Domain.Entities
{
    /// <summary>Uma parte do pagamento de uma comanda: forma e valor. Method nulo = "Não identificado".</summary>
    public class BingoPaymentPart
    {
        public int? MethodId { get; set; }
        public string? Method { get; set; }
        public decimal Amount { get; set; }

        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        public static string Serialize(IEnumerable<BingoPaymentPart> parts) => JsonSerializer.Serialize(parts, Json);

        public static List<BingoPaymentPart> Parse(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<BingoPaymentPart>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<BingoPaymentPart>>(json, Json) ?? new List<BingoPaymentPart>();
            }
            catch (JsonException)
            {
                return new List<BingoPaymentPart>();
            }
        }

        /// <summary>Texto curto para exibir/gravar a(s) forma(s): "Pix" ou "Débito + Dinheiro" (até 60 caracteres).</summary>
        public static string? Label(IReadOnlyList<BingoPaymentPart> parts)
        {
            if (parts.Count == 0)
            {
                return null;
            }

            if (parts.Count == 1 && parts[0].Method == null)
            {
                return null;
            }

            var text = string.Join(" + ", parts.Select(p => p.Method ?? "Não identificado"));
            return text.Length > 60 ? text[..60] : text;
        }

        /// <summary>
        /// Partes de um pagamento ja gravado. Sem lista guardada, vale a forma unica (legado) com o valor total.
        /// Sem forma e sem valor (comanda sem consumo) nao ha partes.
        /// </summary>
        public static List<BingoPaymentPart> FromStored(string? paymentsJson, string? singleMethod, int? singleMethodId, decimal amount)
        {
            var stored = Parse(paymentsJson);
            if (stored.Count > 0)
            {
                return stored;
            }

            if (amount > 0 || singleMethod != null)
            {
                return new List<BingoPaymentPart> { new() { MethodId = singleMethodId, Method = singleMethod, Amount = amount } };
            }

            return new List<BingoPaymentPart>();
        }
    }
}
