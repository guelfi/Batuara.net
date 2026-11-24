namespace Batuara.Application.HouseMembers.Models
{
    public class MemberBroadcastPreviewDto
    {
        public string Campaign { get; set; } = string.Empty;
        public string MessagePreview { get; set; } = string.Empty;
        public int EligibleCount { get; set; }
        public int AlreadySent { get; set; }
        public int ExcludedInactive { get; set; }
        public int ExcludedNoPhone { get; set; }
        public int ExcludedNoOptIn { get; set; }
        public List<MemberBroadcastItemDto> Items { get; set; } = new();
    }

    public class MemberBroadcastItemDto
    {
        public int MemberId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool AlreadySent { get; set; }
    }

    public class MemberBroadcastSendRequest
    {
        public bool Confirmar { get; set; }
        public int[]? MemberIds { get; set; }
    }

    public class MemberBroadcastResultDto
    {
        public string Campaign { get; set; } = string.Empty;
        public int Sent { get; set; }
        public int Failed { get; set; }
        public int SkippedAlreadySent { get; set; }
        public List<MemberBroadcastErrorDto> Errors { get; set; } = new();
    }

    public class MemberBroadcastErrorDto
    {
        public int MemberId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
    }

    public class MemberBroadcastDeliveryDto
    {
        public int MemberId { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Error { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
