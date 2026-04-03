using System.Text.RegularExpressions;
using Batuara.Application.Common.Models;
using Batuara.Application.SpiritualContents.Models;
using Batuara.Application.SpiritualContents.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.SpiritualContents.Services
{
    public class SpiritualContentService : ISpiritualContentService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public SpiritualContentService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<PaginatedResponse<SpiritualContentDto>> GetPublicAsync(
            string? q,
            SpiritualContentType? type,
            SpiritualCategory? category,
            bool? featured,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, type, category, featured, true).Where(x => x.IsActive);
            query = ApplySort(query, sort, true);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<SpiritualContentDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<SpiritualContentDto?> GetPublicByIdAsync(int id)
        {
            var entity = await _db.SpiritualContents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<PaginatedResponse<SpiritualContentDto>> GetAdminAsync(
            string? q,
            SpiritualContentType? type,
            SpiritualCategory? category,
            bool? featured,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = BuildQuery(q, type, category, featured, true);
            if (isActive.HasValue)
            {
                query = query.Where(x => x.IsActive == isActive.Value);
            }

            query = ApplySort(query, sort, false);
            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<SpiritualContentDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<SpiritualContentDto?> GetByIdAsync(int id)
        {
            var entity = await _db.SpiritualContents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(SpiritualContentDto? Content, string[] Errors, bool Conflict)> CreateAsync(CreateSpiritualContentRequest request)
        {
            try
            {
                var sanitizedContent = SanitizeContent(request.Content);
                var normalizedTitle = request.Title.Trim().ToLowerInvariant();
                var exists = await _db.SpiritualContents.AsNoTracking().AnyAsync(x =>
                    x.Title.ToLower() == normalizedTitle &&
                    x.Type == request.Type &&
                    x.Category == request.Category &&
                    x.IsActive);

                if (exists)
                {
                    return (null, new[] { "Já existe um conteúdo espiritual ativo com este título, tipo e categoria" }, true);
                }

                var entity = new SpiritualContent(
                    request.Title,
                    sanitizedContent,
                    request.Type,
                    request.Category,
                    request.Source,
                    request.DisplayOrder,
                    request.IsFeatured);

                _db.SpiritualContents.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(SpiritualContentDto? Content, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateSpiritualContentRequest request)
        {
            var entity = await _db.SpiritualContents.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return (null, new[] { "Spiritual content not found" }, false);
            }

            try
            {
                if (request.Title != null || request.Content != null || request.Source != null)
                {
                    entity.UpdateContent(
                        request.Title ?? entity.Title,
                        SanitizeContent(request.Content ?? entity.Content),
                        request.Source ?? entity.Source);
                }

                if (request.Type.HasValue || request.Category.HasValue)
                {
                    entity.UpdateType(request.Type ?? entity.Type, request.Category ?? entity.Category);
                }

                if (request.DisplayOrder.HasValue)
                {
                    entity.UpdateDisplayOrder(request.DisplayOrder.Value);
                }

                if (request.IsFeatured.HasValue)
                {
                    entity.SetFeatured(request.IsFeatured.Value);
                }

                if (request.IsActive.HasValue)
                {
                    if (request.IsActive.Value) entity.Activate();
                    else entity.Deactivate();
                }

                var normalizedTitle = entity.Title.Trim().ToLowerInvariant();
                var exists = await _db.SpiritualContents.AsNoTracking().AnyAsync(x =>
                    x.Id != entity.Id &&
                    x.Title.ToLower() == normalizedTitle &&
                    x.Type == entity.Type &&
                    x.Category == entity.Category &&
                    x.IsActive);

                if (exists)
                {
                    return (null, new[] { "Já existe um conteúdo espiritual ativo com este título, tipo e categoria" }, true);
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
            var entity = await _db.SpiritualContents.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private IQueryable<SpiritualContent> BuildQuery(
            string? q,
            SpiritualContentType? type,
            SpiritualCategory? category,
            bool? featured,
            bool asNoTracking)
        {
            IQueryable<SpiritualContent> query = _db.SpiritualContents;
            if (asNoTracking)
            {
                query = query.AsNoTracking();
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    x.Title.ToLower().Contains(term) ||
                    x.Content.ToLower().Contains(term) ||
                    x.Source.ToLower().Contains(term));
            }

            if (type.HasValue)
            {
                query = query.Where(x => x.Type == type.Value);
            }

            if (category.HasValue)
            {
                query = query.Where(x => x.Category == category.Value);
            }

            if (featured.HasValue)
            {
                query = query.Where(x => x.IsFeatured == featured.Value);
            }

            return query;
        }

        private static IQueryable<SpiritualContent> ApplySort(IQueryable<SpiritualContent> query, string? sort, bool featuredFirst)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return featuredFirst
                    ? query.OrderByDescending(x => x.IsFeatured).ThenBy(x => x.DisplayOrder).ThenBy(x => x.Title)
                    : query.OrderByDescending(x => x.UpdatedAt).ThenByDescending(x => x.IsFeatured);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var direction = parts.ElementAtOrDefault(1)?.ToLowerInvariant() == "desc" ? "desc" : "asc";
            var asc = direction != "desc";

            return field switch
            {
                "title" => asc ? query.OrderBy(x => x.Title) : query.OrderByDescending(x => x.Title),
                "displayorder" => asc ? query.OrderBy(x => x.DisplayOrder) : query.OrderByDescending(x => x.DisplayOrder),
                "type" => asc ? query.OrderBy(x => x.Type) : query.OrderByDescending(x => x.Type),
                "category" => asc ? query.OrderBy(x => x.Category) : query.OrderByDescending(x => x.Category),
                "updatedat" => asc ? query.OrderBy(x => x.UpdatedAt) : query.OrderByDescending(x => x.UpdatedAt),
                _ => query.OrderByDescending(x => x.IsFeatured).ThenBy(x => x.DisplayOrder).ThenBy(x => x.Title)
            };
        }

        private static string SanitizeContent(string content)
        {
            var noScript = Regex.Replace(content, "<script.*?</script>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            return Regex.Replace(noScript, "<.*?>", string.Empty).Trim();
        }

        private static (int Page, int Size) NormalizePaging(int pageNumber, int pageSize)
        {
            var page = pageNumber <= 0 ? 1 : pageNumber;
            var size = pageSize <= 0 ? 20 : pageSize;
            if (size > MaxPageSize) size = MaxPageSize;
            return (page, size);
        }

        private static SpiritualContentDto MapToDto(SpiritualContent entity)
        {
            return new SpiritualContentDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Content = entity.Content,
                Type = entity.Type,
                Category = entity.Category,
                Source = entity.Source,
                DisplayOrder = entity.DisplayOrder,
                IsFeatured = entity.IsFeatured,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
