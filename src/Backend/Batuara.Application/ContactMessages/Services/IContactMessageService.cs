using Batuara.Application.Common.Models;
using Batuara.Application.ContactMessages.Models;
using Batuara.Domain.Enums;

namespace Batuara.Application.ContactMessages.Services
{
    public interface IContactMessageService
    {
        Task<PaginatedResponse<ContactMessageDto>> GetAdminAsync(
            string? q,
            ContactMessageStatus? status,
            DateTime? fromDate,
            DateTime? toDate,
            int pageNumber,
            int pageSize,
            string? sort);
        Task<ContactMessageDto?> GetByIdAsync(int id);
        Task<(ContactMessageDto? Message, string[] Errors, bool Conflict)> CreatePublicAsync(CreateContactMessageRequest request);
        Task<(ContactMessageDto? Message, string[] Errors)> UpdateStatusAsync(int id, UpdateContactMessageStatusRequest request);
    }
}
