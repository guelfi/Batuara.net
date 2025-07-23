using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Repositories
{
    public interface ISpiritualContentRepository
    {
        Task<SpiritualContent?> GetByIdAsync(int id);
        Task<IEnumerable<SpiritualContent>> GetAllAsync();
        Task<IEnumerable<SpiritualContent>> GetActiveContentAsync();
        Task<IEnumerable<SpiritualContent>> GetByTypeAsync(SpiritualContentType type);
        Task<IEnumerable<SpiritualContent>> GetByCategoryAsync(SpiritualCategory category);
        Task<IEnumerable<SpiritualContent>> GetBySourceAsync(string source);
        Task<IEnumerable<SpiritualContent>> SearchByTitleAsync(string searchTerm);
        Task<IEnumerable<SpiritualContent>> GetOrderedContentAsync(SpiritualCategory? category = null);
        Task<SpiritualContent> AddAsync(SpiritualContent content);
        Task UpdateAsync(SpiritualContent content);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task ReorderContentAsync(IEnumerable<(int Id, int Order)> contentOrders);
    }
}