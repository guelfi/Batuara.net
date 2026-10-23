using System;
using System.Collections.Generic;
using System.IO;
using Batuara.API.Services;
using FluentAssertions;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Batuara.Infrastructure.Tests.Auth
{
    public class DataProtectionExtensionsTests
    {
        private static IDataProtector CreateProtector(string? keysPath)
        {
            var settings = new Dictionary<string, string?>();
            if (keysPath != null) settings[DataProtectionExtensions.KeysPathConfigKey] = keysPath;
            var config = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();

            var services = new ServiceCollection();
            services.AddBatuaraDataProtection(config);
            return services.BuildServiceProvider().GetRequiredService<IDataProtectionProvider>().CreateProtector("teste");
        }

        [Fact]
        public void WithKeysPath_DataProtectedBeforeRestartCanBeReadAfter()
        {
            var dir = Path.Combine(Path.GetTempPath(), "batuara-dp-" + Guid.NewGuid());
            try
            {
                var payload = CreateProtector(dir).Protect("segredo");

                // "novo container": provider novo apontando para o mesmo volume
                CreateProtector(dir).Unprotect(payload).Should().Be("segredo");
                Directory.GetFiles(dir, "key-*.xml").Should().NotBeEmpty();
            }
            finally
            {
                if (Directory.Exists(dir)) Directory.Delete(dir, recursive: true);
            }
        }
    }
}
