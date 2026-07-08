using Batuara.Application.MemberAuth.Models;

namespace Batuara.Application.MemberAuth.Services
{
    public interface IMemberAuthService
    {
        Task RequestCodeAsync(MemberRequestCodeRequest request, string? ipAddress, CancellationToken cancellationToken = default);
        Task<MemberLoginResponse> VerifyCodeAsync(MemberVerifyCodeRequest request, CancellationToken cancellationToken = default);
    }
}
