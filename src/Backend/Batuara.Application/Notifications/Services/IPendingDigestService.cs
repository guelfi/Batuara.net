namespace Batuara.Application.Notifications.Services
{
    public interface IPendingDigestService
    {
        /// <summary>
        /// Avalia se ha novidade desde o ultimo digest e, havendo, chama <paramref name="send"/> com o total
        /// pendente. O estado so e gravado se o envio terminar sem excecao. Retorna o total enviado, ou null
        /// quando nada foi enviado.
        /// </summary>
        Task<int?> RunAsync(Func<int, CancellationToken, Task> send, CancellationToken cancellationToken = default);
    }
}
