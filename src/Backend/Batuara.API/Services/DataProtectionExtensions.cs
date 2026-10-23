using Microsoft.AspNetCore.DataProtection;

namespace Batuara.API.Services
{
    public static class DataProtectionExtensions
    {
        public const string KeysPathConfigKey = "DataProtection:KeysPath";

        /// <summary>
        /// Persiste o anel de chaves do Data Protection num diretorio (volume Docker em producao),
        /// para que os dados protegidos sobrevivam a deploys/restarts do container.
        /// Sem <c>DataProtection:KeysPath</c> mantem o comportamento padrao (chaves efemeras no container).
        /// </summary>
        public static IServiceCollection AddBatuaraDataProtection(this IServiceCollection services, IConfiguration configuration)
        {
            var builder = services.AddDataProtection().SetApplicationName("Batuara");

            var keysPath = configuration[KeysPathConfigKey];
            if (!string.IsNullOrWhiteSpace(keysPath))
            {
                Directory.CreateDirectory(keysPath);
                builder.PersistKeysToFileSystem(new DirectoryInfo(keysPath));
            }

            return services;
        }
    }
}
