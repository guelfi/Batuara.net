using Batuara.Application.Common.Models;
using Batuara.Application.Events.Models;
using Batuara.Domain.Entities;

namespace Batuara.Application.Events.Services
{
    public interface IEventService
    {
        Task<PaginatedResponse<EventCardDto>> GetPublicAsync(
            string? q,
            EventType? type,
            DateTime? fromDate,
            DateTime? toDate,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<EventDto?> GetPublicByIdAsync(int id);

        Task<PaginatedResponse<EventDto>> GetAdminAsync(
            string? q,
            EventType? type,
            DateTime? fromDate,
            DateTime? toDate,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort);

        Task<EventDto?> GetByIdAsync(int id);
        Task<(EventDto? Event, string[] Errors, bool Conflict)> CreateAsync(CreateEventRequest request);
        Task<(EventDto? Event, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateEventRequest request, bool isPatch);
        Task<bool> SoftDeleteAsync(int id);
    }
}
