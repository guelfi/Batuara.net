using Batuara.Application.Common.Models;
using Batuara.Application.Orixas.Models;
using Batuara.Application.Orixas.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.Orixas.Services
{
    public class OrixaService : IOrixaService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public OrixaService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<OrixaDto>> GetPublicAsync(string? q)
        {
            var query = _db.Orixas.AsNoTracking().Where(o => o.IsActive);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(o => o.Name.ToLower().Contains(term) || o.Description.ToLower().Contains(term));
            }

            var items = await query
                .OrderBy(o => o.DisplayOrder)
                .ThenBy(o => o.Name)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<OrixaDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _db.Orixas.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id && o.IsActive);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<OrixaDto>> GetAdminAsync(string? q, bool? isActive, int pageNumber, int pageSize, string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = _db.Orixas.AsNoTracking();

            if (isActive.HasValue)
            {
                query = query.Where(o => o.IsActive == isActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(o => o.Name.ToLower().Contains(term) || o.Description.ToLower().Contains(term));
            }

            query = ApplySort(query, sort);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)size);
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<OrixaDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = totalPages
            };
        }

        public async Task<OrixaDto?> GetByIdAsync(int id)
        {
            var entity = await _db.Orixas.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(OrixaDto? Orixa, string[] Errors, bool Conflict)> CreateAsync(CreateOrixaRequest request)
        {
            try
            {
                var duplicate = await _db.Orixas.AsNoTracking()
                    .AnyAsync(o => o.Name.ToLower() == request.Name.Trim().ToLower());
                if (duplicate)
                {
                    return (null, new[] { "Já existe um Orixá com este nome" }, true);
                }

                var entity = new Orixa(
                    request.Name,
                    request.Description,
                    request.Origin,
                    request.BatuaraTeaching,
                    request.Characteristics,
                    request.Colors,
                    request.Elements,
                    request.DisplayOrder,
                    request.ImageUrl
                );

                _db.Orixas.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(OrixaDto? Orixa, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateOrixaRequest request)
        {
            var entity = await _db.Orixas.FirstOrDefaultAsync(o => o.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Orixa not found" }, false);
            }

            try
            {
                if (request.Name != null || request.Description != null || request.Origin != null || request.DisplayOrder.HasValue)
                {
                    var name = request.Name ?? entity.Name;
                    var description = request.Description ?? entity.Description;
                    var origin = request.Origin ?? entity.Origin;
                    var displayOrder = request.DisplayOrder ?? entity.DisplayOrder;
                    entity.UpdateBasicInfo(name, description, origin, displayOrder);
                }

                if (request.BatuaraTeaching != null)
                {
                    entity.UpdateBatuaraTeaching(request.BatuaraTeaching);
                }

                if (request.Characteristics != null)
                {
                    entity.UpdateCharacteristics(request.Characteristics);
                }

                if (request.Colors != null)
                {
                    entity.UpdateColors(request.Colors);
                }

                if (request.Elements != null)
                {
                    entity.UpdateElements(request.Elements);
                }

                if (request.ImageUrl != null)
                {
                    entity.UpdateImage(request.ImageUrl);
                }

                if (request.IsActive.HasValue)
                {
                    if (!request.IsActive.Value)
                    {
                        entity.Deactivate();
                    }
                    else
                    {
                        entity.Activate();
                    }
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
            var entity = await _db.Orixas.FirstOrDefaultAsync(o => o.Id == id);
            if (entity == null) return false;
            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private static OrixaDto MapToDto(Orixa o)
        {
            return new OrixaDto
            {
                Id = o.Id,
                Name = o.Name,
                Description = o.Description,
                Origin = o.Origin,
                BatuaraTeaching = o.BatuaraTeaching,
                ImageUrl = o.ImageUrl,
                DisplayOrder = o.DisplayOrder,
                Characteristics = o.Characteristics,
                Colors = o.Colors,
                Elements = o.Elements,
                IsActive = o.IsActive,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            };
        }

        private static (int Page, int Size) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize) size = MaxPageSize;
            return (page, size);
        }

        private static IQueryable<Orixa> ApplySort(IQueryable<Orixa> query, string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return query.OrderBy(o => o.DisplayOrder).ThenBy(o => o.Name);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var dir = parts.ElementAtOrDefault(1)?.ToLowerInvariant() == "desc" ? "desc" : "asc";
            var asc = dir != "desc";

            return field switch
            {
                "name" => asc ? query.OrderBy(o => o.Name) : query.OrderByDescending(o => o.Name),
                "displayorder" => asc ? query.OrderBy(o => o.DisplayOrder) : query.OrderByDescending(o => o.DisplayOrder),
                "createdat" => asc ? query.OrderBy(o => o.CreatedAt) : query.OrderByDescending(o => o.CreatedAt),
                "updatedat" => asc ? query.OrderBy(o => o.UpdatedAt) : query.OrderByDescending(o => o.UpdatedAt),
                _ => query.OrderBy(o => o.DisplayOrder).ThenBy(o => o.Name)
            };
        }
    }
}
