using System.Security.Cryptography;
using Batuara.Application.Auth.Services;
using Batuara.Application.Common.PhoneNumbers;
using Batuara.Application.MemberAuth.Models;
using Batuara.Application.MemberAuth.Services;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.MemberAuth.Services
{
    public class MemberAuthService : IMemberAuthService
    {
        private const int CodeExpirationMinutes = 10;
        private const int MaxAttempts = 5;
        private readonly BatuaraDbContext _db;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IWhatsAppService _whatsAppService;
        private readonly ILogger<MemberAuthService> _logger;

        public MemberAuthService(
            BatuaraDbContext db,
            IPasswordService passwordService,
            IJwtService jwtService,
            IWhatsAppService whatsAppService,
            ILogger<MemberAuthService> logger)
        {
            _db = db;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _whatsAppService = whatsAppService;
            _logger = logger;
        }

        public async Task RequestCodeAsync(MemberRequestCodeRequest request, string? ipAddress, CancellationToken cancellationToken = default)
        {
            var normalizedPhone = PhoneNumberNormalizer.NormalizeBrazilMobile(request.MobilePhone);
            var member = await FindActiveMemberByPhoneAsync(normalizedPhone, cancellationToken);

            if (member == null)
            {
                _logger.LogInformation("Member login code requested for unknown phone ending with {PhoneSuffix}", GetSuffix(normalizedPhone));
                return;
            }

            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
            var entity = new MemberLoginCode(
                member.Id,
                _passwordService.HashPassword(code),
                DateTime.UtcNow.AddMinutes(CodeExpirationMinutes),
                ipAddress);

            _db.MemberLoginCodes.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);
            await _whatsAppService.SendAuthCodeAsync(normalizedPhone, code, cancellationToken);
        }

        public async Task<MemberLoginResponse> VerifyCodeAsync(MemberVerifyCodeRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedPhone = PhoneNumberNormalizer.NormalizeBrazilMobile(request.MobilePhone);
            var member = await FindActiveMemberByPhoneAsync(normalizedPhone, cancellationToken)
                ?? throw new UnauthorizedAccessException("Código inválido ou expirado.");

            var utcNow = DateTime.UtcNow;
            var loginCode = await _db.MemberLoginCodes
                .Where(x => x.HouseMemberId == member.Id && x.ConsumedAt == null)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken)
                ?? throw new UnauthorizedAccessException("Código inválido ou expirado.");

            if (loginCode.IsExpired(utcNow) || loginCode.Attempts >= MaxAttempts)
            {
                throw new UnauthorizedAccessException("Código inválido ou expirado.");
            }

            loginCode.RegisterAttempt();
            if (!_passwordService.VerifyPassword(request.Code, loginCode.CodeHash))
            {
                await _db.SaveChangesAsync(cancellationToken);
                throw new UnauthorizedAccessException("Código inválido ou expirado.");
            }

            loginCode.Consume(utcNow);
            await _db.SaveChangesAsync(cancellationToken);

            var token = _jwtService.GenerateMemberJwtToken(member.Id, member.FullName, member.MobilePhone);
            return new MemberLoginResponse
            {
                Token = token,
                ExpiresAt = _jwtService.GetTokenExpirationTime(token),
                User = new MemberPrincipalDto
                {
                    Id = member.Id,
                    HouseMemberId = member.Id,
                    Name = member.FullName,
                    Email = member.Email ?? string.Empty,
                    Role = UserRole.Member,
                    IsActive = member.IsActive
                }
            };
        }

        private async Task<HouseMember?> FindActiveMemberByPhoneAsync(string normalizedPhone, CancellationToken cancellationToken)
        {
            var candidates = await _db.HouseMembers
                .Where(x => x.IsActive && x.MobilePhone != null)
                .ToListAsync(cancellationToken);

            return candidates.FirstOrDefault(x => PhoneNumberNormalizer.NormalizeBrazilMobile(x.MobilePhone ?? string.Empty) == normalizedPhone);
        }

        private static string GetSuffix(string number)
        {
            return number.Length <= 4 ? number : number[^4..];
        }
    }
}
