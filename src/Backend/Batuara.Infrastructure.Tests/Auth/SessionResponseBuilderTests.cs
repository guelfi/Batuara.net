using System;
using System.Text.Json;
using Batuara.API.Services;
using Batuara.Application.Auth.Models;
using Batuara.Application.MemberAuth.Models;
using FluentAssertions;
using Xunit;

namespace Batuara.Infrastructure.Tests.Auth
{
    public class SessionResponseBuilderTests
    {
        private static LoginResponse UserLogin() => new()
        {
            AccessToken = "ACCESS-SECRET",
            RefreshToken = "REFRESH-SECRET",
            TokenExpiration = new DateTime(2026, 10, 24, 0, 0, 0, DateTimeKind.Utc),
            User = new UserDto { Id = 1, Email = "a@b.c", Name = "Admin" }
        };

        private static MemberLoginResponse MemberLogin() => new()
        {
            Token = "MEMBER-SECRET",
            ExpiresAt = new DateTime(2026, 10, 24, 0, 0, 0, DateTimeKind.Utc),
            User = new MemberPrincipalDto { Id = 1, HouseMemberId = 1, Name = "Filho" }
        };

        [Fact]
        public void ForUser_ByDefault_DoesNotExposeTokensInJson()
        {
            var json = JsonSerializer.Serialize(SessionResponseBuilder.ForUser(UserLogin(), returnTokensInBody: false));

            json.Should().NotContain("ACCESS-SECRET").And.NotContain("REFRESH-SECRET");
            json.Should().NotContain("token", because: "nenhum campo de token deve existir no corpo");
            json.Should().Contain("expiresAt").And.Contain("Admin");
        }

        [Fact]
        public void ForUser_WhenEnabled_IncludesTokens()
        {
            var json = JsonSerializer.Serialize(SessionResponseBuilder.ForUser(UserLogin(), returnTokensInBody: true));

            json.Should().Contain("ACCESS-SECRET").And.Contain("REFRESH-SECRET");
        }

        [Fact]
        public void ForMember_ByDefault_DoesNotExposeToken()
        {
            var json = JsonSerializer.Serialize(SessionResponseBuilder.ForMember(MemberLogin(), returnTokensInBody: false));

            json.Should().NotContain("MEMBER-SECRET");
            json.Should().NotContain("token");
            json.Should().Contain("Filho");
        }

        [Fact]
        public void ForMember_WhenEnabled_IncludesToken()
        {
            var json = JsonSerializer.Serialize(SessionResponseBuilder.ForMember(MemberLogin(), returnTokensInBody: true));

            json.Should().Contain("MEMBER-SECRET");
        }

        [Fact]
        public void AuthCookieSettings_DefaultsToNotReturningTokens()
        {
            new AuthCookieSettings().ReturnTokensInBody.Should().BeFalse();
        }
    }
}
