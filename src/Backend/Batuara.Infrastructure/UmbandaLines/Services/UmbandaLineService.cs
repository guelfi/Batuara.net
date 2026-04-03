using Batuara.Application.Common.Models;
using Batuara.Application.UmbandaLines.Models;
using Batuara.Application.UmbandaLines.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.UmbandaLines.Services
{
    public class UmbandaLineService : IUmbandaLineService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public UmbandaLineService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<PaginatedResponse<UmbandaLineDto>> GetPublicAsync(
            string? q,
            string? entity,
            string? workingDay,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, true).Where(x => x.IsActive);
            var items = await query.ToListAsync();
            items = ApplyCollectionFilters(items, entity, workingDay);
            items = ApplySort(items.AsQueryable(), sort).ToList();
            var totalCount = items.Count;
            items = items.Skip((page - 1) * size).Take(size).ToList();

            return new PaginatedResponse<UmbandaLineDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<UmbandaLineDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _db.UmbandaLines.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<UmbandaLineDto>> GetAdminAsync(
            string? q,
            string? entity,
            string? workingDay,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, true);
            if (isActive.HasValue)
            {
                query = query.Where(x => x.IsActive == isActive.Value);
            }

            var items = await query.ToListAsync();
            items = ApplyCollectionFilters(items, entity, workingDay);
            items = ApplySort(items.AsQueryable(), sort).ToList();
            var totalCount = items.Count;
            items = items.Skip((page - 1) * size).Take(size).ToList();

            return new PaginatedResponse<UmbandaLineDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<UmbandaLineDto?> GetByIdAsync(int id)
        {
            var entity = await _db.UmbandaLines.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(UmbandaLineDto? Line, string[] Errors, bool Conflict)> CreateAsync(CreateUmbandaLineRequest request)
        {
            try
            {
                var normalizedName = request.Name.Trim().ToLowerInvariant();
                var exists = await _db.UmbandaLines.AsNoTracking().AnyAsync(x => x.Name.ToLower() == normalizedName && x.IsActive);
                if (exists)
                {
                    return (null, new[] { "Já existe uma linha de Umbanda ativa com este nome" }, true);
                }

                var entity = new UmbandaLine(
                    request.Name,
                    request.Description,
                    request.Characteristics,
                    request.BatuaraInterpretation,
                    request.Entities,
                    request.WorkingDays,
                    request.DisplayOrder);

                _db.UmbandaLines.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(UmbandaLineDto? Line, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateUmbandaLineRequest request)
        {
            var entity = await _db.UmbandaLines.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Umbanda line not found" }, false);
            }

            try
            {
                if (request.Name != null || request.Description != null || request.Characteristics != null || request.DisplayOrder.HasValue)
                {
                    entity.UpdateBasicInfo(
                        request.Name ?? entity.Name,
                        request.Description ?? entity.Description,
                        request.Characteristics ?? entity.Characteristics,
                        request.DisplayOrder ?? entity.DisplayOrder);
                }

                if (request.BatuaraInterpretation != null)
                {
                    entity.UpdateBatuaraInterpretation(request.BatuaraInterpretation);
                }

                if (request.Entities != null)
                {
                    entity.UpdateEntities(request.Entities);
                }

                if (request.WorkingDays != null)
                {
                    entity.UpdateWorkingDays(request.WorkingDays);
                }

                if (request.IsActive.HasValue)
                {
                    if (request.IsActive.Value) entity.Activate();
                    else entity.Deactivate();
                }

                var normalizedName = entity.Name.Trim().ToLowerInvariant();
                var exists = await _db.UmbandaLines.AsNoTracking()
                    .AnyAsync(x => x.Id != entity.Id && x.Name.ToLower() == normalizedName && x.IsActive);

                if (exists)
                {
                    return (null, new[] { "Já existe uma linha de Umbanda ativa com este nome" }, true);
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
            var entity = await _db.UmbandaLines.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private IQueryable<UmbandaLine> BuildQuery(string? q, bool asNoTracking)
        {
            IQueryable<UmbandaLine> query = _db.UmbandaLines;
            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    x.Name.ToLower().Contains(term) ||
                    x.Description.ToLower().Contains(term) ||
                    x.Characteristics.ToLower().Contains(term) ||
                    x.BatuaraInterpretation.ToLower().Contains(term));
            }

            return query;
        }

        private static List<UmbandaLine> ApplyCollectionFilters(List<UmbandaLine> items, string? entity, string? workingDay)
        {
            var filtered = items.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(entity))
            {
                var entityTerm = entity.Trim().ToLowerInvariant();
                filtered = filtered.Where(x => x.Entities.Any(item => item.ToLowerInvariant().Contains(entityTerm)));
            }

            if (!string.IsNullOrWhiteSpace(workingDay))
            {
                var dayTerm = workingDay.Trim().ToLowerInvariant();
                filtered = filtered.Where(x => x.WorkingDays.Any(item => item.ToLowerInvariant().Contains(dayTerm)));
            }

            return filtered.ToList();
        }

        private static IQueryable<UmbandaLine> ApplySort(IQueryable<UmbandaLine> query, string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return query.OrderBy(x => x.DisplayOrder).ThenBy(x => x.Name);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var direction = parts.ElementAtOrDefault(1)?.ToLowerInvariant() == "desc" ? "desc" : "asc";
            var asc = direction != "desc";

            return field switch
            {
                "name" => asc ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name),
                "displayorder" => asc ? query.OrderBy(x => x.DisplayOrder) : query.OrderByDescending(x => x.DisplayOrder),
                "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                _ => query.OrderBy(x => x.DisplayOrder).ThenBy(x => x.Name)
            };
        }

        private static (int Page, int Size) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize) size = MaxPageSize;
            return (page, size);
        }

        private static UmbandaLineDto MapToDto(UmbandaLine entity)
        {
            return new UmbandaLineDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Characteristics = entity.Characteristics,
                BatuaraInterpretation = entity.BatuaraInterpretation,
                DisplayOrder = entity.DisplayOrder,
                Entities = entity.Entities,
                WorkingDays = entity.WorkingDays,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
