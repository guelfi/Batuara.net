using Batuara.Application.Bingo.Models;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Bingo.Services
{
    /// <summary>Regras do pagamento em mais de uma forma (comanda digital e comanda de papel).</summary>
    public static class BingoPaymentSplit
    {
        /// <summary>
        /// Valida as linhas contra o total e devolve as partes. Forma nula = "Não identificado".
        /// A soma precisa ser exatamente o total; formas repetidas sao somadas.
        /// </summary>
        public static List<BingoPaymentPart> Build(IEnumerable<BingoPaymentLineDto> lines, IReadOnlyDictionary<int, string> activeMethods, decimal expectedTotal)
        {
            var list = lines.ToList();
            if (list.Count == 0)
            {
                throw new BingoException(BingoErrorKind.Validation, "Escolha a forma de pagamento.");
            }

            var parts = new List<BingoPaymentPart>();
            foreach (var line in list)
            {
                var amount = Math.Round(line.Amount, 2);
                if (amount <= 0)
                {
                    throw new BingoException(BingoErrorKind.Validation, "Cada forma de pagamento precisa ter um valor maior que zero.");
                }

                string? name = null;
                if (line.PaymentMethodId is int id)
                {
                    if (!activeMethods.TryGetValue(id, out name))
                    {
                        throw new BingoException(BingoErrorKind.Validation, "Forma de pagamento inválida ou inativa.");
                    }
                }

                var existing = parts.FirstOrDefault(p => p.MethodId == line.PaymentMethodId);
                if (existing != null)
                {
                    existing.Amount += amount;
                }
                else
                {
                    parts.Add(new BingoPaymentPart { MethodId = line.PaymentMethodId, Method = name, Amount = amount });
                }
            }

            var sum = parts.Sum(p => p.Amount);
            if (sum != Math.Round(expectedTotal, 2))
            {
                throw new BingoException(BingoErrorKind.Validation,
                    $"A soma das formas de pagamento (R$ {sum:0.00}) precisa ser igual ao total (R$ {expectedTotal:0.00}).");
            }

            return parts;
        }

        /// <summary>Distribui as partes (em ordem) pelas comandas, cada uma recebendo exatamente o seu valor a pagar.</summary>
        public static List<List<BingoPaymentPart>> Allocate(IReadOnlyList<BingoPaymentPart> parts, IReadOnlyList<decimal> dues)
        {
            var remaining = parts.Select(p => new BingoPaymentPart { MethodId = p.MethodId, Method = p.Method, Amount = p.Amount }).ToList();
            var result = new List<List<BingoPaymentPart>>();
            var cursor = 0;
            foreach (var due in dues)
            {
                var mine = new List<BingoPaymentPart>();
                var need = Math.Round(due, 2);
                while (need > 0 && cursor < remaining.Count)
                {
                    var take = Math.Min(need, remaining[cursor].Amount);
                    mine.Add(new BingoPaymentPart { MethodId = remaining[cursor].MethodId, Method = remaining[cursor].Method, Amount = take });
                    remaining[cursor].Amount -= take;
                    need -= take;
                    if (remaining[cursor].Amount <= 0)
                    {
                        cursor++;
                    }
                }

                result.Add(mine);
            }

            return result;
        }
    }
}
