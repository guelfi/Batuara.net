using System.Security.Cryptography;
using System.Text;

namespace Batuara.API.Services
{
    /// <summary>
    /// Assinatura do QR de mesa: o link (?mesa=N&amp;s=assinatura) só trava a mesa no cliente
    /// quando a assinatura confere, então alterar o número na URL invalida o QR.
    /// </summary>
    public static class BingoMesaSignature
    {
        public static string Sign(IConfiguration configuration, int mesa)
        {
            var secret = configuration["JwtSettings:Secret"] ?? string.Empty;
            var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"bingo-mesa:{mesa}"));
            return Convert.ToHexString(hash)[..16].ToLowerInvariant();
        }

        public static bool IsValid(IConfiguration configuration, int mesa, string? signature)
        {
            if (string.IsNullOrEmpty(signature) || mesa <= 0)
            {
                return false;
            }

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(Sign(configuration, mesa)), Encoding.UTF8.GetBytes(signature));
        }
    }
}
