using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.MemberAuth.Models;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Infrastructure.Auth.Services;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.HouseMembers.Services;
using Batuara.Infrastructure.MemberAuth.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.MemberAuth
{
    public class MemberAuthServiceTests
    {
        private class FakeWhatsAppService : IWhatsAppService
        {
            public string? LastCode { get; private set; }
            public string? LastPhone { get; private set; }
            public int SendCount { get; private set; }

            public Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default)
            {
                LastPhone = phoneE164;
                LastCode = code;
                SendCount++;
                return Task.CompletedTask;
            }

            public Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default)
            {
                return Task.CompletedTask;
            }

            public Task<string> SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default)
            {
                return Task.FromResult(Guid.NewGuid().ToString());
            }
        }

        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        private static PasswordService CreatePasswordService()
        {
            return new PasswordService(Options.Create(new PasswordRequirements()));
        }

        private static JwtService CreateJwtService()
        {
            var settings = new JwtSettings
            {
                Secret = "test-secret-key-with-at-least-32-characters-long",
                Issuer = "batuara-tests",
                Audience = "batuara-tests",
                AccessTokenExpirationMinutes = 60,
                RefreshTokenExpirationDays = 7
            };

            return new JwtService(Options.Create(settings), NullLogger<JwtService>.Instance);
        }

        private static async Task<HouseMemberDto> CreateMemberAsync(BatuaraDbContext db, string mobilePhone)
        {
            var houseMemberService = new HouseMemberService(db);
            var request = new CreateHouseMemberRequest
            {
                FullName = "Filho da Casa WhatsApp",
                BirthDate = DateTime.UtcNow.Date.AddYears(-25),
                EntryDate = DateTime.UtcNow.Date.AddYears(-1),
                MobilePhone = mobilePhone,
                Contributions = new List<HouseMemberContributionInput>()
            };

            var (created, errors, conflict) = await houseMemberService.CreateAsync(request);
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            created.Should().NotBeNull();
            return created!;
        }

        [Fact]
        public async Task RequestCode_Then_VerifyCode_Should_Return_Valid_Member_Token()
        {
            var db = CreateInMemoryDb();
            var member = await CreateMemberAsync(db, "11999998888");
            var whatsApp = new FakeWhatsAppService();
            var service = new Batuara.Infrastructure.MemberAuth.Services.MemberAuthService(
                db, CreatePasswordService(), CreateJwtService(), whatsApp, NullLogger<Batuara.Infrastructure.MemberAuth.Services.MemberAuthService>.Instance);

            await service.RequestCodeAsync(new MemberRequestCodeRequest { MobilePhone = "11999998888" }, "127.0.0.1");

            whatsApp.SendCount.Should().Be(1);
            whatsApp.LastCode.Should().NotBeNullOrEmpty();
            whatsApp.LastPhone.Should().Be("5511999998888");

            var response = await service.VerifyCodeAsync(new MemberVerifyCodeRequest
            {
                MobilePhone = "11999998888",
                Code = whatsApp.LastCode!
            });

            response.Token.Should().NotBeNullOrEmpty();
            response.User.HouseMemberId.Should().Be(member.Id);
            response.User.Role.Should().Be(Batuara.Domain.Enums.UserRole.Member);

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(response.Token);
            jwt.Claims.Should().Contain(c => c.Type == "houseMemberId" && c.Value == member.Id.ToString());
            jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Member");
        }

        [Fact]
        public async Task VerifyCode_With_Wrong_Code_Should_Throw_Unauthorized()
        {
            var db = CreateInMemoryDb();
            await CreateMemberAsync(db, "11988887777");
            var whatsApp = new FakeWhatsAppService();
            var service = new Batuara.Infrastructure.MemberAuth.Services.MemberAuthService(
                db, CreatePasswordService(), CreateJwtService(), whatsApp, NullLogger<Batuara.Infrastructure.MemberAuth.Services.MemberAuthService>.Instance);

            await service.RequestCodeAsync(new MemberRequestCodeRequest { MobilePhone = "11988887777" }, null);

            var wrongCode = whatsApp.LastCode == "000000" ? "111111" : "000000";

            var act = async () => await service.VerifyCodeAsync(new MemberVerifyCodeRequest
            {
                MobilePhone = "11988887777",
                Code = wrongCode
            });

            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task VerifyCode_With_Expired_Code_Should_Throw_Unauthorized()
        {
            var db = CreateInMemoryDb();
            var member = await CreateMemberAsync(db, "11977776666");
            var passwordService = CreatePasswordService();

            var expiredCode = new MemberLoginCode(
                member.Id,
                passwordService.HashPassword("123456"),
                DateTime.UtcNow.AddMinutes(-1),
                null);
            db.MemberLoginCodes.Add(expiredCode);
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var service = new Batuara.Infrastructure.MemberAuth.Services.MemberAuthService(
                db, passwordService, CreateJwtService(), whatsApp, NullLogger<Batuara.Infrastructure.MemberAuth.Services.MemberAuthService>.Instance);

            var act = async () => await service.VerifyCodeAsync(new MemberVerifyCodeRequest
            {
                MobilePhone = "11977776666",
                Code = "123456"
            });

            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task VerifyCode_After_Max_Attempts_Should_Throw_Unauthorized()
        {
            var db = CreateInMemoryDb();
            var member = await CreateMemberAsync(db, "11966665555");
            var passwordService = CreatePasswordService();

            var code = new MemberLoginCode(
                member.Id,
                passwordService.HashPassword("654321"),
                DateTime.UtcNow.AddMinutes(10),
                null);
            for (var i = 0; i < 5; i++)
            {
                code.RegisterAttempt();
            }
            db.MemberLoginCodes.Add(code);
            await db.SaveChangesAsync();

            var whatsApp = new FakeWhatsAppService();
            var service = new Batuara.Infrastructure.MemberAuth.Services.MemberAuthService(
                db, passwordService, CreateJwtService(), whatsApp, NullLogger<Batuara.Infrastructure.MemberAuth.Services.MemberAuthService>.Instance);

            var act = async () => await service.VerifyCodeAsync(new MemberVerifyCodeRequest
            {
                MobilePhone = "11966665555",
                Code = "654321"
            });

            await act.Should().ThrowAsync<UnauthorizedAccessException>();
        }

        [Fact]
        public async Task RequestCode_For_Unknown_Phone_Should_Not_Throw_Or_Reveal_Enumeration()
        {
            var db = CreateInMemoryDb();
            var whatsApp = new FakeWhatsAppService();
            var service = new Batuara.Infrastructure.MemberAuth.Services.MemberAuthService(
                db, CreatePasswordService(), CreateJwtService(), whatsApp, NullLogger<Batuara.Infrastructure.MemberAuth.Services.MemberAuthService>.Instance);

            var act = async () => await service.RequestCodeAsync(new MemberRequestCodeRequest { MobilePhone = "11900000000" }, null);

            await act.Should().NotThrowAsync();
            whatsApp.SendCount.Should().Be(0);
        }
    }
}
