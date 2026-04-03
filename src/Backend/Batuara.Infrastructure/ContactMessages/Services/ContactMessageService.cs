using Batuara.Application.Common.Models;
using Batuara.Application.ContactMessages.Models;
using Batuara.Application.ContactMessages.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.ContactMessages.Services
{
    public class ContactMessageService : IContactMessageService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public ContactMessageService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<PaginatedResponse<ContactMessageDto>> GetAdminAsync(
            string? q,
            ContactMessageStatus? status,
            DateTime? fromDate,
            DateTime? toDate,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = _db.ContactMessages.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(term) ||
                    x.Email.ToLower().Contains(term) ||
                    x.Subject.ToLower().Contains(term) ||
                    x.Message.ToLower().Contains(term));
            }

            if (status.HasValue)
            {
                query = query.Where(x => x.Status == status.Value);
            }

            if (fromDate.HasValue)
            {
                var start = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Utc);
                query = query.Where(x => x.ReceivedAt >= start);
            }

            if (toDate.HasValue)
            {
                var end = DateTime.SpecifyKind(toDate.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
                query = query.Where(x => x.ReceivedAt <= end);
            }

            query = ApplySort(query, sort);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<ContactMessageDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<ContactMessageDto?> GetByIdAsync(int id)
        {
            var entity = await _db.ContactMessages.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(ContactMessageDto? Message, string[] Errors, bool Conflict)> CreatePublicAsync(CreateContactMessageRequest request)
        {
            try
            {
                var entity = new ContactMessage(request.Name, request.Email, request.Subject, request.Message, request.Phone);
                _db.ContactMessages.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(ContactMessageDto? Message, string[] Errors)> UpdateStatusAsync(int id, UpdateContactMessageStatusRequest request)
        {
            var entity = await _db.ContactMessages.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Contact message not found" });
            }

            entity.UpdateStatus(request.Status, request.AdminNotes);
            await _db.SaveChangesAsync();
            return (MapToDto(entity), Array.Empty<string>());
        }

        private static ContactMessageDto MapToDto(ContactMessage entity)
        {
            return new ContactMessageDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Email = entity.Email,
                Phone = entity.Phone,
                Subject = entity.Subject,
                Message = entity.Message,
                Status = entity.Status,
                AdminNotes = entity.AdminNotes,
                ReceivedAt = entity.ReceivedAt,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        private static IQueryable<ContactMessage> ApplySort(IQueryable<ContactMessage> query, string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return query.OrderByDescending(x => x.ReceivedAt);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var asc = parts.ElementAtOrDefault(1)?.ToLowerInvariant() != "desc";

            return field switch
            {
                "name" => asc ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name),
                "status" => asc ? query.OrderBy(x => x.Status) : query.OrderByDescending(x => x.Status),
                "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                _ => asc ? query.OrderBy(x => x.ReceivedAt) : query.OrderByDescending(x => x.ReceivedAt)
            };
        }

        private static (int Page, int Size) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize)
            {
                size = MaxPageSize;
            }

            return (page, size);
        }
    }
}
