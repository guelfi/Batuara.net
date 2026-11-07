using Batuara.Application.MemberAuth.Models;

namespace Batuara.Application.MemberAuth.Services
{
    public interface IMemberAuthService
    {
        Task RequestCodeAsync(MemberRequestCodeRequest request, string? ipAddress, CancellationToken cancellationToken = default);
        Task<MemberLoginResponse> VerifyCodeAsync(MemberVerifyCodeRequest request, CancellationToken cancellationToken = default);
        Task<MemberLoginResponse> VerifyCodeAsync(MemberVerifyCodeRequest request, TimeSpan tokenLifetime, Func<int, CancellationToken, Task> precondition, CancellationToken cancellationToken = default);
    }
}
