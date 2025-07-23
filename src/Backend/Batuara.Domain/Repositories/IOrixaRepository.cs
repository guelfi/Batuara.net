using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Repositories
{
    public interface IOrixaRepository
    {
        Task<Orixa?> GetByIdAsync(int id);
        Task<Orixa?> GetByNameAsync(string name);
        Task<IEnumerable<Orixa>> GetAllAsync();
        Task<IEnumerable<Orixa>> GetActiveOrixasAsync();
        Task<IEnumerable<Orixa>> SearchByNameAsync(string searchTerm);
        Task<IEnumerable<Orixa>> GetByColorAsync(string color);
        Task<IEnumerable<Orixa>> GetByElementAsync(string element);
        Task<Orixa> AddAsync(Orixa orixa);
        Task UpdateAsync(Orixa orixa);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsByNameAsync(string name);
    }
}