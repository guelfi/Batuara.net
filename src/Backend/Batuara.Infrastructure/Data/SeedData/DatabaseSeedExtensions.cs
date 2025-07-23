using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Batuara.Infrastructure.Data.SeedData
{
    public static class DatabaseSeedExtensions
    {
        /// <summary>
        /// Executa o seed data da Casa de Caridade Batuara
        /// </summary>
        /// <param name="serviceProvider">Service provider da aplicação</param>
        /// <returns>Task</returns>
        public static async Task SeedBatuaraDataAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BatuaraDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<BatuaraDbContext>>();

            await BatuaraSeedData.SeedAsync(context, logger);
        }

        /// <summary>
        /// Executa o seed data da Casa de Caridade Batuara com contexto específico
        /// </summary>
        /// <param name="context">Contexto do banco de dados</param>
        /// <param name="logger">Logger para registrar operações</param>
        /// <returns>Task</returns>
        public static async Task SeedBatuaraDataAsync(this BatuaraDbContext context, ILogger logger)
        {
            await BatuaraSeedData.SeedAsync(context, logger);
        }
    }
}