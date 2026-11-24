using Batuara.Application.Common.PhoneNumbers;
using Batuara.Application.HouseMembers.Models;
using Batuara.Application.HouseMembers.Services;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Batuara.Infrastructure.HouseMembers.Services
{
    /// <summary>
    /// Campanhas de WhatsApp para filhos da Casa (PM-046/PM-047).
    /// Elegivel: filho ativo, com celular e opt-in registrado. Idempotente por campanha + filho.
    /// </summary>
    public class MemberBroadcastService : IMemberBroadcastService
    {
        public const string SiteLaunchCampaign = "site-launch";
        public const string SiteTutorialCampaign = "site-tutorial";

        private static readonly TimeSpan DefaultSendInterval = TimeSpan.FromMilliseconds(300);

        private readonly BatuaraDbContext _db;
        private readonly IWhatsAppService _whatsApp;
        private readonly WhatsAppCloudApiOptions _whatsAppOptions;
        private readonly MemberBroadcastOptions _options;
        private readonly ILogger<MemberBroadcastService> _logger;
        private readonly TimeSpan _sendInterval;

        public MemberBroadcastService(
            BatuaraDbContext db,
            IWhatsAppService whatsApp,
            IOptions<WhatsAppCloudApiOptions> whatsAppOptions,
            IOptions<MemberBroadcastOptions> options,
            ILogger<MemberBroadcastService> logger)
            : this(db, whatsApp, whatsAppOptions, options, logger, TimeSpan.FromMilliseconds(options.Value.SendIntervalMs))
        {
        }

        public MemberBroadcastService(
            BatuaraDbContext db,
            IWhatsAppService whatsApp,
            IOptions<WhatsAppCloudApiOptions> whatsAppOptions,
            IOptions<MemberBroadcastOptions> options,
            ILogger<MemberBroadcastService> logger,
            TimeSpan sendInterval)
        {
            _db = db;
            _whatsApp = whatsApp;
            _whatsAppOptions = whatsAppOptions.Value;
            _options = options.Value;
            _logger = logger;
            _sendInterval = sendInterval;
        }

        public async Task<MemberBroadcastPreviewDto> PreviewAsync(string campaign, CancellationToken cancellationToken = default)
        {
            EnsureKnownCampaign(campaign);
            var members = await LoadCandidatesAsync(cancellationToken);
            var sent = await SentMemberIdsAsync(campaign, cancellationToken);

            var dto = new MemberBroadcastPreviewDto
            {
                Campaign = campaign,
                MessagePreview = campaign == SiteTutorialCampaign ? _options.TutorialUrl : _options.SiteLaunchNotice,
                ExcludedInactive = members.Count(x => !x.IsActive),
                ExcludedNoPhone = members.Count(x => x.IsActive && string.IsNullOrWhiteSpace(x.MobilePhone)),
                ExcludedNoOptIn = members.Count(x => x.IsActive && !string.IsNullOrWhiteSpace(x.MobilePhone) && !x.WhatsAppOptIn)
            };

            foreach (var member in members.Where(IsEligible).OrderBy(x => x.FullName))
            {
                var alreadySent = sent.Contains(member.Id);
                dto.Items.Add(new MemberBroadcastItemDto
                {
                    MemberId = member.Id,
                    Name = member.FullName,
                    Phone = member.MobilePhone!,
                    AlreadySent = alreadySent
                });
                if (alreadySent)
                {
                    dto.AlreadySent++;
                }
                else
                {
                    dto.EligibleCount++;
                }
            }

            return dto;
        }

        public async Task<MemberBroadcastResultDto> SendAsync(string campaign, bool confirmed, int[]? memberIds, CancellationToken cancellationToken = default)
        {
            EnsureKnownCampaign(campaign);
            if (!confirmed)
            {
                throw new ArgumentException("Confirmação obrigatória para enviar a campanha.");
            }

            var members = (await LoadCandidatesAsync(cancellationToken)).Where(IsEligible).ToList();
            if (memberIds is { Length: > 0 })
            {
                var allowed = memberIds.ToHashSet();
                members = members.Where(x => allowed.Contains(x.Id)).ToList();
            }

            var sent = await SentMemberIdsAsync(campaign, cancellationToken);
            var result = new MemberBroadcastResultDto { Campaign = campaign };
            var first = true;

            foreach (var member in members)
            {
                if (sent.Contains(member.Id))
                {
                    result.SkippedAlreadySent++;
                    continue;
                }

                if (!first && _sendInterval > TimeSpan.Zero)
                {
                    await Task.Delay(_sendInterval, cancellationToken);
                }

                first = false;
                var phone = PhoneNumberNormalizer.NormalizeBrazilMobile(member.MobilePhone!);
                MemberBroadcastDelivery delivery;
                try
                {
                    var messageId = await SendCampaignMessageAsync(campaign, phone, member.FullName, cancellationToken);
                    delivery = MemberBroadcastDelivery.Sent(campaign, member.Id, phone, TemplateName(campaign), messageId, DateTime.UtcNow);
                    result.Sent++;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    delivery = MemberBroadcastDelivery.Failed(campaign, member.Id, phone, TemplateName(campaign), ex.Message);
                    result.Failed++;
                    result.Errors.Add(new MemberBroadcastErrorDto { MemberId = member.Id, Name = member.FullName, Error = ex.Message });
                    _logger.LogWarning(ex, "Falha ao enviar campanha {Campaign} para o filho {MemberId}", campaign, member.Id);
                }

                _db.MemberBroadcastDeliveries.Add(delivery);
                await _db.SaveChangesAsync(cancellationToken);
            }

            _logger.LogInformation("Campanha {Campaign}: {Sent} enviadas, {Failed} falhas, {Skipped} ignoradas", campaign, result.Sent, result.Failed, result.SkippedAlreadySent);
            return result;
        }

        public async Task<List<MemberBroadcastDeliveryDto>> GetDeliveriesAsync(string campaign, CancellationToken cancellationToken = default)
        {
            EnsureKnownCampaign(campaign);
            return await _db.MemberBroadcastDeliveries
                .Where(x => x.Campaign == campaign)
                .Join(_db.HouseMembers, d => d.HouseMemberId, m => m.Id, (d, m) => new MemberBroadcastDeliveryDto
                {
                    MemberId = m.Id,
                    MemberName = m.FullName,
                    Phone = d.PhoneE164,
                    Status = d.Status.ToString(),
                    Error = d.Error,
                    SentAt = d.SentAt
                })
                .OrderBy(x => x.MemberName)
                .ToListAsync(cancellationToken);
        }

        private async Task<List<HouseMember>> LoadCandidatesAsync(CancellationToken cancellationToken)
            => await _db.HouseMembers.ToListAsync(cancellationToken);

        private static bool IsEligible(HouseMember member)
            => member.IsActive && !string.IsNullOrWhiteSpace(member.MobilePhone) && member.WhatsAppOptIn;

        private async Task<HashSet<int>> SentMemberIdsAsync(string campaign, CancellationToken cancellationToken)
            => (await _db.MemberBroadcastDeliveries
                .Where(x => x.Campaign == campaign && x.Status == MemberBroadcastStatus.Sent)
                .Select(x => x.HouseMemberId)
                .ToListAsync(cancellationToken))
                .ToHashSet();

        private async Task<string> SendCampaignMessageAsync(string campaign, string phoneE164, string memberName, CancellationToken cancellationToken)
        {
            if (campaign == SiteTutorialCampaign)
            {
                return await _whatsApp.SendSiteTutorialLinkAsync(phoneE164, memberName, _options.TutorialUrl, cancellationToken);
            }

            return await _whatsApp.SendMemberNoticeAsync(phoneE164, memberName, _options.SiteLaunchNotice, cancellationToken);
        }

        private string TemplateName(string campaign)
            => campaign == SiteTutorialCampaign ? _whatsAppOptions.SiteTutorialTemplateName : _whatsAppOptions.MemberNoticeTemplateName;

        private static void EnsureKnownCampaign(string campaign)
        {
            if (campaign is not (SiteLaunchCampaign or SiteTutorialCampaign))
            {
                throw new ArgumentException($"Campanha desconhecida: {campaign}. Use '{SiteLaunchCampaign}' ou '{SiteTutorialCampaign}'.");
            }
        }
    }
}
