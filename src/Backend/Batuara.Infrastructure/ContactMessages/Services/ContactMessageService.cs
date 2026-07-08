using Batuara.Application.Common.Models;
using Batuara.Application.ContactMessages.Models;
using Batuara.Application.ContactMessages.Services;
using Batuara.Application.Notifications.Services;
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
        private readonly IWhatsAppService _whatsAppService;

        public ContactMessageService(BatuaraDbContext db, IWhatsAppService whatsAppService)
        {
            _db = db;
            _whatsAppService = whatsAppService;
        }

        public async Task<PaginatedResponse<ContactMessageDto>> GetAdminAsync(
            string? q,
            ContactMessageStatus? status,
            bool? isRead,
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

            if (isRead.HasValue)
            {
                query = query.Where(x => x.IsRead == isRead.Value);
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
                if (request.WantsWhatsAppResponse && string.IsNullOrWhiteSpace(request.Phone))
                {
                    return (null, new[] { "Telefone é obrigatório para receber resposta por WhatsApp." }, false);
                }

                var entity = new ContactMessage(request.Name, request.Email, request.Subject, request.Message, request.Phone, request.WantsWhatsAppResponse);
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

        public async Task<int> GetUnreadCountAsync()
        {
            return await _db.ContactMessages.CountAsync(x => !x.IsRead);
        }

        public async Task<(ContactMessageDto? Message, string[] Errors)> MarkAsReadAsync(int id, bool isRead)
        {
            var entity = await _db.ContactMessages.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Contact message not found" });
            }

            if (isRead)
                entity.MarkAsRead();
            else
                entity.MarkAsUnread();

            await _db.SaveChangesAsync();
            return (MapToDto(entity), Array.Empty<string>());
        }

        public async Task<(ContactMessageDto? Message, string[] Errors)> SendWhatsAppResponseAsync(int id, SendContactWhatsAppResponseRequest request, CancellationToken cancellationToken = default)
        {
            var entity = await _db.ContactMessages.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            if (entity == null)
            {
                return (null, new[] { "Contact message not found" });
            }

            if (!entity.WantsWhatsAppResponse)
            {
                return (null, new[] { "O visitante não autorizou resposta por WhatsApp." });
            }

            if (string.IsNullOrWhiteSpace(entity.Phone))
            {
                return (null, new[] { "A mensagem não possui telefone para resposta por WhatsApp." });
            }

            if (string.IsNullOrWhiteSpace(request.ResponseText))
            {
                return (null, new[] { "Informe a resposta a ser enviada." });
            }

            try
            {
                await _whatsAppService.SendContactResponseAsync(entity.Phone, request.ResponseText, cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                return (null, new[] { ex.Message });
            }

            entity.MarkWhatsAppResponseSent(request.ResponseText, DateTime.UtcNow);
            await _db.SaveChangesAsync(cancellationToken);
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
                IsRead = entity.IsRead,
                WantsWhatsAppResponse = entity.WantsWhatsAppResponse,
                WhatsAppResponseSentAt = entity.WhatsAppResponseSentAt,
                WhatsAppResponseText = entity.WhatsAppResponseText,
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
