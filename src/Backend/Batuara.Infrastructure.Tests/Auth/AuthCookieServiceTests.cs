using System;
using System.IO;
using Batuara.API.Services;
using Batuara.Application.Auth.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.Auth
{
    public class AuthCookieServiceTests
    {
        private sealed class FakeEnvironment : IHostEnvironment
        {
            public FakeEnvironment(string name) { EnvironmentName = name; }
            public string EnvironmentName { get; set; }
            public string ApplicationName { get; set; } = "Batuara.API";
            public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
            public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        }

        private static AuthCookieSettings ShippedSettings()
        {
            var path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
            File.Exists(path).Should().BeTrue("o appsettings.json da API deve ser copiado para a saida dos testes");
            return new ConfigurationBuilder().AddJsonFile(path).Build()
                .GetSection(AuthCookieSettings.SectionName).Get<AuthCookieSettings>()!;
        }

        [Fact]
        public void ShippedAppsettings_UsesSameSiteStrict()
        {
            ShippedSettings().SameSite.Should().Be("Strict");
        }

        [Fact]
        public void SetAccessToken_InProduction_EmitsHttpOnlySecureStrictCookie()
        {
            var service = new AuthCookieService(Options.Create(ShippedSettings()), new FakeEnvironment(Environments.Production));
            var context = new DefaultHttpContext();

            service.SetAccessToken(context.Response, "jwt", DateTime.UtcNow.AddHours(1));

            var header = context.Response.Headers["Set-Cookie"].ToString().ToLowerInvariant();
            header.Should().Contain("httponly").And.Contain("secure").And.Contain("samesite=strict");
        }
    }
}
