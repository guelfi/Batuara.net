using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    /// <summary>
    /// Registro de entrega de mensagem de campanha para um filho da Casa.
    /// Garante idempotencia: no maximo um registro por campanha + filho.
    /// </summary>
    public class MemberBroadcastDelivery : BaseEntity
    {
        public string Campaign { get; private set; } = string.Empty;
        public int HouseMemberId { get; private set; }
        public string PhoneE164 { get; private set; } = string.Empty;
        public string TemplateName { get; private set; } = string.Empty;
        public MemberBroadcastStatus Status { get; private set; }
        public string? WhatsAppMessageId { get; private set; }
        public string? Error { get; private set; }
        public DateTime? SentAt { get; private set; }

        private MemberBroadcastDelivery()
        {
        }

        private MemberBroadcastDelivery(string campaign, int houseMemberId, string phoneE164, string templateName)
        {
            Campaign = campaign;
            HouseMemberId = houseMemberId;
            PhoneE164 = phoneE164;
            TemplateName = templateName;
        }

        public static MemberBroadcastDelivery Sent(string campaign, int houseMemberId, string phoneE164, string templateName, string? whatsAppMessageId, DateTime sentAtUtc)
        {
            return new MemberBroadcastDelivery(campaign, houseMemberId, phoneE164, templateName)
            {
                Status = MemberBroadcastStatus.Sent,
                WhatsAppMessageId = whatsAppMessageId,
                SentAt = sentAtUtc
            };
        }

        public static MemberBroadcastDelivery Failed(string campaign, int houseMemberId, string phoneE164, string templateName, string error)
        {
            return new MemberBroadcastDelivery(campaign, houseMemberId, phoneE164, templateName)
            {
                Status = MemberBroadcastStatus.Failed,
                Error = error
            };
        }
    }
}
