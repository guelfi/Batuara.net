using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Repositories
{
    public interface IEventRepository
    {
        Task<Event?> GetByIdAsync(int id);
        Task<IEnumerable<Event>> GetAllAsync();
        Task<IEnumerable<Event>> GetActiveEventsAsync();
        Task<IEnumerable<Event>> GetEventsByMonthAsync(int year, int month);
        Task<IEnumerable<Event>> GetUpcomingEventsAsync();
        Task<IEnumerable<Event>> GetEventsByTypeAsync(EventType type);
        Task<Event> AddAsync(Event eventEntity);
        Task UpdateAsync(Event eventEntity);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}