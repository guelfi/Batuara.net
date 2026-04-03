using Batuara.Application.Common.Models;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.HouseMembers.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Batuara.Infrastructure.HouseMembers.Services
{
    public class HouseMemberService : IHouseMemberService
    {
        private const int MaxPageSize = 100;
        private readonly BatuaraDbContext _db;

        public HouseMemberService(BatuaraDbContext db)
        {
            _db = db;
        }

        public async Task<PaginatedResponse<HouseMemberDto>> GetAdminAsync(string? q, string? city, string? state, bool? isActive, int pageNumber, int pageSize, string? sort)
        {
            var (page, size) = NormalizePaging(pageNumber, pageSize);
            var query = _db.HouseMembers
                .AsNoTracking()
                .Include(x => x.Contributions)
                .AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(x => x.IsActive == isActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(x =>
                    x.FullName.ToLower().Contains(term) ||
                    x.Email.ToLower().Contains(term) ||
                    x.MobilePhone.ToLower().Contains(term) ||
                    x.HeadOrixaFront.ToLower().Contains(term) ||
                    x.HeadOrixaBack.ToLower().Contains(term) ||
                    x.HeadOrixaRonda.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(city))
            {
                var cityTerm = city.Trim().ToLower();
                query = query.Where(x => x.City.ToLower().Contains(cityTerm));
            }

            if (!string.IsNullOrWhiteSpace(state))
            {
                var stateTerm = state.Trim().ToLower();
                query = query.Where(x => x.State.ToLower().Contains(stateTerm));
            }

            query = ApplySort(query, sort);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

            return new PaginatedResponse<HouseMemberDto>
            {
                Data = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = size,
                TotalPages = (int)Math.Ceiling(totalCount / (double)size)
            };
        }

        public async Task<HouseMemberDto?> GetByIdAsync(int id)
        {
            var entity = await _db.HouseMembers
                .AsNoTracking()
                .Include(x => x.Contributions)
                .FirstOrDefaultAsync(x => x.Id == id);

            return entity == null ? null : MapToDto(entity);
        }

        public async Task<(HouseMemberDto? Member, string[] Errors, bool Conflict)> CreateAsync(CreateHouseMemberRequest request)
        {
            try
            {
                var normalizedEmail = request.Email.Trim().ToLower();
                var duplicate = await _db.HouseMembers.AsNoTracking().AnyAsync(x => x.Email.ToLower() == normalizedEmail);
                if (duplicate)
                {
                    return (null, new[] { "Já existe um filho da casa com este e-mail." }, true);
                }

                var entity = new HouseMember(
                    request.FullName,
                    NormalizeDateOnlyUtc(request.BirthDate),
                    NormalizeDateOnlyUtc(request.EntryDate),
                    request.HeadOrixaFront,
                    request.HeadOrixaBack,
                    request.HeadOrixaRonda,
                    request.Email,
                    request.MobilePhone,
                    request.ZipCode,
                    request.Street,
                    request.Number,
                    request.Complement,
                    request.District,
                    request.City,
                    request.State);

                SyncContributions(entity, request.Contributions);
                _db.HouseMembers.Add(entity);
                await _db.SaveChangesAsync();
                return (MapToDto(entity), Array.Empty<string>(), false);
            }
            catch (ArgumentException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
            catch (InvalidOperationException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<(HouseMemberDto? Member, string[] Errors, bool Conflict)> UpdateAsync(int id, UpdateHouseMemberRequest request)
        {
            var entity = await _db.HouseMembers
                .Include(x => x.Contributions)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (entity == null)
            {
                return (null, new[] { "House member not found" }, false);
            }

            try
            {
                var normalizedEmail = request.Email.Trim().ToLower();
                var duplicate = await _db.HouseMembers.AsNoTracking().AnyAsync(x => x.Id != id && x.Email.ToLower() == normalizedEmail);
                if (duplicate)
                {
                    return (null, new[] { "Já existe um filho da casa com este e-mail." }, true);
                }

                entity.UpdateProfile(
                    request.FullName,
                    NormalizeDateOnlyUtc(request.BirthDate),
                    NormalizeDateOnlyUtc(request.EntryDate),
                    request.HeadOrixaFront,
                    request.HeadOrixaBack,
                    request.HeadOrixaRonda,
                    request.Email,
                    request.MobilePhone);
                entity.UpdateAddress(
                    request.ZipCode,
                    request.Street,
                    request.Number,
                    request.Complement,
                    request.District,
                    request.City,
                    request.State);

                SyncContributions(entity, request.Contributions);

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
            catch (InvalidOperationException ex)
            {
                return (null, new[] { ex.Message }, false);
            }
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var entity = await _db.HouseMembers.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                return false;
            }

            entity.Deactivate();
            await _db.SaveChangesAsync();
            return true;
        }

        private static void SyncContributions(HouseMember entity, IReadOnlyCollection<HouseMemberContributionInput> requested)
        {
            var requestedIds = requested.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToHashSet();
            var existingIds = entity.Contributions.Select(x => x.Id).ToList();

            foreach (var existingId in existingIds.Where(id => id > 0 && !requestedIds.Contains(id)))
            {
                entity.RemoveContribution(existingId);
            }

            foreach (var item in requested.OrderBy(x => x.ReferenceMonth))
            {
                if (item.Id.HasValue && item.Id.Value > 0)
                {
                    entity.UpdateContribution(
                        item.Id.Value,
                        NormalizeDateOnlyUtc(item.ReferenceMonth),
                        NormalizeDateOnlyUtc(item.DueDate),
                        item.Amount,
                        item.Status,
                        NormalizeNullableDateOnlyUtc(item.PaidAt),
                        item.Notes);
                    continue;
                }

                var contribution = entity.AddContribution(
                    NormalizeDateOnlyUtc(item.ReferenceMonth),
                    NormalizeDateOnlyUtc(item.DueDate),
                    item.Amount,
                    item.Notes);
                if (item.Status == ContributionPaymentStatus.Paid)
                {
                    contribution.MarkAsPaid(NormalizeDateOnlyUtc(item.PaidAt ?? DateTime.UtcNow));
                }
            }
        }

        private static HouseMemberDto MapToDto(HouseMember entity)
        {
            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var currentContribution = entity.Contributions
                .OrderByDescending(x => x.ReferenceMonth)
                .FirstOrDefault(x => x.ReferenceMonth == currentMonthStart);

            return new HouseMemberDto
            {
                Id = entity.Id,
                FullName = entity.FullName,
                BirthDate = NormalizeDateOnlyUtc(entity.BirthDate),
                EntryDate = NormalizeDateOnlyUtc(entity.EntryDate),
                HeadOrixaFront = entity.HeadOrixaFront,
                HeadOrixaBack = entity.HeadOrixaBack,
                HeadOrixaRonda = entity.HeadOrixaRonda,
                Email = entity.Email,
                MobilePhone = entity.MobilePhone,
                ZipCode = entity.ZipCode,
                Street = entity.Street,
                Number = entity.Number,
                Complement = entity.Complement,
                District = entity.District,
                City = entity.City,
                State = entity.State,
                CurrentMonthContributionStatus = currentContribution?.Status,
                CurrentMonthDueDate = NormalizeNullableDateOnlyUtc(currentContribution?.DueDate),
                CurrentMonthPaidAt = NormalizeNullableDateOnlyUtc(currentContribution?.PaidAt),
                Contributions = entity.Contributions
                    .OrderByDescending(x => x.ReferenceMonth)
                    .Select(x => new HouseMemberContributionDto
                    {
                        Id = x.Id,
                        ReferenceMonth = NormalizeDateOnlyUtc(x.ReferenceMonth),
                        DueDate = NormalizeDateOnlyUtc(x.DueDate),
                        Amount = x.Amount,
                        Status = x.Status,
                        PaidAt = NormalizeNullableDateOnlyUtc(x.PaidAt),
                        Notes = x.Notes
                    })
                    .ToList(),
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        private static IQueryable<HouseMember> ApplySort(IQueryable<HouseMember> query, string? sort)
        {
            if (string.IsNullOrWhiteSpace(sort))
            {
                return query.OrderBy(x => x.FullName);
            }

            var parts = sort.Trim().Split(':', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var field = parts.ElementAtOrDefault(0)?.ToLowerInvariant();
            var asc = parts.ElementAtOrDefault(1)?.ToLowerInvariant() != "desc";

            return field switch
            {
                "entrydate" => asc ? query.OrderBy(x => x.EntryDate) : query.OrderByDescending(x => x.EntryDate),
                "birthdate" => asc ? query.OrderBy(x => x.BirthDate) : query.OrderByDescending(x => x.BirthDate),
                "city" => asc ? query.OrderBy(x => x.City).ThenBy(x => x.FullName) : query.OrderByDescending(x => x.City).ThenBy(x => x.FullName),
                "createdat" => asc ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt),
                _ => asc ? query.OrderBy(x => x.FullName) : query.OrderByDescending(x => x.FullName)
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

        private static DateTime? NormalizeNullableDateOnlyUtc(DateTime? value)
        {
            return value.HasValue ? NormalizeDateOnlyUtc(value.Value) : null;
        }
    }
}
