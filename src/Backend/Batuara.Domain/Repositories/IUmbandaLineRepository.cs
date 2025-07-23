using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Repositories
{
    public interface IUmbandaLineRepository
    {
        Task<UmbandaLine?> GetByIdAsync(int id);
        Task<UmbandaLine?> GetByNameAsync(string name);
        Task<IEnumerable<UmbandaLine>> GetAllAsync();
        Task<IEnumerable<UmbandaLine>> GetActiveUmbandaLinesAsync();
        Task<IEnumerable<UmbandaLine>> SearchByNameAsync(string searchTerm);
        Task<IEnumerable<UmbandaLine>> GetByEntityAsync(string entity);
        Task<UmbandaLine> AddAsync(UmbandaLine umbandaLine);
        Task UpdateAsync(UmbandaLine umbandaLine);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsByNameAsync(string name);
    }
}