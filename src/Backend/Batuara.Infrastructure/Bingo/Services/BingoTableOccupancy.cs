using Batuara.Application.Bingo.Models;
using Batuara.Domain.Entities;

namespace Batuara.Infrastructure.Bingo.Services
{
    /// <summary>Regra de ocupação das mesas, separada do acesso a dados para poder ser testada sozinha.</summary>
    public static class BingoTableOccupancy
    {
        /// <summary>
        /// Livre: ninguém na mesa. Exclusiva ocupada: mesa exclusiva com ao menos uma comanda aberta (ninguém mais entra).
        /// Lotada: mesa compartilhada com as pessoas das comandas abertas iguais ou acima dos lugares.
        /// Com vaga: mesa compartilhada com lugares sobrando (Livres = lugares − ocupados).
        /// </summary>
        public static BingoTableStatusDto Build(BingoTable table, IReadOnlyCollection<(string Name, int People)> openTabs)
        {
            var occupants = openTabs
                .Select(t => new BingoTableOccupantDto { Nome = t.Name, Pessoas = Math.Max(1, t.People) })
                .ToList();
            var occupied = occupants.Sum(o => o.Pessoas);

            string state;
            int free;
            if (occupied == 0)
            {
                state = BingoTableStates.Free;
                free = table.Capacity;
            }
            else if (table.IsExclusive)
            {
                state = BingoTableStates.ExclusiveTaken;
                free = 0;
            }
            else if (occupied >= table.Capacity)
            {
                state = BingoTableStates.Full;
                free = 0;
            }
            else
            {
                state = BingoTableStates.HasSeats;
                free = table.Capacity - occupied;
            }

            return new BingoTableStatusDto
            {
                Numero = table.Number,
                Lugares = table.Capacity,
                Exclusiva = table.IsExclusive,
                Ocupados = occupied,
                Livres = free,
                Comandas = occupants.Count,
                Estado = state,
                Ocupantes = occupants
            };
        }
    }
}
