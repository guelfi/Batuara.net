using Batuara.Application.HouseMembers.Models;

namespace Batuara.Application.HouseMembers.Services
{
    public interface IMemberBroadcastService
    {
        Task<MemberBroadcastPreviewDto> PreviewAsync(string campaign, CancellationToken cancellationToken = default);
        Task<MemberBroadcastResultDto> SendAsync(string campaign, bool confirmed, int[]? memberIds, CancellationToken cancellationToken = default);
        Task<List<MemberBroadcastDeliveryDto>> GetDeliveriesAsync(string campaign, CancellationToken cancellationToken = default);
    }
}
