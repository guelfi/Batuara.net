using Batuara.Application.Common.Models;
using Batuara.Application.Guides.Models;
using Batuara.Application.Guides.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Guides.Services
{
    public class GuideService : IGuideService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public GuideService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<GuideDto>> GetPublicAsync(string? q, string? specialty)
        {
            var query = BuildFilterQuery(_db.Guides.AsNoTracking().Where(x => x.IsActive), q);
            var items = await query
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.Name)
                .ToListAsync();

            return ApplyPostFilters(items, q, specialty).Select(MapToDto).ToList();
        }

        public async Task<GuideDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _db.Guides.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<GuideDto>> GetAdminAsync(string? q, string? specialty, bool? isActive, int pageNumber, int pageSize, string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = _db.Guides.AsNoTracking().AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(x => x.IsActive == isActive.Value);
            }

            query = BuildFilterQuery(query, q);
            query = ApplySort(query, sort);

            var items = await query.ToListAsync();
            var filteredItems = ApplyPostFilters(items, q, specialty).ToList();
            var totalCount = filteredItems.Count;
            var pagedItems = filteredItems.Skip((page - 1) * size).Take(size).ToList();

            return new PaginatedResponse<GuideDto>
            {
                Data = pagedItems.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<GuideDto?> GetByIdAsync(int id)
        {
            var entity = await _db.Guides.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(GuideDto? Guide, string[] Errors, bool Conflict)> CreateAsync(CreateGuideRequest request)
        {
            try
            {
                var normalizedName = request.Name.Trim().ToLower();
                var duplicate = await _db.Guides.AsNoTracking().AnyAsync(x => x.Name.ToLower() == normalizedName);
                if (duplicate)
                {
                    return (null, new[] { "Já existe um guia ou entidade com este nome." }, true);
                }

                var entity = new GuideEntity(
                    request.Name,
                    request.Description,
                    request.Specialties,
                    NormalizeDateOnlyUtc(request.EntryDate),
                    request.DisplayOrder,
                    request.PhotoUrl,
                    request.Email,
                    request.Phone,
                    request.Whatsapp);

                _db.Guides.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(GuideDto? Guide, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateGuideRequest request)
        {
            var entity = await _db.Guides.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Guide not found" }, false);
            }

            try
            {
                var normalizedName = request.Name.Trim().ToLower();
                var duplicate = await _db.Guides.AsNoTracking().AnyAsync(x => x.Id != id && x.Name.ToLower() == normalizedName);
                if (duplicate)
                {
                    return (null, new[] { "Já existe um guia ou entidade com este nome." }, true);
                }

                entity.UpdateContent(
                    request.Name,
                    request.Description,
                    request.Specialties,
                    request.DisplayOrder,
                    request.PhotoUrl);
                entity.UpdateEntryDate(NormalizeDateOnlyUtc(request.EntryDate));
                entity.UpdateContacts(request.Email, request.Phone, request.Whatsapp);

                if (request.IsActive)
                {
                    entity.Activate();
                }
                else
                {
                    entity.Deactivate();
                }

                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var entity = await _db.Guides.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private static IQueryable<GuideEntity> BuildFilterQuery(IQueryable<GuideEntity> query, string? q)
        {
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(term) ||
                    x.Description.ToLower().Contains(term) ||
                    (x.Email != null && x.Email.ToLower().Contains(term)) ||
                    (x.Phone != null && x.Phone.ToLower().Contains(term)));
            }

            return query;
        }

        private static IEnumerable<GuideEntity> ApplyPostFilters(IEnumerable<GuideEntity> items, string? q, string? specialty)
        {
            var query = items;

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x => x.Specialties.Any(item => item.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                    x.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    x.Description.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrWhiteSpace(x.Email) && x.Email.Contains(term, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrWhiteSpace(x.Phone) && x.Phone.Contains(term, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrWhiteSpace(specialty))
            {
                query = query.Where(x => x.Specialties.Any(item => item.Contains(specialty, StringComparison.OrdinalIgnoreCase)));
            }

            return query;
        }

        private static GuideDto MapToDto(GuideEntity entity)
        {
            return new GuideDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                PhotoUrl = entity.PhotoUrl,
                Specialties = entity.Specialties,
                EntryDate = NormalizeDateOnlyUtc(entity.EntryDate),
                Email = entity.Email,
                Phone = entity.Phone,
                Whatsapp = entity.Whatsapp,
                DisplayOrder = entity.DisplayOrder,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        private static IQueryable<GuideEntity> ApplySort(IQueryable<GuideEntity> query, string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return query.OrderBy(x => x.DisplayOrder).ThenBy(x => x.Name);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var asc = parts.ElementAtOrDefault(1)?.ToLowerInvariant() != "desc";

            return field switch
            {
                "name" => asc ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name),
                "entrydate" => asc ? query.OrderBy(x => x.EntryDate) : query.OrderByDescending(x => x.EntryDate),
                "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                _ => asc ? query.OrderBy(x => x.DisplayOrder).ThenBy(x => x.Name) : query.OrderByDescending(x => x.DisplayOrder).ThenBy(x => x.Name)
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

        private static DateTime NormalizeDateOnlyUtc(DateTime value)
        {
            return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
        }
    }
}
